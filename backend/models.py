from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# --- INPUT: Data sent FROM Extension via WebSocket ---
class ExtensionState(BaseModel):
    request_id: Optional[str] = Field(None, description="Unique ID for this request to handle async ordering")
    url: str
    title: str = "Unknown Page"
    page_type: str = Field("unknown", description="video, feed, article, social, search, other")
    visible_text: str = Field("", description="Short snippet for context")
    user_task: str = Field("General Work", description="The user's current goal")
    strictness: Literal["medium", "strict", "very_strict"] = "medium"
    warning_count: int = Field(0, description="Number of warnings given this session")

# --- SEMANTIC RULES ---
class FilterRule(BaseModel):
    """Rule for filterlng video/content cards"""
    match: Literal["title_contains", "channel_contains", "description_contains", "any", "title_does_not_contain"]
    values: List[str] = Field(..., description="Keywords to filter, e.g. ['gaming', 'prank']")

class HideRule(BaseModel):
    """Rule for hiding DOM elements"""
    selectors: List[str] = Field(..., description="CSS selectors to hide")

class WarningData(BaseModel):
    """Warning overlay configuration"""
    message: str = Field(..., description="Warning message to display")
    severity: Literal["low", "medium", "high", "critical"] = "medium"

class RedirectData(BaseModel):
    """Redirect configuration"""
    url: str = Field(..., description="URL to redirect to")
    reason: str = Field("", description="Reason for redirect")

# --- ACTION: Single action to execute ---
class Action(BaseModel):
    type: Literal["allow", "filter_videos", "hide_elements", "show_warning", "close_tab", "redirect"]
    filter_rule: Optional[FilterRule] = None
    hide_rule: Optional[HideRule] = None
    warning: Optional[WarningData] = None
    redirect: Optional[RedirectData] = None
    reason: Optional[str] = None

# --- OUTPUT: Data sent TO Extension via WebSocket ---
class WebSocketMessage(BaseModel):
    request_id: Optional[str] = Field(None, description="Echo back the request ID")
    actions: List[Action]
    decision: Literal["allow", "warn", "filter", "block", "redirect"] = "allow"
    confidence: float = Field(1.0, ge=0.0, le=1.0)
