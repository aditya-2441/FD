import type { ChatMessage } from "@/types/chat";
import type { SupportedLanguage } from "@/types/chat";
import { CheckCircle, Download, Volume2 } from "lucide-react";
import { generateFDReceipt } from "@/lib/generateReceipt";
import { speakMessage } from "@/lib/tts";

interface MessageBubbleProps {
  message: ChatMessage;
  language: SupportedLanguage;
}

export function MessageBubble({ message, language }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isBookingSuccess =
    !isUser && message.content.includes("Booking Successful!");

  if (isBookingSuccess) {
    const bankMatch = message.content.match(/\*\*Bank:\*\*\s*(.+)/);
    const amountMatch = message.content.match(/\*\*Amount:\*\*\s*₹\s?(.+)/);
    const tenorMatch = message.content.match(/\*\*Tenor:\*\*\s*(.+)/);
    const interestRateMatch = message.content.match(/\*\*Interest Rate:\*\*\s*(.+)/);
    const maturityAmountMatch = message.content.match(/\*\*Maturity Amount:\*\*\s*₹\s?(.+)/);
    const transactionMatch = message.content.match(
      /\*\*Transaction ID:\*\*\s*(.+)/
    );

    const bankName = bankMatch?.[1]?.trim() || "N/A";
    const amount = amountMatch?.[1]?.trim() || "N/A";
    const tenor = tenorMatch?.[1]?.trim() || "N/A";
    const interestRate = interestRateMatch?.[1]?.trim() || "N/A";
    const maturityAmount = maturityAmountMatch?.[1]?.trim() || "N/A";
    const transactionId = transactionMatch?.[1]?.trim() || "N/A";

    const parseNumber = (value: string) =>
      Number.parseFloat(value.replace(/[^\d.]/g, ""));

    const handleDownload = async () => {
      const uid = localStorage.getItem("userId");
      if (!uid) {
        return;
      }

      const res = await fetch(`/api/user?uid=${uid}`);
      if (!res.ok) {
        return;
      }

      const dbUserResponse = await res.json();
      const dbUser = dbUserResponse?.user;
      const currentUser = {
        name: dbUser?.name || "Blostem Customer",
        email: dbUser?.email || "N/A",
        phone: dbUser?.phone || "N/A",
      };

      generateFDReceipt(
        {
          transactionId,
          bankName,
          amount: parseNumber(amount),
          tenor,
          interestRate: parseNumber(interestRate),
          maturityAmount: parseNumber(maturityAmount),
        },
        currentUser
      );
    };

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
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-600">
                Interest Rate
              </p>
              <p className="text-sm font-semibold text-slate-800">{interestRate}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-600">
                Maturity Amount
              </p>
              <p className="text-sm font-semibold text-slate-800">₹{maturityAmount}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
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
      <div className="max-w-[85%] md:max-w-[70%]">
        <div
          className={`px-5 py-3.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-2xl rounded-tr-sm bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20"
              : "rounded-2xl rounded-tl-sm border border-slate-100 bg-white text-slate-800 shadow-sm"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="whitespace-pre-wrap">{message.content}</div>

            {message.role === "assistant" ? (
              <button
                type="button"
                onClick={() => speakMessage(message.content, language)}
                className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Replay message"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
