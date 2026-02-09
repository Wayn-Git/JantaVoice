from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from models import ExtensionState
from services import ClassifierService
import uvicorn
import json

classifier = ClassifierService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Productivity Engine Online (WebSockets Enabled).")
    yield

app = FastAPI(title="Productivity Socket API", version="2.0.0", lifespan=lifespan)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Extension Connected.")
    try:
        while True:
            # 1. Receive State from Extension
            data = await websocket.receive_text()
            try:
                state_dict = json.loads(data)
                # Map incoming JSON to our Pydantic Model
                state = ExtensionState(**state_dict)
                
                # 2. Process with LLM
                response_msg = classifier.process_state(state)
                
                # 3. Push Actions back immediately
                await websocket.send_text(response_msg.model_dump_json())
                
            except Exception as e:
                print(f"Processing Error: {e}")
                # Optional: Send error back or just log
                
    except WebSocketDisconnect:
        print("Extension Disconnected.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
