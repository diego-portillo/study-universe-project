"use client";

import { ChangeEvent, useEffect, useRef, useState, KeyboardEvent } from "react";

type Mode = "chat" | "generate" | "text_to_sound";
type SpeechVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

type TextPart = { type: "text"; text: string };
type ImageUrlPart = { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };
type MessageContent = string | Array<TextPart | ImageUrlPart>;
type Message = { role: "system" | "user" | "assistant"; content: MessageContent };

const SYSTEM_MESSAGE: Message = {
  role: "system",
  content: "You are a helpful, concise assistant. Keep answers short. For audio only transcribe.",
};

const MAX_PROMPT_CHARS = 2000;
const MAX_AUDIO_LENGTH = 60;

function getTextContent(content: MessageContent): string {
  if (typeof content === "string") return content;
  return content.filter((p) => p.type === "text").map((p) => (p as TextPart).text).join(" ");
}

function hasImage(content: MessageContent): boolean {
  if (typeof content === "string") return false;
  return content.some((p) => p.type === "image_url");
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("chat");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [audioName, setAudioName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState("");
  const [voice, setVoice] = useState<SpeechVoice>("alloy");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const visibleMessages = messages.filter((m) => m.role !== "system");
  const isEmpty = visibleMessages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => { if (audioPreview) URL.revokeObjectURL(audioPreview); };
  }, [audioPreview]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setGeneratedImageUrl("");
    setGeneratedAudioUrl("");
    clearImage();
    clearAudio();
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function clearAudio() {
    setAudioFile(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview("");
    setAudioName("");
    if (audioRef.current) audioRef.current.value = "";
  }

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview("");
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  async function onPickAudio(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(file);
    await new Promise<void>((r) => { audio.onloadedmetadata = () => r(); });
    if (audio.duration > MAX_AUDIO_LENGTH) {
      setError("Audio too long (max 60s)");
      return;
    }
    setAudioFile(file);
    setAudioPreview(audio.src);
    setAudioName(file.name);
    setError("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (mode === "generate") return generateImage();
    if (mode === "text_to_sound") return handleAudio();
    return sendChat();
  }

  async function generateImage() {
    if (loading) return;
    const trimmed = input.trim();
    if (!trimmed && !imageFile) return;
    setLoading(true);
    setError("");
    setGeneratedImageUrl("");
    try {
      if (imageFile) {
        const dataUrl = await fileToLowResDataUrl(imageFile);
        const userMessage: Message = {
          role: "user",
          content: [
            { type: "text", text: trimmed || "Describe this image in detail." },
            { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
          ],
        };
        const payload = [SYSTEM_MESSAGE, userMessage];
        const res = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({ messages: payload }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Analysis failed");
        setGeneratedImageUrl(dataUrl);
        setMessages([SYSTEM_MESSAGE, userMessage, data.message]);
        setInput("");
        clearImage();
      } else {
        const res = await fetch("/api/image", {
          method: "POST",
          body: JSON.stringify({ prompt: trimmed }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Image generation failed");
        setGeneratedImageUrl(data.url);
        setInput("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAudio() {
    if (loading) return;
    const trimmed = input.trim();

    if (audioFile) {
      setLoading(true);
      setError("");
      try {
        const formData = new FormData();
        formData.append("audio", audioFile);
        const res = await fetch("/api/sound_to_text", {
          method: "POST",
          body: formData,
          // no Content-Type header — browser sets it with boundary automatically
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Transcription failed");
        setMessages((prev) => [
          ...prev,
          { role: "user", content: `[Audio: ${audioName}]` },
          { role: "assistant", content: data.text },
        ]);
        clearAudio();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!trimmed) return;
    setLoading(true);
    setError("");
    setGeneratedAudioUrl("");
    try {
      const res = await fetch("/api/text_to_sound", {
        method: "POST",
        body: JSON.stringify({ text: trimmed, voice }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "TTS failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);
      setInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function sendChat() {
    if (loading) return;
    const trimmed = input.trim().slice(0, MAX_PROMPT_CHARS);
    if (!trimmed && !imageFile) return;
    setLoading(true);
    setError("");
    try {
      let userMessage: Message;
      if (imageFile) {
        const dataUrl = await fileToLowResDataUrl(imageFile);
        userMessage = {
          role: "user",
          content: [
            { type: "text", text: trimmed || "Describe this image." },
            { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
          ],
        };
      } else {
        userMessage = { role: "user", content: trimmed };
      }
      const payload = [...messages, userMessage];
      setMessages(payload);
      setInput("");
      clearImage();
      const conversationId = "user-1"; // later replace with uuid or auth id
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: payload ,
          conversationId,
        }),
        headers: { 
          "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [...prev, data.message]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function fileToLowResDataUrl(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const max = 512;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width * scale;
    canvas.height = bitmap.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas error");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.6);
  }

  const canSend =
    mode === "chat" ? (!loading && (!!input.trim() || !!imageFile)) :
    mode === "generate" ? (!loading && (!!input.trim() || !!imageFile)) :
    (!loading && (!!input.trim() || !!audioFile));

  const placeholder =
    mode === "chat" ? "Ask anything..." :
    mode === "generate" ? (imageFile ? "Ask something about the image..." : "Describe the image to generate...") :
    (audioFile ? "Audio ready — hit send to transcribe" : "Enter text to convert to speech...");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0d0d0d;
          --surface: #1a1a1a;
          --surface2: #242424;
          --border: #2e2e2e;
          --text: #ececec;
          --text-muted: #888;
          --user-bg: #1e1e1e;
          --input-bg: #1c1c1c;
          --send-bg: #ffffff;
          --send-color: #000;
          --send-disabled: #2a2a2a;
          --send-disabled-color: #555;
          --radius: 16px;
          --font: 'Sora', sans-serif;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          font-size: 15px;
          line-height: 1.6;
          height: 100vh;
          overflow: hidden;
        }

        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 760px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .header-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #3bff7e;
          display: inline-block;
          margin-right: 8px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .header-title { font-size: 15px; font-weight: 500; letter-spacing: -0.01em; }

        /* centered tabs */
        .mode-tabs {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .tab {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 6px 20px;
          font-size: 13px;
          font-family: var(--font);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tab:hover { color: var(--text); background: var(--surface2); }
        .tab.active { background: var(--surface2); border-color: var(--border); color: var(--text); }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 16px;
          scroll-behavior: smooth;
        }

        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-track { background: transparent; }
        .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 8px;
          text-align: center;
          padding: 24px;
          animation: fadeIn 0.4s ease;
        }

        .empty-title { font-size: 26px; font-weight: 600; letter-spacing: -0.03em; }
        .empty-sub { font-size: 14px; color: var(--text-muted); font-weight: 300; }

        .msg-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .msg-row.user { flex-direction: row-reverse; }

        .avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
        }

        .avatar.user { background: #fff; color: #000; }
        .avatar.assistant { background: var(--surface2); color: var(--text-muted); border: 1px solid var(--border); }

        .bubble {
          max-width: 78%;
          padding: 12px 16px;
          border-radius: var(--radius);
          font-size: 14.5px;
          line-height: 1.65;
          word-break: break-word;
        }

        .bubble.user { background: var(--user-bg); border: 1px solid var(--border); border-top-right-radius: 4px; }
        .bubble.assistant { border-top-left-radius: 4px; padding-left: 4px; }

        .bubble-image {
          max-width: 260px;
          border-radius: 10px;
          margin-top: 8px;
          display: block;
          border: 1px solid var(--border);
        }

        .typing { display: flex; align-items: center; gap: 4px; padding: 14px 4px; }
        .typing-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: bounce 1.2s ease infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        .output-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          padding: 24px;
          text-align: center;
          animation: fadeIn 0.3s ease;
        }

        .generated-img {
          max-width: 100%;
          max-height: 440px;
          border-radius: 14px;
          border: 1px solid var(--border);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .audio-player { width: 100%; max-width: 480px; accent-color: #3bff7e; }

        .output-label {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .analysis-text {
          color: var(--text-muted);
          font-size: 13px;
          max-width: 480px;
          line-height: 1.6;
        }

        .input-area {
          flex-shrink: 0;
          padding: 16px;
          padding-bottom: 24px;
        }

        .input-wrapper {
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 12px 10px 16px;
          transition: border-color 0.15s ease;
        }

        .input-wrapper:focus-within { border-color: #444; }

        .attachment-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 6px 10px;
        }

        .preview-thumb {
          width: 44px; height: 44px;
          border-radius: 7px;
          object-fit: cover;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .audio-icon {
          width: 44px; height: 44px;
          border-radius: 7px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #3bff7e;
        }

        .attachment-name {
          font-size: 12px;
          color: var(--text-muted);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .remove-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          color: var(--text-muted);
          width: 20px; height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }

        .remove-btn:hover { background: rgba(255,255,255,0.15); color: var(--text); }

        .voice-row { display: flex; align-items: center; gap: 8px; padding: 0 2px 2px; }
        .voice-label { font-size: 11px; color: var(--text-muted); }

        .voice-select {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-family: var(--font);
          font-size: 12px;
          padding: 3px 8px;
          outline: none;
          cursor: pointer;
        }

        .textarea-row { display: flex; align-items: flex-end; gap: 8px; }

        textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: var(--text);
          font-family: var(--font);
          font-size: 14.5px;
          line-height: 1.5;
          min-height: 24px;
          max-height: 200px;
          overflow-y: auto;
          padding: 0;
        }

        textarea::placeholder { color: var(--text-muted); }
        textarea:disabled { opacity: 0.4; cursor: not-allowed; }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: var(--border); }

        .input-actions { display: flex; align-items: center; gap: 4px; }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .icon-btn:hover { color: var(--text); background: var(--surface2); }

        .send-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: none;
          background: var(--send-bg);
          color: var(--send-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .send-btn:disabled { background: var(--send-disabled); color: var(--send-disabled-color); cursor: not-allowed; }
        .send-btn:not(:disabled):hover { transform: scale(1.05); background: #e8e8e8; }

        .hint { text-align: center; font-size: 11.5px; color: var(--text-muted); margin-top: 10px; opacity: 0.5; }

        .error-msg {
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          border-radius: 10px;
          color: #ff6b6b;
          font-size: 13px;
          padding: 10px 14px;
          margin-bottom: 12px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .bubble { max-width: 90%; }
          .empty-title { font-size: 20px; }
        }
      `}</style>

      <div className="layout">
        <header className="header">
          <span className="header-dot" />
          <span className="header-title">Diego&apos;s LLM Integration</span>
        </header>

        {/* Centered tabs: Text | Image | Audio */}
        <div className="mode-tabs">
          {(["chat", "generate", "text_to_sound"] as Mode[]).map((m) => (
            <button key={m} className={`tab ${mode === m ? "active" : ""}`} onClick={() => switchMode(m)}>
              {m === "chat" ? "💬 Text" : m === "generate" ? "🎨 Image" : "🔊 Audio"}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="messages">

          {/* TEXT mode */}
          {mode === "chat" && (
            isEmpty ? (
              <div className="empty-state">
                <h1 className="empty-title">Ask anything.</h1>
                <p className="empty-sub">Select Text, Image or Audio according to your input.</p>
              </div>
            ) : (
              <>
                {visibleMessages.map((m, i) => (
                  <div key={i} className={`msg-row ${m.role}`}>
                    <div className={`avatar ${m.role}`}>{m.role === "user" ? "D" : "AI"}</div>
                    <div className={`bubble ${m.role}`}>
                      {typeof m.content === "string" ? m.content : (
                        <>
                          {getTextContent(m.content)}
                          {hasImage(m.content) && (
                            <img
                              src={((m.content as Array<TextPart | ImageUrlPart>).find(p => p.type === "image_url") as ImageUrlPart)?.image_url.url ?? ""}
                              alt="uploaded"
                              className="bubble-image"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="msg-row assistant">
                    <div className="avatar assistant">AI</div>
                    <div className="bubble assistant">
                      <div className="typing">
                        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {/* IMAGE mode */}
          {mode === "generate" && (
            <div className="output-area">
              {loading ? (
                <>
                  <div className="typing"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div>
                  <p className="output-label">{imageFile ? "Analyzing image…" : "Generating image…"}</p>
                </>
              ) : generatedImageUrl ? (
                <>
                  <p className="output-label">{messages.length > 2 ? "Image Analysis" : "Generated Image"}</p>
                  <img src={generatedImageUrl} alt="result" className="generated-img" />
                  {messages.length > 2 && (
                    <p className="analysis-text">{getTextContent(messages[messages.length - 1].content)}</p>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <h1 className="empty-title">Generate or upload an image.</h1>
                  <p className="empty-sub">Describe an image to generate, or upload one to analyze.</p>
                </div>
              )}
            </div>
          )}

          {/* AUDIO mode */}
          {mode === "text_to_sound" && (
            <div className="output-area">
              {loading ? (
                <>
                  <div className="typing"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div>
                  <p className="output-label">{audioFile ? "Transcribing…" : "Generating audio…"}</p>
                </>
              ) : generatedAudioUrl ? (
                <>
                  <p className="output-label">Generated Audio</p>
                  <audio controls src={generatedAudioUrl} className="audio-player" />
                </>
              ) : visibleMessages.length > 0 ? (
                <div style={{ width: "100%", maxWidth: "600px" }}>
                  {visibleMessages.map((m, i) => (
                    <div key={i} className={`msg-row ${m.role}`}>
                      <div className={`avatar ${m.role}`}>{m.role === "user" ? "D" : "AI"}</div>
                      <div className={`bubble ${m.role}`}>{typeof m.content === "string" ? m.content : getTextContent(m.content)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h1 className="empty-title">Transcribe or generate audio.</h1>
                  <p className="empty-sub">Upload an audio file to transcribe, or type text to convert to speech.</p>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="input-area">
          {error && <div className="error-msg">{error}</div>}

          <div className="input-wrapper">

            {/* Image attachment preview */}
            {imagePreview && (
              <div className="attachment-preview">
                <img src={imagePreview} alt="preview" className="preview-thumb" />
                <span className="attachment-name">{imageFile?.name}</span>
                <button className="remove-btn" onClick={clearImage}>✕</button>
              </div>
            )}

            {/* Audio attachment preview */}
            {audioFile && mode === "text_to_sound" && (
              <div className="attachment-preview">
                <div className="audio-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <span className="attachment-name">{audioName}</span>
                <button className="remove-btn" onClick={clearAudio}>✕</button>
              </div>
            )}

            {/* Voice selector — only in audio mode with no file */}
            {mode === "text_to_sound" && !audioFile && (
              <div className="voice-row">
                <span className="voice-label">Voice:</span>
                <select className="voice-select" value={voice} onChange={(e) => setVoice(e.target.value as SpeechVoice)}>
                  {(["alloy","echo","fable","onyx","nova","shimmer"] as SpeechVoice[]).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="textarea-row">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                rows={1}
                disabled={
                  loading || (mode === "text_to_sound" && !!audioFile)
                }
              />

              <div className="input-actions">
                {/* Image upload — Text and Image modes */}
                {(mode === "chat" || mode === "generate") && (
                  <button className="icon-btn" title="Attach image" onClick={() => fileRef.current?.click()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                )}

                {/* Audio upload — Audio mode */}
                {mode === "text_to_sound" && (
                  <button className="icon-btn" title="Upload audio to transcribe" onClick={() => audioRef.current?.click()}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                )}

                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickFile} />
                <input ref={audioRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={onPickAudio} />

                <button className="send-btn" onClick={handleSend} disabled={!canSend} title="Send">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p className="hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}