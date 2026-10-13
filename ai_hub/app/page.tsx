'use client';

// This file is ~1000 lines, well past "a screenful" per this repo's own
// component-sizing guideline (CLAUDE.md). It works and is tested, but it
// needs to be split into smaller components before much more is added here —
// flagged as a future rewrite, not tackled now to avoid destabilizing things
// right before the public deploy.

import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from 'react';

import { getTextContent, hasImage } from './utils';

import { useChat } from './hooks/useChat';

import type {
  Mode,
  SpeechVoice,
  TextPart,
  ImageUrlPart,
  Message,
  ModelOption,
  AudioProvider,
  ProviderError,
} from './types';

import {
  MAX_AUDIO_LENGTH,
  makeSystemMessage,
  MODEL_OPTIONS,
  DEFAULT_MODEL,
  PROVIDER_LABELS,
  PROVIDER_ERROR_TITLES,
  UNSUPPORTED_AUDIO_PROVIDERS,
  UNSUPPORTED_IMAGE_PROVIDERS,
  DEFAULT_AUDIO_PROVIDER,
  nextChatModel,
  nextAudioModel,
} from './constants';

import './page.css';

export default function Page() {
  const [mode, setMode] = useState<Mode>('chat');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    makeSystemMessage(DEFAULT_MODEL.label),
  ]);
  const [imageMessages, setImageMessages] = useState<Message[]>([
    makeSystemMessage(DEFAULT_MODEL.label),
  ]);
  const [audioMessages, setAudioMessages] = useState<Message[]>([
    makeSystemMessage(DEFAULT_MODEL.label),
  ]);

  const messages =
    mode === 'chat'
      ? chatMessages
      : mode === 'image'
        ? imageMessages
        : audioMessages;
  const setMessages: Dispatch<SetStateAction<Message[]>> =
    mode === 'chat'
      ? setChatMessages
      : mode === 'image'
        ? setImageMessages
        : setAudioMessages;
  const [input, setInput] = useState('');

  const [selectedModel, setSelectedModel] =
    useState<ModelOption>(DEFAULT_MODEL);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState('');
  const [audioName, setAudioName] = useState('');
  const audioProvider: AudioProvider = DEFAULT_AUDIO_PROVIDER;

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerError, setProviderError] = useState<ProviderError | null>(null);

  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const voice: SpeechVoice = 'alloy';

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const visibleMessages = messages.filter((message) => message.role !== 'system');
  const isEmpty = visibleMessages.length === 0;
  const isImageAnalysis = messages.length > 2;
  const imageAnalysisText = isImageAnalysis
    ? getTextContent(messages[messages.length - 1].content)
    : '';

  const isAnthropicSelected = selectedModel.provider === 'anthropic';
  const isGoogleSelected = selectedModel.provider === 'google';
  const isElevenLabsSelected = selectedModel.provider === 'elevenlabs';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [audioPreview]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }, [input]);

  function applyModelChange(matchedModel: ModelOption) {
    setSelectedModel(matchedModel);
    setProviderError(null);

    // warn if conversation has images and new model doesn't support vision
    const hasImages = messages.some(
      (message) =>
        Array.isArray(message.content) &&
        message.content.some((part) => part.type === 'image_url'),
    );
    const isVisionUnsupported =
      matchedModel.provider === 'anthropic' || matchedModel.provider === 'google';

    if (hasImages && isVisionUnsupported) {
      setError(
        `Warning: this conversation contains images. ${matchedModel.label} may not support vision — image messages will be sent as text placeholders.`,
      );
    } else {
      setError('');
    }
    setChatMessages([makeSystemMessage(matchedModel.label)]);
    setImageMessages([makeSystemMessage(matchedModel.label)]);
    setAudioMessages([makeSystemMessage(matchedModel.label)]);
    setInput('');
    clearImage();
    clearAudio();
    setGeneratedImageUrl('');
    setGeneratedAudioUrl('');
    if (matchedModel.provider === 'elevenlabs') {
      setMode('audio');
    }
    if (
      (matchedModel.provider === 'anthropic' || matchedModel.provider === 'google') &&
      (mode === 'image' || mode === 'audio')
    ) {
      setMode('chat');
    }
  }

  function handleModelChange(event: ChangeEvent<HTMLSelectElement>) {
    const matchedModel = MODEL_OPTIONS.find(
      (model) => model.id === event.target.value,
    );
    if (!matchedModel) return;
    applyModelChange(matchedModel);
  }

  function switchMode(targetMode: Mode) {
    if (isElevenLabsSelected && (targetMode === 'chat' || targetMode === 'image')) {
      setError(
        'ElevenLabs only supports audio. Switch to another provider for text or image.',
      );
      return;
    }
    if (
      (isAnthropicSelected || isGoogleSelected) &&
      (targetMode === 'image' || targetMode === 'audio')
    ) {
      const unsupportedProviders =
        targetMode === 'image'
          ? UNSUPPORTED_IMAGE_PROVIDERS
          : UNSUPPORTED_AUDIO_PROVIDERS;

      setError(
        `${
          targetMode === 'image' ? 'Image' : 'Audio'
        } features are not available with ${unsupportedProviders} providers. Switch to an OpenAI model to use this mode.`,
      );

      return;
    }
    setMode(targetMode);
    setError('');
    setGeneratedImageUrl('');
    setGeneratedAudioUrl('');
    clearImage();
    clearAudio();
  }

  function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview('');
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () =>
      setImagePreview(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  }

  async function onPickAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => {
      audio.onloadedmetadata = () => resolve();
    });
    if (audio.duration > MAX_AUDIO_LENGTH) {
      setError('Audio too long (max 60s)');
      return;
    }
    setAudioFile(file);
    setAudioPreview(audio.src);
    setAudioName(file.name);
    setError('');
    if (generatedAudioUrl) {
      URL.revokeObjectURL(generatedAudioUrl);
      setGeneratedAudioUrl('');
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }
  const { sendChat, generateImage, handleAudio, clearImage, clearAudio } =
    useChat({
      messages,
      input,
      imageFile,
      audioFile,
      audioName,
      selectedModel,
      voice,
      audioProvider,
      setMessages,
      setInput,
      setError,
      setProviderError,
      setLoading,
      setGeneratedImageUrl,
      setGeneratedAudioUrl,
      setImageFile,
      setImagePreview,
      setAudioFile,
      setAudioPreview,
      setAudioName,
      audioPreview,
      fileInputRef,
      audioInputRef,
    });

  function handleSend() {
    if (mode === 'image') return generateImage();
    if (mode === 'audio') return handleAudio();
    return sendChat();
  }

  async function startRecording() {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
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
        if (generatedAudioUrl) {
          URL.revokeObjectURL(generatedAudioUrl);
          setGeneratedAudioUrl('');
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
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
    } catch {
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

  return (
    <>
      <div className="layout">
        <header className="header">
          <span className="header-dot" />
          <span className="header-title">Diego&apos;s LLM Integration</span>
        </header>

        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          isAnthropicSelected={isAnthropicSelected}
          isGoogleSelected={isGoogleSelected}
          isElevenLabsSelected={isElevenLabsSelected}
        />

        <ModeTabs
          mode={mode}
          onSwitchMode={switchMode}
          isAnthropicSelected={isAnthropicSelected}
          isGoogleSelected={isGoogleSelected}
          isElevenLabsSelected={isElevenLabsSelected}
        />

        <div className="messages">
          {mode === 'chat' && (
            <ChatMessagesPanel
              isEmpty={isEmpty}
              visibleMessages={visibleMessages}
              loading={loading}
            />
          )}

          {mode === 'image' && (
            <ImageOutputPanel
              loading={loading}
              imageFile={imageFile}
              generatedImageUrl={generatedImageUrl}
              isAnalysis={isImageAnalysis}
              analysisText={imageAnalysisText}
            />
          )}

          {mode === 'audio' && (
            <AudioOutputPanel
              loading={loading}
              audioFile={audioFile}
              generatedAudioUrl={generatedAudioUrl}
              visibleMessages={visibleMessages}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input box ──────────────────────────────────────────────── */}
        <div className="input-area">
          {providerError && (
            <ProviderErrorBanner
              providerError={providerError}
              mode={mode}
              onSwitchModel={applyModelChange}
              onDismiss={() => setProviderError(null)}
            />
          )}
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

            <div className="textarea-row">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                }}
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
                    onClick={() => fileInputRef.current?.click()}
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
                    onClick={() => audioInputRef.current?.click()}
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onPickFile}
                />
                <input
                  ref={audioInputRef}
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

function ProviderErrorBanner({
  providerError,
  mode,
  onSwitchModel,
  onDismiss,
}: {
  providerError: ProviderError;
  mode: Mode;
  onSwitchModel: (model: ModelOption) => void;
  onDismiss: () => void;
}) {
  // No fallback model in image mode — OpenAI is the only provider that
  // supports it, so there's nothing to switch to.
  const fallbackModel =
    mode === 'chat'
      ? nextChatModel(providerError.provider)
      : mode === 'audio'
        ? nextAudioModel(providerError.provider)
        : undefined;

  return (
    <div className="provider-error">
      <div className="provider-error-header">
        <span
          className={`provider-badge ${providerError.provider}`}
          aria-label={providerError.provider}
        >
          {PROVIDER_LABELS[providerError.provider]}
        </span>
        <span className="provider-error-title">
          {PROVIDER_ERROR_TITLES[providerError.kind]}
        </span>
        <button className="remove-btn" onClick={onDismiss} title="Dismiss">
          ✕
        </button>
      </div>
      <p className="provider-error-message">{providerError.message}</p>
      {fallbackModel && (
        <button
          className="provider-error-switch"
          onClick={() => onSwitchModel(fallbackModel)}
        >
          Switch to {fallbackModel.label}
        </button>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`msg-row ${message.role}`}>
      <div className={`avatar ${message.role}`}>
        {message.role === 'user' ? 'D' : 'AI'}
      </div>
      <div className={`bubble ${message.role}`}>
        {typeof message.content === 'string' ? (
          message.content
        ) : (
          <>
            {getTextContent(message.content)}
            {hasImage(message.content) && (
              <img
                src={
                  (
                    (message.content as Array<TextPart | ImageUrlPart>).find(
                      (part) => part.type === 'image_url',
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
  );
}

function ModelSelector({
  selectedModel,
  onModelChange,
  isAnthropicSelected,
  isGoogleSelected,
  isElevenLabsSelected,
}: {
  selectedModel: ModelOption;
  onModelChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  isAnthropicSelected: boolean;
  isGoogleSelected: boolean;
  isElevenLabsSelected: boolean;
}) {
  const openaiModels = MODEL_OPTIONS.filter((model) => model.provider === 'openai');
  const anthropicModels = MODEL_OPTIONS.filter(
    (model) => model.provider === 'anthropic',
  );
  const googleModels = MODEL_OPTIONS.filter((model) => model.provider === 'google');
  const elevenLabsModels = MODEL_OPTIONS.filter(
    (model) => model.provider === 'elevenlabs',
  );

  return (
    <div className="model-selector-row">
      <label className="model-label" htmlFor="model-select">
        Model
      </label>
      <div className="model-select-wrapper">
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
          onChange={onModelChange}
        >
          <optgroup label="OpenAI">
            {openaiModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Anthropic">
            {anthropicModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Google">
            {googleModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="ElevenLabs">
            {elevenLabsModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
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
      {isElevenLabsSelected && (
        <span className="provider-notice">
          Audio only — text and image require another provider
        </span>
      )}
    </div>
  );
}

function ModeTabs({
  mode,
  onSwitchMode,
  isAnthropicSelected,
  isGoogleSelected,
  isElevenLabsSelected,
}: {
  mode: Mode;
  onSwitchMode: (targetMode: Mode) => void;
  isAnthropicSelected: boolean;
  isGoogleSelected: boolean;
  isElevenLabsSelected: boolean;
}) {
  return (
    <div className="mode-tabs">
      {(['chat', 'image', 'audio'] as Mode[]).map((tabMode) => {
        const isTabDisabled =
          ((isAnthropicSelected || isGoogleSelected) &&
            (tabMode === 'image' || tabMode === 'audio')) ||
          (isElevenLabsSelected && (tabMode === 'chat' || tabMode === 'image'));
        return (
          <button
            key={tabMode}
            className={`tab ${mode === tabMode ? 'active' : ''} ${isTabDisabled ? 'tab-disabled' : ''}`}
            onClick={() => onSwitchMode(tabMode)}
            title={
              isTabDisabled
                ? `Not supported by ${UNSUPPORTED_IMAGE_PROVIDERS} models`
                : undefined
            }
          >
            {tabMode === 'chat'
              ? '💬 Text'
              : tabMode === 'image'
                ? '🎨 Image'
                : '🔊 Audio'}
            {isTabDisabled && <span className="tab-lock">🔒</span>}
          </button>
        );
      })}
    </div>
  );
}

function ChatMessagesPanel({
  isEmpty,
  visibleMessages,
  loading,
}: {
  isEmpty: boolean;
  visibleMessages: Message[];
  loading: boolean;
}) {
  if (isEmpty) {
    return (
      <div className="empty-state">
        <h1 className="empty-title">Ask anything.</h1>
        <p className="empty-sub">
          Select Text, Image or Audio according to your input.
        </p>
      </div>
    );
  }

  return (
    <>
      {visibleMessages.map((message, index) => (
        <MessageBubble key={index} message={message} />
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
  );
}

function ImageOutputPanel({
  loading,
  imageFile,
  generatedImageUrl,
  isAnalysis,
  analysisText,
}: {
  loading: boolean;
  imageFile: File | null;
  generatedImageUrl: string;
  isAnalysis: boolean;
  analysisText: string;
}) {
  return (
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
            {isAnalysis ? 'Image Analysis' : 'Generated Image'}
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
          {isAnalysis && <p className="analysis-text">{analysisText}</p>}
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
  );
}

function AudioOutputPanel({
  loading,
  audioFile,
  generatedAudioUrl,
  visibleMessages,
}: {
  loading: boolean;
  audioFile: File | null;
  generatedAudioUrl: string;
  visibleMessages: Message[];
}) {
  return (
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
          {visibleMessages.map((message, index) => (
            <MessageBubble key={index} message={message} />
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
  );
}
