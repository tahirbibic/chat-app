# Real-Time Chat

A full-stack real-time chat application built with FastAPI WebSockets and Next.js.
Users register, log in, and exchange messages instantly — messages are broadcast live to all connected clients and persisted in PostgreSQL so chat history survives reconnects.

## Features
- Real-time messaging over WebSockets (no refresh, instant delivery)
- JWT authentication (register / login)
- Message history persisted in PostgreSQL
- Live "user left" system notifications
- Responsive UI (works on mobile and desktop)

## Tech Stack
**Backend**
- FastAPI (WebSockets + REST)
- PostgreSQL + SQLAlchemy ORM
- JWT auth (python-jose) + bcrypt password hashing

**Frontend**
- Next.js (App Router, TypeScript)
- Tailwind CSS

## How It Works
1. User registers and logs in via REST endpoints, receiving a JWT token.
2. The frontend opens a WebSocket connection, passing the token in the URL.
3. The server decodes the token to identify the user (the username comes from the signed token, not from untrusted input).
4. When a user sends a message, the server saves it to the database and broadcasts it to every connected client.
5. New clients receive the full message history on connect.

## API / WebSocket Endpoints

| Type      | Endpoint        | Description                          |
|-----------|-----------------|--------------------------------------|
| POST      | `/register`     | Create a new account                 |
| POST      | `/login`        | Log in, returns a JWT token          |
| WebSocket | `/ws/{token}`   | Connect to the chat (token required) |

## Design Decisions
- **Token in the WebSocket URL, not a username**: the username is extracted from the signed JWT, so a user cannot impersonate someone else by typing a different name.
- **Connection manager**: the server keeps a list of active connections so it can broadcast a message to everyone at once.
- **Messages persisted**: chat history is stored in the database, so users who join later still see past messages.

## Running Locally

### Backend
1. Create a PostgreSQL database
2. Set `DATABASE_URL` and `SECRET_KEY` in `chat-backend/.env`
3. `cd chat-backend`
4. `pip install -r requirements.txt`
5. `uvicorn main:app --reload`
