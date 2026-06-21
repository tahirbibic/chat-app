"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Message = {
  username: string;
  text: string;
};

const C = {
  prussian: "#0b132b",
  indigo: "#1c2541",
  dusk: "#3a506b",
  text: "#FAFAFA",
  muted: "#A1A1AA",
  border: "#2a3450",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [myUsername, setMyUsername] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username") || "";
    if (!token) {
      router.push("/login");
      return;
    }
    setMyUsername(username);

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    return () => ws.close();
  }, [router]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(input);
    setInput("");
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: C.prussian, color: C.text }}>
      <header className="flex justify-between items-center px-4 sm:px-6 py-4 border-b shrink-0" style={{ backgroundColor: C.indigo, borderColor: C.border }}>
        <h1 className="text-lg sm:text-xl font-bold">ChatRoom</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm truncate max-w-[120px]" style={{ color: C.muted }}>@{myUsername}</span>
          <button onClick={logout} className="text-sm px-3 py-1 rounded-lg transition" style={{ backgroundColor: C.dusk, color: C.text }}>
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {messages.map((msg, i) => {
          const isMine = msg.username === myUsername;
          const isSystem = msg.username === "System";

          if (isSystem) {
            return (
              <div key={i} className="text-center text-xs italic" style={{ color: C.muted }}>
                {msg.text}
              </div>
            );
          }

          return (
            <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] sm:max-w-md px-4 py-2 rounded-2xl"
                style={{
                  backgroundColor: isMine ? C.dusk : C.indigo,
                  color: C.text,
                  borderBottomRightRadius: isMine ? "4px" : undefined,
                  borderBottomLeftRadius: !isMine ? "4px" : undefined,
                }}
              >
                {!isMine && <p className="text-xs mb-1 font-medium" style={{ color: C.muted }}>{msg.username}</p>}
                <p className="break-words">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 px-4 sm:px-6 py-4 border-t shrink-0" style={{ backgroundColor: C.indigo, borderColor: C.border }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 min-w-0 p-3 rounded-xl focus:outline-none transition"
          style={{ backgroundColor: C.prussian, color: C.text, border: `1px solid ${C.border}` }}
        />
        <button type="submit" className="px-4 sm:px-6 rounded-xl font-medium transition shrink-0" style={{ backgroundColor: C.dusk, color: C.text }}>
          Send
        </button>
      </form>
    </div>
  );
}