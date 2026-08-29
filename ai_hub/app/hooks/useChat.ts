'use client';

import { Dispatch, SetStateAction, useRef } from 'react';
import { classifyProviderError, extractStreamError, fileToLowResDataUrl } from '../utils';
import type {
  Message,
  ModelOption,
  SpeechVoice,
  AudioProvider,
  Provider,
  ProviderError,
} from '../types';
import { MAX_PROMPT_CHARS, makeSystemMessage } from '../constants';

type SetMessages = Dispatch<SetStateAction<Message[]>>;
type SetString = Dispatch<SetStateAction<string>>;
type SetBool = Dispatch<SetStateAction<boolean>>;
type SetNullable<T> = Dispatch<SetStateAction<T | null>>;

// Turns a caught error/thrown message into the richer ProviderError shape the
// UI's error boundary needs (kind + which provider) instead of a bare string —
// callers just supply which provider they were talking to.
function toProviderError(error: unknown, provider: Provider): ProviderError {
  const message = error instanceof Error ? error.message : 'Error';
  return { kind: classifyProviderError(message), provider, message };
}

interface UseChatProps {
  messages: Message[];
  input: string;
  imageFile: File | null;
  audioFile: File | null;
  audioName: string;
  selectedModel: ModelOption;
  voice: SpeechVoice;
  setMessages: SetMessages;
  setInput: SetString;
  setError: SetString;
  setProviderError: SetNullable<ProviderError>;
  setLoading: SetBool;
  setGeneratedImageUrl: SetString;
  setGeneratedAudioUrl: SetString;
  setImageFile: SetNullable<File>;
  setImagePreview: SetString;
  setAudioFile: SetNullable<File>;
  setAudioPreview: SetString;
  setAudioName: SetString;
  audioProvider: AudioProvider;
  audioPreview: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  audioInputRef: React.RefObject<HTMLInputElement | null>;
}

async function readStreamedText(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk?: (text: string) => void,
): Promise<string> {
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
    onChunk?.(fullText);
  }

  const tail = decoder.decode();
  if (tail) {
    fullText += tail;
    onChunk?.(fullText);
  }

  return fullText;
}

export function useChat({
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
}: UseChatProps) {
  const conversationIdRef = useRef(crypto.randomUUID());

  function clearImage() {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function clearAudio() {
    setAudioFile(null);
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioPreview('');
    setAudioName('');
    if (audioInputRef.current) audioInputRef.current.value = '';
  }

  async function sendChat() {
    const trimmed = input.trim().slice(0, MAX_PROMPT_CHARS);
    if (!trimmed && !imageFile) return;
    setLoading(true);
    setError('');
    setProviderError(null);
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

      const payload = [...messages, userMessage].filter(
        (message) =>
          typeof message.content !== 'string' || message.content.trim().length > 0,
      );
      setMessages(payload);
      setInput('');
      clearImage();

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: payload,
          conversationId: conversationIdRef.current,
          model: selectedModel.id,
          provider: selectedModel.provider,
          reset: messages.filter((message) => message.role !== 'system').length === 0,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      let assistantText = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        assistantText = await readStreamedText(reader, (text) => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: text },
          ]);
        });
      }

      const streamError = extractStreamError(assistantText);
      if (streamError) {
        // A mid-stream provider failure — see extractStreamError's comment.
        // Keep any text the model produced before it failed; drop the bubble
        // entirely if it failed before saying anything.
        setMessages((prev) =>
          streamError.cleanText
            ? [...prev.slice(0, -1), { role: 'assistant', content: streamError.cleanText }]
            : prev.slice(0, -1),
        );
        setProviderError({
          kind: classifyProviderError(streamError.errorMessage),
          provider: selectedModel.provider,
          message: streamError.errorMessage,
        });
      } else if (!assistantText) {
        // A 200 with a genuinely empty body means the provider call failed
        // before emitting anything at all (no text, no error part) — there's
        // no error payload to read, so surface a generic message instead of
        // leaving an empty assistant bubble.
        setMessages((prev) => prev.slice(0, -1));
        setProviderError({
          kind: 'empty_response',
          provider: selectedModel.provider,
          message: 'The AI provider returned an empty response. Please try again.',
        });
      }
    } catch (error) {
      setProviderError(toProviderError(error, selectedModel.provider));
    } finally {
      setLoading(false);
    }
  }

  async function generateImage() {
    const trimmed = input.trim();
    if (!trimmed && !imageFile) return;
    setLoading(true);
    setError('');
    setProviderError(null);
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
        const payload = [makeSystemMessage(selectedModel.label), userMessage];
        const response = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: payload,
            model: selectedModel.id,
            provider: selectedModel.provider,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Analysis failed');
        }

        const reader = response.body?.getReader();
        const assistantText = reader ? await readStreamedText(reader) : '';

        setGeneratedImageUrl(dataUrl);
        const streamError = extractStreamError(assistantText);
        if (streamError) {
          setMessages(
            streamError.cleanText
              ? [
                  makeSystemMessage(selectedModel.label),
                  userMessage,
                  { role: 'assistant', content: streamError.cleanText },
                ]
              : [makeSystemMessage(selectedModel.label), userMessage],
          );
          setProviderError({
            kind: classifyProviderError(streamError.errorMessage),
            provider: selectedModel.provider,
            message: streamError.errorMessage,
          });
        } else {
          setMessages([
            makeSystemMessage(selectedModel.label),
            userMessage,
            { role: 'assistant', content: assistantText },
          ]);
        }
        setInput('');
        clearImage();
      } else {
        const response = await fetch('/api/image', {
          method: 'POST',
          body: JSON.stringify({ prompt: trimmed }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Image generation failed' }));
          throw new Error(errorData.error || 'Image generation failed');
        }
        const data = await response.json();
        setGeneratedImageUrl(data.url);
        setInput('');
      }
    } catch (error) {
      // vision analysis (imageFile set) goes through /api/chat under the
      // selected model's provider; pure generation always goes through
      // /api/image, which is OpenAI-only.
      const provider = imageFile ? selectedModel.provider : 'openai';
      setProviderError(toProviderError(error, provider));
    } finally {
      setLoading(false);
    }
  }

  async function handleAudio() {
    const trimmed = input.trim();

    const effectiveAudioProvider: AudioProvider =
      selectedModel.provider === 'elevenlabs' ? 'elevenlabs' : audioProvider;

    if (audioFile) {
      setLoading(true);
      setError('');
      setProviderError(null);
      try {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('provider', effectiveAudioProvider);
        const response = await fetch('/api/audio_to_text', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Transcription failed');
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: `[Audio: ${audioName}]` },
          { role: 'assistant', content: data.text },
        ]);
        clearAudio();
      } catch (error) {
        setProviderError(toProviderError(error, effectiveAudioProvider));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!trimmed) return;
    setLoading(true);
    setError('');
    setProviderError(null);
    setGeneratedAudioUrl('');
    try {
      const response = await fetch('/api/text_to_audio', {
        method: 'POST',
        body: JSON.stringify({
          text: trimmed,
          voice,
          provider: effectiveAudioProvider,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'TTS failed');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);
      setInput('');
    } catch (error) {
      setProviderError(toProviderError(error, effectiveAudioProvider));
    } finally {
      setLoading(false);
    }
  }

  return { sendChat, generateImage, handleAudio, clearImage, clearAudio };
}
