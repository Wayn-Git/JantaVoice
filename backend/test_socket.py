import asyncio
import websockets
import json

async def test_extension_simulation():
    uri = "ws://localhost:8000/ws"
    print(f"Connecting to {uri}...")
    
    async with websockets.connect(uri) as websocket:
        print("Connected!")
        
        # Simulate "Extension" sending page state
        state = {
            "url": "https://www.youtube.com/",
            "title": "YouTube Home",
            "page_type": "feed",
            "visible_text": "Recommended: Minecraft Prank, Python Tutorial, Gaming Highlights...",
            "user_task": "Study Python"
        }
        
        print(f"Sending State: {state['user_task']} on {state['title']}")
        await websocket.send(json.dumps(state))
        
        # Wait for "Backend" push response
        response = await websocket.recv()
        print(f"\n📨 Raw Response:\n{response}\n")
        
        data = json.loads(response)
        print(f"📋 Decision: {data.get('decision', 'N/A')} (Confidence: {data.get('confidence', 'N/A')})")
        
        if "actions" in data and len(data["actions"]) > 0:
            print("✅ Actions Received:")
            for i, action in enumerate(data["actions"], 1):
                print(f"\n   [{i}] Type: {action['type']}")
                if action.get('filter_rule'):
                    print(f"       Filter: {action['filter_rule']['match']} → {action['filter_rule']['values']}")
                if action.get('warning'):
                    print(f"       Warning: [{action['warning']['severity']}] {action['warning']['message']}")
                if action.get('reason'):
                    print(f"       Reason: {action['reason']}")

if __name__ == "__main__":
    asyncio.run(test_extension_simulation())
