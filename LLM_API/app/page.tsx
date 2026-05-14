'use client';

import { ChangeEvent, useEffect, useRef, useState, KeyboardEvent } from 'react';

import { getTextContent, hasImage, fileToLowResDataUrl } from './utils';

import type {
  Mode,
  SpeechVoice,
  TextPart,
  ImageUrlPart,
  Message,
  ModelOption,
} from './types';

import {
  MAX_PROMPT_CHARS,
  MAX_AUDIO_LENGTH,
  SYSTEM_MESSAGE,
  MODEL_OPTIONS,
  DEFAULT_MODEL,
  PROVIDER_LABELS,
  UNSUPPORTED_AUDIO_PROVIDERS,
  UNSUPPORTED_IMAGE_PROVIDERS,
} from './constants';

import './page.css';

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('chat');

  // Provider / model
  const [selectedModel, setSelectedModel] =
    useState<ModelOption>(DEFAULT_MODEL);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [audioName, setAudioName] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const [voice, setVoice] = useState<SpeechVoice>('alloy');

  const fileRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const visibleMessages = messages.filter((m) => m.role !== 'system');
  const isEmpty = visibleMessages.length === 0;

  // Whether the selected provider supports the current mode
  const isAnthropicSelected = selectedModel.provider === 'anthropic';
  const isGoogleSelected = selectedModel.provider === 'google';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [audioPreview]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [input]);

  function handleModelChange(e: ChangeEvent<HTMLSelectElement>) {
    const found = MODEL_OPTIONS.find((m) => m.id === e.target.value);
    if (!found) return;
    setSelectedModel(found);
    setError('');
    // Reset conversation state
    setMessages([SYSTEM_MESSAGE]);
    setInput('');
    clearImage();
    clearAudio();
    setGeneratedImageUrl('');
    setGeneratedAudioUrl('');
    if (
      (found.provider === 'anthropic' || found.provider === 'google') &&
      (mode === 'image' || mode === 'audio')
    ) {
      setMode('chat');
    }
  }

  function switchMode(m: Mode) {
    if (
      (isAnthropicSelected || isGoogleSelected) &&
      (m === 'image' || m === 'audio')
    ) {
      const unsupportedProviders =
        m === 'image'
          ? UNSUPPORTED_IMAGE_PROVIDERS
          : UNSUPPORTED_AUDIO_PROVIDERS;

      setError(
        `${
          m === 'image' ? 'Image' : 'Audio'
        } features are not available with ${unsupportedProviders} providers. Switch to an OpenAI model to use this mode.`,
      );

      return;
    }
    setMode(m);
    setError('');
    setGeneratedImageUrl('');
    setGeneratedAudioUrl('');
    clearImage();
    clearAudio();
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function clearAudio() {
    setAudioFile(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview('');
    setAudioName('');
    if (audioRef.current) audioRef.current.value = '';
  }

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview('');
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () =>
      setImagePreview(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  }

  async function onPickAudio(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    await new Promise<void>((r) => {
      audio.onloadedmetadata = () => r();
    });
    if (audio.duration > MAX_AUDIO_LENGTH) {
      setError('Audio too long (max 60s)');
      return;
    }
    setAudioFile(file);
    setAudioPreview(audio.src);
    setAudioName(file.name);
    setError('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (mode === 'image') return generateImage();
    if (mode === 'audio') return handleAudio();
    return sendChat();
  }

  async function generateImage() {
    if (loading) return;
    const trimmed = input.trim();
    if (!trimmed && !imageFile) return;
    setLoading(true);
    setError('');
    setGeneratedImageUrl('');
    try {
      if (imageFile) {
        const dataUrl = await fileToLowResDataUrl(imageFile);
        const userMessage: Message = {
          role: 'user',
          content: [
            { type: 'text', text: trimmed || 'Describe this image in detail.' },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        };
        const payload = [SYSTEM_MESSAGE, userMessage];
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: payload,
            model: selectedModel.id,
            provider: selectedModel.provider,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        setGeneratedImageUrl(dataUrl);
        setMessages([SYSTEM_MESSAGE, userMessage, data.message]);
        setInput('');
        clearImage();
      } else {
        const res = await fetch('/api/image', {
          method: 'POST',
          body: JSON.stringify({ prompt: trimmed }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Image generation failed');
        setGeneratedImageUrl(data.url);
        setInput('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAudio() {
    if (loading) return;
    const trimmed = input.trim();

    if (audioFile) {
      setLoading(true);
      setError('');
      try {
        const formData = new FormData();
        formData.append('audio', audioFile);
        const res = await fetch('/api/audio_to_text', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transcription failed');
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: `[Audio: ${audioName}]` },
          { role: 'assistant', content: data.text },
        ]);
        clearAudio();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!trimmed) return;
    setLoading(true);
    setError('');
    setGeneratedAudioUrl('');
    try {
      const res = await fetch('/api/text_to_audio', {
        method: 'POST',
        body: JSON.stringify({ text: trimmed, voice }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'TTS failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);
      setInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function sendChat() {
    if (loading) return;
    const trimmed = input.trim().slice(0, MAX_PROMPT_CHARS);
    if (!trimmed && !imageFile) return;
    setLoading(true);
    setError('');
    try {
      let userMessage: Message;
      if (imageFile) {
        const dataUrl = await fileToLowResDataUrl(imageFile);
        userMessage = {
          role: 'user',
          content: [
            { type: 'text', text: trimmed || 'Describe this image.' },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        };
      } else {
        userMessage = { role: 'user', content: trimmed };
      }
      const payload = [...messages, userMessage];
      setMessages(payload);
      setInput('');
      clearImage();
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: payload,
          conversationId: 'user-1',
          model: selectedModel.id,
          provider: selectedModel.provider,
          reset: messages.filter((m) => m.role !== 'system').length === 0,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages((prev) => [...prev, data.message]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        setAudioFile(file);
        const url = URL.createObjectURL(blob);
        setAudioPreview(url);
        setAudioName(file.name);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      timeoutRef.current = setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, MAX_AUDIO_LENGTH * 1000);

      mediaRecorderRef.current = recorder;
    } catch (err) {
      setError('Microphone permission denied or unavailable');
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    recorder.stop();
    setIsRecording(false);
  }

  function toggleRecording() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  const canSend =
    mode === 'chat'
      ? !loading && (!!input.trim() || !!imageFile)
      : mode === 'image'
        ? !loading && (!!input.trim() || !!imageFile)
        : !loading && (!!input.trim() || !!audioFile);

  const placeholder =
    mode === 'chat'
      ? 'Ask anything...'
      : mode === 'image'
        ? imageFile
          ? 'Ask something about the image...'
          : 'Describe the image to generate...'
        : audioFile
          ? 'Audio ready — hit send to transcribe'
          : 'Enter text to convert to speech...';

  // Group models by provider for the <optgroup> selector
  const openaiModels = MODEL_OPTIONS.filter((m) => m.provider === 'openai');
  const anthropicModels = MODEL_OPTIONS.filter(
    (m) => m.provider === 'anthropic',
  );
  const googleModels = MODEL_OPTIONS.filter((m) => m.provider === 'google');

  return (
    <>
      <div className="layout">
        <header className="header">
          <span className="header-dot" />
          <span className="header-title">Diego&apos;s LLM Integration</span>
        </header>

        {/* ── Model selector ─────────────────────────────────────────── */}
        <div className="model-selector-row">
          <label className="model-label" htmlFor="model-select">
            Model
          </label>
          <div className="model-select-wrapper">
            {/* Provider badge */}
            <span
              className={`provider-badge ${selectedModel.provider}`}
              aria-label={selectedModel.provider}
            >
              {PROVIDER_LABELS[selectedModel.provider]}
            </span>
            <select
              id="model-select"
              className="model-select"
              value={selectedModel.id}
              onChange={handleModelChange}
            >
              <optgroup label="OpenAI">
                {openaiModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Anthropic">
                {anthropicModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Google">
                {googleModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {(isAnthropicSelected || isGoogleSelected) && (
            <span className="provider-notice">
              Chat only — image and audio require OpenAI
            </span>
          )}
        </div>

        {/* ── Mode tabs ──────────────────────────────────────────────── */}
        <div className="mode-tabs">
          {(['chat', 'image', 'audio'] as Mode[]).map((m) => {
            const disabled =
              (isAnthropicSelected || isGoogleSelected) &&
              (m === 'image' || m === 'audio');
            return (
              <button
                key={m}
                className={`tab ${mode === m ? 'active' : ''} ${disabled ? 'tab-disabled' : ''}`}
                onClick={() => switchMode(m)}
                title={
                  disabled
                    ? `Not supported by ${UNSUPPORTED_IMAGE_PROVIDERS} models`
                    : undefined
                }
              >
                {m === 'chat'
                  ? '💬 Text'
                  : m === 'image'
                    ? '🎨 Image'
                    : '🔊 Audio'}
                {disabled && <span className="tab-lock">🔒</span>}
              </button>
            );
          })}
        </div>

        <div className="messages">
          {/* TEXT mode */}
          {mode === 'chat' &&
            (isEmpty ? (
              <div className="empty-state">
                <h1 className="empty-title">Ask anything.</h1>
                <p className="empty-sub">
                  Select Text, Image or Audio according to your input.
                </p>
              </div>
            ) : (
              <>
                {visibleMessages.map((m, i) => (
                  <div key={i} className={`msg-row ${m.role}`}>
                    <div className={`avatar ${m.role}`}>
                      {m.role === 'user' ? 'D' : 'AI'}
                    </div>
                    <div className={`bubble ${m.role}`}>
                      {typeof m.content === 'string' ? (
                        m.content
                      ) : (
                        <>
                          {getTextContent(m.content)}
                          {hasImage(m.content) && (
                            <img
                              src={
                                (
                                  (
                                    m.content as Array<TextPart | ImageUrlPart>
                                  ).find(
                                    (p) => p.type === 'image_url',
                                  ) as ImageUrlPart
                                )?.image_url.url ?? ''
                              }
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
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ))}

          {/* IMAGE mode */}
          {mode === 'image' && (
            <div className="output-area">
              {loading ? (
                <>
                  <div className="typing">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                  <p className="output-label">
                    {imageFile ? 'Analyzing image…' : 'Generating image…'}
                  </p>
                </>
              ) : generatedImageUrl ? (
                <>
                  <p className="output-label">
                    {messages.length > 2 ? 'Image Analysis' : 'Generated Image'}
                  </p>
                  <img
                    src={generatedImageUrl}
                    alt="result"
                    className="generated-img"
                  />
                  <a
                    href={generatedImageUrl}
                    download="generated-image.jpg"
                    style={{
                      marginTop: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '7px 14px',
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download image
                  </a>
                  {messages.length > 2 && (
                    <p className="analysis-text">
                      {getTextContent(messages[messages.length - 1].content)}
                    </p>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <h1 className="empty-title">Generate or upload an image.</h1>
                  <p className="empty-sub">
                    Describe an image to generate, or upload one to analyze.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AUDIO mode */}
          {mode === 'audio' && (
            <div className="output-area">
              {loading ? (
                <>
                  <div className="typing">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                  <p className="output-label">
                    {audioFile ? 'Transcribing…' : 'Generating audio…'}
                  </p>
                </>
              ) : generatedAudioUrl ? (
                <>
                  <p className="output-label">Generated Audio</p>
                  <audio
                    controls
                    src={generatedAudioUrl}
                    className="audio-player"
                  />
                </>
              ) : visibleMessages.length > 0 ? (
                <div style={{ width: '100%', maxWidth: '600px' }}>
                  {visibleMessages.map((m, i) => (
                    <div key={i} className={`msg-row ${m.role}`}>
                      <div className={`avatar ${m.role}`}>
                        {m.role === 'user' ? 'D' : 'AI'}
                      </div>
                      <div className={`bubble ${m.role}`}>
                        {typeof m.content === 'string'
                          ? m.content
                          : getTextContent(m.content)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h1 className="empty-title">Transcribe or generate audio.</h1>
                  <p className="empty-sub">
                    Upload an audio file to transcribe, or type text to convert
                    to speech.
                  </p>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input box ──────────────────────────────────────────────── */}
        <div className="input-area">
          {error && <div className="error-msg">{error}</div>}

          <div className="input-wrapper">
            {/* Image attachment preview */}
            {imagePreview && (
              <div className="attachment-preview">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="preview-thumb"
                />
                <span className="attachment-name">{imageFile?.name}</span>
                <button className="remove-btn" onClick={clearImage}>
                  ✕
                </button>
              </div>
            )}

            {/* Audio attachment preview */}
            {audioFile && mode === 'audio' && (
              <div className="attachment-preview">
                <div className="audio-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <span className="attachment-name">{audioName}</span>
                <button className="remove-btn" onClick={clearAudio}>
                  ✕
                </button>
              </div>
            )}

            {/* Voice selector — only in audio mode with no file */}
            {mode === 'audio' && !audioFile && (
              <div className="voice-row">
                <span className="voice-label">Voice:</span>
                <select
                  className="voice-select"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as SpeechVoice)}
                >
                  {(
                    [
                      'alloy',
                      'echo',
                      'fable',
                      'onyx',
                      'nova',
                      'shimmer',
                    ] as SpeechVoice[]
                  ).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
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
                disabled={loading || (mode === 'audio' && !!audioFile)}
              />

              <div className="input-actions">
                {/* Image upload — Image mode only */}
                {mode === 'image' && (
                  <button
                    className="icon-btn"
                    title="Attach image"
                    onClick={() => fileRef.current?.click()}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </button>
                )}

                {/* Audio upload */}
                {mode === 'audio' && (
                  <button
                    className="icon-btn"
                    title="Upload audio to transcribe"
                    onClick={() => audioRef.current?.click()}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </button>
                )}

                {/* Record button */}
                {mode === 'audio' && (
                  <button
                    className="icon-btn"
                    title={isRecording ? 'Stop recording' : 'Record audio'}
                    onClick={toggleRecording}
                    style={{ color: isRecording ? '#ff4d4d' : undefined }}
                  >
                    {isRecording ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <rect x="6" y="6" width="12" height="12" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    )}
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onPickFile}
                />
                <input
                  ref={audioRef}
                  type="file"
                  accept="audio/*"
                  style={{ display: 'none' }}
                  onChange={onPickAudio}
                />

                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!canSend}
                  title="Send"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
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
