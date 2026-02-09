import sys
import os
# Ensure we can import from local directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services import ClassifierService
from models import ExtensionData

def test_mailbox():
    print("--- Testing Mailbox Classifier ---")
    classifier = ClassifierService()
    
    # 1. Simulate YouTube (Entertainment)
    print("\n[Case 1] YouTube (Entertainment)")
    data1 = ExtensionData(
        url="https://youtube.com/watch?v=123",
        title="Funny Cat Compilation",
        page_type="video",
        visible_text="Hilarious cats failing...",
        user_task="Study Math",
        intervention_mode="hard"
    )
    
    response1 = classifier.analyze(data1)
    if "Error" in response1.reasoning:
        print(f"!!! DIAGNOSTIC FAILURE !!! response1.reasoning: {response1.reasoning}")
    print(f"Decision: {response1.decision}")
    print(f"Reasoning: {response1.reasoning}")
    print("Actions:")
    for act in response1.actions:
        print(f"  - {act.tool_name}({act.parameters})")

    # 2. Simulate StackOverflow (Productive)
    print("\n[Case 2] StackOverflow (Productive)")
    data2 = ExtensionData(
        url="https://stackoverflow.com/questions/123",
        title="How to center a div",
        page_type="educational",
        visible_text="Use flexbox justify-content center...",
        user_task="Fix CSS Bug",
        intervention_mode="medium"
    )
    
    response2 = classifier.analyze(data2)
    print(f"Decision: {response2.decision}")
    print(f"Reasoning: {response2.reasoning}")
    print("Actions:")
    for act in response2.actions:
        print(f"  - {act.tool_name}({act.parameters})")

    # 3. Simulate Unknown News Site (Universal Test)
    print("\n[Case 3] Random News Site (Unknown)")
    data3 = ExtensionData(
        url="https://some-random-news.com/article/123",
        title="Celebrity Gossip and News",
        page_type="article",
        visible_text="Latest celebrity gossip... Sidebars full of ads...",
        user_task="Study Math",
        intervention_mode="medium"
    )
    
    response3 = classifier.analyze(data3)
    print(f"Decision: {response3.decision}")
    print(f"Reasoning: {response3.reasoning}")
    print("Actions:")
    for act in response3.actions:
        print(f"  - {act.tool_name}({act.parameters})")

    # 4. Simulate Reddit (Specific)
    print("\n[Case 4] Reddit (Entertainment)")
    data4 = ExtensionData(
        url="https://www.reddit.com/r/funny/comments/123",
        title="Funny Post : r/funny",
        page_type="post",
        visible_text="Some funny meme content...",
        user_task="Study Math",
        intervention_mode="medium"
    )
    response4 = classifier.analyze(data4)
    for act in response4.actions:
        print(f"  - {act.tool_name}({act.parameters})")

    # 5. Simulate Twitter (Specific)
    print("\n[Case 5] Twitter/X (Home)")
    data5 = ExtensionData(
        url="https://twitter.com/home",
        title="Home / X",
        page_type="feed",
        visible_text="User tweets and trends...",
        user_task="Study Math",
        intervention_mode="medium"
    )
    response5 = classifier.analyze(data5)
    for act in response5.actions:
        print(f"  - {act.tool_name}({act.parameters})")

if __name__ == "__main__":
    test_mailbox()
