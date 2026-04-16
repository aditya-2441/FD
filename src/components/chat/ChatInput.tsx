import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mic, Send } from "lucide-react";
import type { SupportedLanguage } from "@/types/chat";

type SpeechRecognitionCtor = new () => SpeechRecognition;

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => Promise<void>;
  disabled?: boolean;
  language?: SupportedLanguage;
}

function getSpeechLocale(language?: SupportedLanguage): string {
  switch (language) {
    case "en":
      return "en-IN";
    case "hi":
      return "hi-IN";
    case "mr":
      return "mr-IN";
    case "bn":
      return "bn-IN";
    default:
      return "hi-IN";
  }
}

export function ChatInput({ value, onChange, onSend, disabled = false, language }: ChatInputProps) {
  const isSubmitDisabled = disabled || !value.trim();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const shouldApplyTranscriptRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognitionImpl = win.SpeechRecognition || win.webkitSpeechRecognition;
    setIsSpeechSupported(Boolean(SpeechRecognitionImpl));
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSend();
  }

  function handleMicClick() {
    if (disabled || !isSpeechSupported || typeof window === "undefined") return;
    const win = window as WindowWithSpeechRecognition;

    if (isRecording) {
      shouldApplyTranscriptRef.current = true;
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionImpl = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    const mappedLanguage = getSpeechLocale(language);
    console.log("Starting mic with language:", mappedLanguage);
    recognition.lang = mappedLanguage;
    recognition.interimResults = true;
    recognition.continuous = false;

    transcriptRef.current = "";
    shouldApplyTranscriptRef.current = true;

    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, index) => event.results[index][0]?.transcript ?? "")
        .join(" ")
        .trim();
      transcriptRef.current = transcript;
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      shouldApplyTranscriptRef.current = false;
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (shouldApplyTranscriptRef.current && transcriptRef.current) {
        onChange(transcriptRef.current);
      }
      shouldApplyTranscriptRef.current = false;
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  }

  return (
    <div className="sticky bottom-0 z-20 border-t border-slate-200/60 bg-white/80 p-4 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask about FD rates, safety, or how to invest..."
          className="w-full rounded-full border border-transparent bg-slate-100 px-6 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={disabled}
        />
        {isSpeechSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
              isRecording
                ? "border-red-200 bg-red-100 text-red-500 animate-pulse"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={isRecording ? "Stop voice input" : "Start voice input"}
            title={isRecording ? "Stop voice input" : "Start voice input"}
          >
            <Mic className="size-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
