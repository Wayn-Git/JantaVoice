import os
import json
import traceback
from datetime import datetime
from collections import deque
from groq import Groq
from dotenv import load_dotenv
from models import (
    ExtensionState, WebSocketMessage, Action, 
    FilterRule, HideRule, WarningData, RedirectData
)

load_dotenv()

# Redirect URLs based on task keywords
REDIRECT_URLS = {
    "python": "https://www.youtube.com/results?search_query=python+tutorial",
    "java": "https://www.youtube.com/results?search_query=java+tutorial",
    "javascript": "https://www.youtube.com/results?search_query=javascript+tutorial", 
    "cpp": "https://www.youtube.com/results?search_query=cpp+tutorial",
    "c++": "https://www.youtube.com/results?search_query=cpp+tutorial",
    "coding": "https://www.youtube.com/results?search_query=programming+tutorial",
    "study": "https://www.youtube.com/results?search_query=study+with+me",
    "math": "https://www.youtube.com/results?search_query=math+tutorial",
    "default": "https://docs.python.org/3/"
}

def get_redirect_url(task: str) -> str:
    """Get appropriate redirect URL based on user's task."""
    task_lower = task.lower()
    for keyword, url in REDIRECT_URLS.items():
        if keyword in task_lower:
            return url
    return REDIRECT_URLS["default"]

class ClassifierService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("groq_api_key")
        if not self.api_key:
            print("Warning: GROQ_API_KEY not found.")
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)
        
        # Context window
        self.history = deque(maxlen=5)
        self.last_decisions = deque(maxlen=5)

    def _build_context_window(self) -> str:
        if not self.history:
            return "No previous browsing history in this session."
        
        context_lines = []
        for i, entry in enumerate(self.history, 1):
            decision_info = self.last_decisions[i-1] if i <= len(self.last_decisions) else "unknown"
            context_lines.append(f"  {i}. [{entry['time']}] {entry['title'][:40]} → {decision_info}")
        
        return "\n".join(context_lines)

    def process_state(self, state: ExtensionState) -> WebSocketMessage:
        if not self.client:
            return WebSocketMessage(actions=[], decision="allow", confidence=0.0)

        context_window = self._build_context_window()
        
        # Strictness rules
        strictness_rules = {
            "medium": "Give 3 warnings before blocking. Be lenient with tangentially related content.",
              "strict": "Give 1 warning before blocking. Be firm with off-task content.",
            "very_strict": "NO warnings. Immediately redirect distracting pages. Zero tolerance."
        }
        
        warnings_before_block = {"medium": 3, "strict": 1, "very_strict": 0}
        max_warnings = warnings_before_block.get(state.strictness, 3)
        
        system_prompt = f"""You are a Productivity Guardian AI. Your job is to BLOCK distractions and help the user focus.

USER'S TASK: "{state.user_task}"
STRICTNESS: {state.strictness.upper()} ({strictness_rules.get(state.strictness)})
WARNINGS SO FAR: {state.warning_count}/{max_warnings}

CURRENT PAGE:
- URL: {state.url}
- Title: {state.title}
- Type: {state.page_type}

CLASSIFICATION RULES (Apply in order):

1. ALWAYS ALLOW (Productive Tools):
   - Search engines (Google, Bing, DuckDuckGo)
   - Documentation sites (GitHub, StackOverflow, MDN, docs.*)
   - Educational platforms (Khan Academy, Coursera, etc.)
   - Work tools (Gmail, Calendar, Notion, etc.)
   
2. CLEAN & FILTER (Feeds - don't block, just clean):
   - YouTube Homepage → hide_elements + filter_videos
   - Twitter/X Feed → hide_elements
   
3. WARN OR BLOCK (Entertainment - this is a DISTRACTION):
   - YouTube Videos about: Music, Gaming, Comedy, Vlogs, Sports, Movies, TV Shows
   - Social media posts (Twitter, Instagram, TikTok, Reddit)
   - News sites (unless task is "News" or "Research")
   - Streaming (Netflix, Twitch, etc.)
   
4. SPECIAL CASES:
   - URL contains "list=RD" → Music Mix → WARN
   - Entertainment channels (MrBeast, Dude Perfect, etc.) → WARN
   - If task is "General Work" → Be VERY strict, assume user wants to work

DECISION LOGIC:
- If ALWAYS ALLOW → {{"decision": "allow", "actions": []}}
- If FEED → {{"decision": "filter", "actions": [hide_elements, filter_videos]}}
- If DISTRACTION and warnings < {max_warnings} → {{"decision": "warn", "actions": [{{"type": "show_warning", "warning": {{...}}}}]}}
- If DISTRACTION and warnings >= {max_warnings} → {{"decision": "redirect", "actions": [{{"type": "redirect", "redirect": {{...}}}}]}}

OUTPUT FORMAT (JSON only):
{{
  "decision": "allow" | "warn" | "filter" | "redirect",
  "confidence": 0.0-1.0,
  "actions": [...]
}}

IMPORTANT:
- For filter_videos, match must be: "title_contains", "channel_contains", "description_contains", or "title_does_not_contain"
- For warnings, be friendly but firm: "Hey! This isn't work. Back to [task]?"
- For YouTube feed filtering, use "title_does_not_contain" with keywords from task
- Respond ONLY with valid JSON"""



        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "system", "content": system_prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            
            content = chat_completion.choices[0].message.content
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            result_json = json.loads(content)
            
            # Parse actions
            actions = []
            for action_data in result_json.get("actions", []):
                action_type = action_data.get("type", "allow")
                
                action = Action(
                    type=action_type,
                    reason=action_data.get("reason"),
                    filter_rule=FilterRule(**action_data["filter_rule"]) if action_data.get("filter_rule") else None,
                    hide_rule=HideRule(**action_data["hide_rule"]) if action_data.get("hide_rule") else None,
                    warning=WarningData(**action_data["warning"]) if action_data.get("warning") else None,
                    redirect=RedirectData(**action_data["redirect"]) if action_data.get("redirect") else None
                )
                actions.append(action)
            
            decision = result_json.get("decision", "allow")
            
            # Add to history
            self.history.append({
                "url": state.url,
                "title": state.title,
                "page_type": state.page_type,
                "time": datetime.now().strftime("%H:%M:%S")
            })
            self.last_decisions.append(decision)
            
            # Safely handle request_id
            req_id = state.request_id if state.request_id else "unknown"
            
            return WebSocketMessage(
                request_id=req_id,
                actions=actions,
                decision=decision,
                confidence=result_json.get("confidence", 1.0)
            )

        except Exception as e:
            print(f"LLM Error: {e}")
            traceback.print_exc()
            # Return allow with original request_id to avoid frontend queue lock
            req_id = state.request_id if hasattr(state, 'request_id') and state.request_id else "unknown"
            return WebSocketMessage(
                request_id=req_id, 
                actions=[], 
                decision="allow", 
                confidence=0.0
            )
