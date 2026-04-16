import type { RefObject } from "react";
import type { ChatMessage } from "@/types/chat";
import { MessageBubble } from "@/components/chat/MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  listEndRef: RefObject<HTMLDivElement>;
}

export function MessageList({ messages, isTyping, listEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-4 py-5">
      <div className="mx-auto flex w-full max-w-3xl flex-col space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-2 rounded-full bg-slate-400 animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>
    </div>
  );
}
