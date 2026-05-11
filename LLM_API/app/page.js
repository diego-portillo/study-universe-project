"use client";

import { useState } from "react";

const SYSTEM_MESSAGE = {
  role: "system",
  content:
    "You are a helpful, concise assistant. Answer clearly and directly.",
};

export default function Home() {
  const [messages, setMessages] = useState([SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError("");
    const userMessage = { role: "user", content: trimmed };
    const payload = [...messages, userMessage];

    setMessages(payload);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not reach the assistant");
      }

      setMessages((prev) => [...prev, data.message]);
    } catch (e) {
      setError(e.message ?? "Request failed");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  const visible = messages.filter((m) => m.role !== "system");

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Diego's Chat
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Messages are sent to your Next.js API route, which calls OpenAI with
          the full conversation history.
        </p>
      </header>

      <section
        aria-live="polite"
        className="min-h-[12rem] flex-1 rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      >
        {visible.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">
            Your conversation will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {visible.map((m, i) => (
              <li key={i} className="whitespace-pre-wrap">
                <span className="font-medium text-zinc-500 dark:text-zinc-400">
                  {m.role === "user" ? "You" : "Assistant"}:{" "}
                </span>
                {m.content ?? ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
      >
        <input
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-foreground outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message…"
          autoComplete="off"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
