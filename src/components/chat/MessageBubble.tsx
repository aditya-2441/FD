"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm md:max-w-[70%] ${
          isUser
            ? "rounded-br-md bg-blue-700 text-white shadow-blue-700/20"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}
