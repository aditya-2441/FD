import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed md:max-w-[70%] ${
          isUser
            ? "rounded-2xl rounded-tr-sm bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20"
            : "rounded-2xl rounded-tl-sm border border-slate-100 bg-white text-slate-800 shadow-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
