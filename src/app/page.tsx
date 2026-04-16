"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import type { ApiErrorResponse, ChatRequest, ChatResponse } from "@/types/api";
import type { ChatMessage, LanguageOption, SupportedLanguage } from "@/types/chat";

const languageOptions: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
];

const initialMessage: ChatMessage = {
  id: "initial-assistant-message",
  role: "assistant",
  content:
    "Namaste! I can help you compare FD options in simple words and your language. Ask me which bank gives better returns for 1 year.",
  createdAt: new Date().toISOString(),
};

export default function Home() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage() {
    const messageText = input.trim();
    if (!messageText || isTyping) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const payload: ChatRequest = {
        message: messageText,
        language,
        history: updatedMessages,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        throw new Error(error.error || "Unable to get a response right now.");
      }

      const data = (await response.json()) as ChatResponse;
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const fallbackMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? `Sorry, I had trouble just now: ${error.message}`
            : "Sorry, something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <ChatHeader language={language} onLanguageChange={setLanguage} languageOptions={languageOptions} />
      <MessageList messages={messages} isTyping={isTyping} listEndRef={listEndRef} />
      <ChatInput value={input} onChange={setInput} onSend={sendMessage} disabled={isTyping} language={language} />
    </main>
  );
}
