import type { ChatMessage } from "@/types/chat";
import { CheckCircle, Download } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isBookingSuccess =
    !isUser && message.content.includes("Booking Successful!");

  if (isBookingSuccess) {
    const bankMatch = message.content.match(/\*\*Bank:\*\*\s*(.+)/);
    const amountMatch = message.content.match(/\*\*Amount:\*\*\s*₹\s?(.+)/);
    const tenorMatch = message.content.match(/\*\*Tenor:\*\*\s*(.+)/);
    const transactionMatch = message.content.match(
      /\*\*Transaction ID:\*\*\s*(.+)/
    );

    const bankName = bankMatch?.[1]?.trim() || "N/A";
    const amount = amountMatch?.[1]?.trim() || "N/A";
    const tenor = tenorMatch?.[1]?.trim() || "N/A";
    const transactionId = transactionMatch?.[1]?.trim() || "N/A";

    return (
      <div className="flex justify-start">
        <div className="mt-2 w-full rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-700" />
            <h4 className="text-base font-bold text-emerald-800">
              Booking Confirmed
            </h4>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-600">
                Bank
              </p>
              <p className="text-sm font-semibold text-slate-800">{bankName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-600">
                Amount
              </p>
              <p className="text-sm font-semibold text-slate-800">₹{amount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-600">
                Tenor
              </p>
              <p className="text-sm font-semibold text-slate-800">{tenor}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-600">
                Transaction ID
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {transactionId}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    );
  }

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
