import type { ChatMessage, SupportedLanguage } from "@/types/chat";

export interface FDRate {
  bankName: string;
  rate: number;
  tenor: string;
}

export interface FDRatesResponse {
  success: boolean;
  data: FDRate[];
  fetchedAt: string;
}

export interface CreateFDRequest {
  amount: number;
  bankName: string;
  tenor: string;
}

export interface CreateFDResponse {
  success: boolean;
  transactionId: string;
  message: string;
  createdAt: string;
  data: CreateFDRequest;
}

export interface ChatRequest {
  message: string;
  language: SupportedLanguage;
  history?: ChatMessage[];
  userId?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}
