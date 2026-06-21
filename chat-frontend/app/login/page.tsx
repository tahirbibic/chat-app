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

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!res.ok) {
      setError("Wrong username or password");
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("username", username);
    router.push("/");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: C.prussian, color: C.text }}
    >
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm p-6 sm:p-8 rounded-2xl shadow-2xl"
        style={{ backgroundColor: C.indigo, border: `1px solid ${C.border}` }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Welcome back</h1>
        <p className="text-center text-sm mb-6" style={{ color: C.muted }}>
          Log in to continue
        </p>
        {error && (
          <p className="text-sm mb-4 text-center" style={{ color: "#F87171" }}>
            {error}
          </p>
        )}
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
        <button
          type="submit"
          className="w-full p-3 rounded-xl font-medium transition"
          style={{ backgroundColor: C.dusk, color: C.text }}
        >
          Log in
        </button>
        <p className="text-center text-sm mt-4" style={{ color: C.muted }}>
          No account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            style={{ color: C.dusk }}
            className="hover:underline"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
}