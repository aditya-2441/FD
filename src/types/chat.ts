export type ChatRole = "user" | "assistant";

export type SupportedLanguage = "en" | "hi" | "mr" | "bn";

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}
