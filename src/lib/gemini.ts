import type { ChatRequest } from "@/types/api";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT =
  "You are a friendly, patient financial advisor for rural Indian users. The user is asking about Fixed Deposits. Your goals: 1) Translate the response into the user's selected language. 2) Simplify ALL financial jargon (e.g., explain '12M tenor' as 'kept safely for 1 year'). 3) Keep answers concise (2-3 sentences max). 4) If they show intent to invest, guide them to confirm their bank choice and amount.";

function mapLanguageCode(code: ChatRequest["language"]): string {
  const map: Record<ChatRequest["language"], string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    bn: "Bengali",
  };

  return map[code];
}

export async function generateGeminiReply(payload: ChatRequest): Promise<string> {
  const project = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || "us-central1";
  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";

  if (!project) {
    throw new Error("GCP_PROJECT_ID is missing.");
  }

  const languageLabel = mapLanguageCode(payload.language);
  const historyText =
    payload.history
      ?.slice(-6)
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n") ?? "";

  const credentials = (() => {
    try {
      const rawJson = process.env.GCP_CREDENTIALS_JSON;
      if (!rawJson) {
        return null;
      }
      return JSON.parse(rawJson);
    } catch (error) {
      console.error("Failed to parse GCP Credentials:", error);
      return null;
    }
  })();

  const ai = new GoogleGenAI({
    vertexai: true,
    project,
    location,
    ...(credentials
      ? {
          googleAuthOptions: {
            credentials,
          },
        }
      : {}),
  });

  const result = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\nRespond in ${languageLabel}.\nConversation so far:\n${historyText}\nUser: ${payload.message}`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.6,
      maxOutputTokens: 200,
    },
  });

  const reply = result.text?.trim();
  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
}
