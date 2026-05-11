"use client";

import { useRef, useState } from "react";

const SYSTEM_MESSAGE = {
  role: "system",
  content:
    "You are a helpful, concise assistant. For images, describe only what is needed. Keep answers short.",
};

const MAX_PROMPT_CHARS = 2000;

/**
 * Downscale and JPEG-compress in the browser to shrink the request body
 * (vision still uses OpenAI `detail: "low"` on the server).
 */
async function fileToLowResDataUrl(file) {
  const maxSide = 512;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not use canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.62);
}

function MessageBody({ message }) {
  const { role, content } = message;

  if (typeof content === "string") {
    const mdImg = /^!\[([^\]]*)\]\(([^)]+)\)$/;
    const m = content.trim().match(mdImg);
    if (m && (m[2].startsWith("http") || m[2].startsWith("data:image"))) {
      return (
        <div className="space-y-2">
          {m[1] ? <p className="text-zinc-600 dark:text-zinc-300">{m[1]}</p> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m[2]}
            alt={m[1] || "Generated"}
            className="max-h-64 max-w-full rounded-md border border-zinc-200 dark:border-zinc-700"
          />
        </div>
      );
    }
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  if (Array.isArray(content)) {
    return (
      <div className="space-y-2">
        {content.map((part, i) => {
          if (part?.type === "text" && part.text) {
            return (
              <p key={i} className="whitespace-pre-wrap">
                {part.text}
              </p>
            );
          }
          if (part?.type === "image_url" && part.image_url?.url) {
            return (
              <div key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={part.image_url.url}
                  alt="Attached"
                  className="max-h-48 max-w-full rounded-md border border-zinc-200 dark:border-zinc-700"
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return <span className="text-zinc-400">(empty)</span>;
}

export default function Home() {
  const [messages, setMessages] = useState([SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("chat");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    setImageFile(f ?? null);
    setImagePreview("");
    if (!f || !f.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(f);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function sendChat() {
    const trimmed = input.trim().slice(0, MAX_PROMPT_CHARS);
    if (loading) return;
    if (mode === "generate") {
      if (!trimmed) return;
      await sendGenerate(trimmed);
      return;
    }
    if (!trimmed && !imageFile) return;

    setError("");
    let userMessage;

    if (imageFile) {
      let dataUrl;
      try {
        dataUrl = await fileToLowResDataUrl(imageFile);
      } catch (e) {
        setError(e?.message ?? "Could not read image");
        return;
      }
      const textPart = trimmed || "Describe this image briefly.";
      userMessage = {
        role: "user",
        content: [
          { type: "text", text: textPart },
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "low" },
          },
        ],
      };
    } else {
      userMessage = { role: "user", content: trimmed };
    }

    const payload = [...messages, userMessage];
    setMessages(payload);
    setInput("");
    clearImage();
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

  async function sendGenerate(prompt) {
    setError("");
    setLoading(true);
    setInput("");
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Image generation failed");
      }
      const url = data.url;
      if (!url) throw new Error("No image URL returned");

      const userLine = { role: "user", content: `[Generate image] ${prompt}` };
      const assistantLine = {
        role: "assistant",
        content: `![Generated](${url})`,
      };
      setMessages((prev) => [...prev, userLine, assistantLine]);
    } catch (e) {
      setError(e.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const visible = messages.filter((m) => m.role !== "system");
  const canSend =
    mode === "generate"
      ? input.trim().length > 0 && !loading
      : (input.trim().length > 0 || !!imageFile) && !loading;

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Diego&apos;s Chat
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Chat uses low vision detail and a short reply cap. Image generation uses the
          smallest API size / lowest quality supported for the configured model.
        </p>
      </header>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === "chat"}
            onChange={() => setMode("chat")}
            disabled={loading}
          />
          Chat / describe image
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="mode"
            checked={mode === "generate"}
            onChange={() => setMode("generate")}
            disabled={loading}
          />
          Generate image
        </label>
      </div>

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
              <li key={i}>
                <span className="font-medium text-zinc-500 dark:text-zinc-400">
                  {m.role === "user" ? "You" : "Assistant"}:{" "}
                </span>
                <MessageBody message={m} />
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

      {mode === "chat" ? (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-600">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Optional image (JPEG preview, sent at low resolution + low API detail)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onPickFile}
              disabled={loading}
              className="max-w-full text-xs"
            />
            {imageFile ? (
              <button
                type="button"
                onClick={clearImage}
                className="text-xs text-red-600 underline dark:text-red-400"
              >
                Remove
              </button>
            ) : null}
          </div>
          {imagePreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 max-w-xs rounded border border-zinc-200 dark:border-zinc-700"
            />
          ) : null}
        </div>
      ) : null}

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void sendChat();
        }}
      >
        <input
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-foreground outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_PROMPT_CHARS))}
          placeholder={
            mode === "generate"
              ? "Describe the image to generate…"
              : "Message (required if no image)…"
          }
          autoComplete="off"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Working…" : mode === "generate" ? "Generate" : "Send"}
        </button>
      </form>
    </div>
  );
}
