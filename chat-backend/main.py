from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base, get_db
import models, auth
import bcrypt
import json
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal, Base
import models

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tahirs-chat-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    username = auth.decode_token(token)
    if username is None:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket)

    db = SessionLocal()
    history = db.query(models.Message).order_by(models.Message.created_at).all()
    db.close()
    for msg in history:
        await websocket.send_text(json.dumps({"username": msg.username, "text": msg.text}))

    try:
        while True:
            data = await websocket.receive_text()

            db = SessionLocal()
            new_msg = models.Message(username=username, text=data)
            db.add(new_msg)
            db.commit()
            db.close()

            message = json.dumps({"username": username, "text": data})
            await manager.broadcast(message)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({"username": "System", "text": f"{username} left"}))

@app.post("/register")
def register(username: str, password: str, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username taken")
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    new_user = models.User(username=username, pw_hash=pw_hash.decode())
    db.add(new_user)
    db.commit()
    return {"message": "Registered"}


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if user is None or not bcrypt.checkpw(form_data.password.encode(), user.pw_hash.encode()):
        raise HTTPException(status_code=401, detail="Wrong credentials")
    token = auth.create_token(user.username)
    return {"access_token": token, "token_type": "bearer"}