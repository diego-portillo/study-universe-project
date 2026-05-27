'use client';

import { Dispatch, SetStateAction, useRef } from 'react';
import { fileToLowResDataUrl } from '../utils';
import type {
  Message,
  ModelOption,
  SpeechVoice,
  AudioProvider,
} from '../types';
import { MAX_PROMPT_CHARS, makeSystemMessage } from '../constants';

type SetMessages = Dispatch<SetStateAction<Message[]>>;
type SetString = Dispatch<SetStateAction<string>>;
type SetBool = Dispatch<SetStateAction<boolean>>;
type SetNullable<T> = Dispatch<SetStateAction<T | null>>;

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
        (m) => typeof m.content !== 'string' || m.content.trim().length > 0,
      );
      setMessages(payload);
      setInput('');
      clearImage();

      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: payload,
          conversationId: conversationIdRef.current,
          model: selectedModel.id,
          provider: selectedModel.provider,
          reset: messages.filter((m) => m.role !== 'system').length === 0,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }

      const reader = res.body?.getReader();

      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: assistantText },
          ]);
        }
        const tail = decoder.decode();
        if (tail) {
          assistantText += tail;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: assistantText },
          ]);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function generateImage() {
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
        const payload = [makeSystemMessage(selectedModel.label), userMessage];
        const res = await fetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: payload,
            model: selectedModel.id,
            provider: selectedModel.provider,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Analysis failed');
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            assistantText += decoder.decode(value, { stream: true });
          }
          assistantText += decoder.decode();
        }

        setGeneratedImageUrl(dataUrl);
        setMessages([
          makeSystemMessage(selectedModel.label),
          userMessage,
          { role: 'assistant', content: assistantText },
        ]);
        setInput('');
        clearImage();
      } else {
        const res = await fetch('/api/image', {
          method: 'POST',
          body: JSON.stringify({ prompt: trimmed }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Image generation failed' }));
          throw new Error(errData.error || 'Image generation failed');
        }
        const data = await res.json();
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
    const trimmed = input.trim();

    const effectiveAudioProvider: AudioProvider =
      selectedModel.provider === 'elevenlabs' ? 'elevenlabs' : audioProvider;

    if (audioFile) {
      setLoading(true);
      setError('');
      try {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('provider', effectiveAudioProvider);
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
        body: JSON.stringify({
          text: trimmed,
          voice,
          provider: effectiveAudioProvider,
        }),
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

  return { sendChat, generateImage, handleAudio, clearImage, clearAudio };
}
