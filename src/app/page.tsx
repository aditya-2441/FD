"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import type { ApiErrorResponse, ChatRequest, ChatResponse } from "@/types/api";
import type { ChatMessage, SupportedLanguage } from "@/types/chat";
import { auth } from "@/lib/firebase";

const initialMessage: ChatMessage = {
  id: "initial-assistant-message",
  role: "assistant",
  content:
    "Namaste! I can help you compare FD options in simple words and your language. Ask me which bank gives better returns for 1 year.",
  createdAt: new Date().toISOString(),
};

export default function Home() {
  const router = useRouter();
  const language: SupportedLanguage = "en";
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const localUserId = localStorage.getItem("userId");
    if (!localUserId) {
      router.replace("/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPhone");
        router.replace("/login");
        return;
      }

      if (user.uid !== localUserId) {
        localStorage.setItem("userId", user.uid);
      }

      const loadHistory = async () => {
        try {
          const historyResponse = await fetch(`/api/chat/history?userId=${user.uid}`);
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            const persistedMessages = Array.isArray(historyData?.messages)
              ? historyData.messages
                  .filter(
                    (entry: { role?: string; content?: string }) =>
                      (entry.role === "user" || entry.role === "assistant") &&
                      typeof entry.content === "string"
                  )
                  .map(
                    (entry: { role: "user" | "assistant"; content: string }): ChatMessage => ({
                      id: crypto.randomUUID(),
                      role: entry.role,
                      content: entry.content,
                      createdAt: new Date().toISOString(),
                    })
                  )
              : [];

            setMessages(persistedMessages.length > 0 ? persistedMessages : [initialMessage]);
          } else {
            setMessages([initialMessage]);
          }
        } catch {
          setMessages([initialMessage]);
        }
      };

      void loadHistory();
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleSignOut() {
    try {
      await signOut(auth);
    } finally {
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPhone");
      router.replace("/login");
    }
  }

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
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.replace("/login");
        throw new Error("Session expired. Please log in again.");
      }

      const payload: ChatRequest = {
        message: messageText,
        language,
        history: updatedMessages,
        userId,
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

  if (!isAuthReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking secure session...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <h1 className="text-base font-semibold text-slate-900">Blostem Assistant</h1>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </header>
      <MessageList messages={messages} isTyping={isTyping} listEndRef={listEndRef} />
      <ChatInput value={input} onChange={setInput} onSend={sendMessage} disabled={isTyping} language={language} />
    </main>
  );
}
