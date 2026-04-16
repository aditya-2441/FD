import { Globe, ShieldCheck } from "lucide-react";
import type { LanguageOption, SupportedLanguage } from "@/types/chat";

interface ChatHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  languageOptions: LanguageOption[];
}

export function ChatHeader({ language, onLanguageChange, languageOptions }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 text-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-indigo-300 sm:size-5" />
          <div>
            <p className="text-sm font-semibold sm:text-base">Vernacular FD Advisor</p>
            <p className="text-xs text-slate-300">Powered by Blostem</p>
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-200 shadow-sm">
          <Globe className="size-4 text-slate-300" />
          <div className="relative">
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}
            className="cursor-pointer appearance-none rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            aria-label="Select language"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code} className="text-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          </div>
        </label>
      </div>
    </header>
  );
}
