import type { RefObject } from "react";
import type { ChatMessage } from "@/types/chat";
import { LoaderDots } from "@/components/ui/LoaderDots";
import { MessageBubble } from "@/components/chat/MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  listEndRef: RefObject<HTMLDivElement>;
}

export function MessageList({ messages, isTyping, listEndRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LoaderDots />
                typing...
              </div>
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>
    </div>
  );
}
