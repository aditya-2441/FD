import { Landmark, Languages } from "lucide-react";
import type { LanguageOption, SupportedLanguage } from "@/types/chat";

interface ChatHeaderProps {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  languageOptions: LanguageOption[];
}

export function ChatHeader({ language, onLanguageChange, languageOptions }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-blue-700 p-2 text-white shadow-lg shadow-blue-700/30">
            <Landmark className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Vernacular FD Advisor</p>
            <p className="text-xs text-slate-500">Simple guidance for safe savings</p>
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
          <Languages className="size-4 text-slate-500" />
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none"
            aria-label="Select language"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
