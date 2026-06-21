"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  prussian: "#0b132b",
  indigo: "#1c2541",
  dusk: "#3a506b",
  text: "#FAFAFA",
  muted: "#A1A1AA",
  border: "#2a3450",
};

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      { method: "POST" }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.detail || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: C.prussian, color: C.text }}>
      <form onSubmit={handleRegister} className="w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl" style={{ backgroundColor: C.indigo, border: `1px solid ${C.border}` }}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Join the chat</h1>
        <p className="text-center text-sm mb-6" style={{ color: C.muted }}>Create your account</p>
        {error && <p className="text-sm mb-4 text-center" style={{ color: "#F87171" }}>{error}</p>}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl focus:outline-none transition"
          style={{ backgroundColor: C.prussian, color: C.text, border: `1px solid ${C.border}` }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 rounded-xl focus:outline-none transition"
          style={{ backgroundColor: C.prussian, color: C.text, border: `1px solid ${C.border}` }}
        />
        <button type="submit" className="w-full p-3 rounded-xl font-medium transition" style={{ backgroundColor: C.dusk, color: C.text }}>
          Sign up
        </button>
        <p className="text-center text-sm mt-4" style={{ color: C.muted }}>
          Have an account?{" "}
          <button type="button" onClick={() => router.push("/login")} style={{ color: C.dusk }} className="hover:underline">
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}