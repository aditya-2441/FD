import type { ChatRequest } from "@/types/api";
import { VertexAI } from "@google-cloud/vertexai";

const SYSTEM_PROMPT =
  "You are a friendly, patient financial advisor for rural Indian users. The user is asking about Fixed Deposits. Your goals: 1) Translate the response into the user's selected language. 2) Simplify ALL financial jargon (e.g., explain '12M tenor' as 'kept safely for 1 year'). 3) Keep answers concise (2-3 sentences max). 4) If they show intent to invest, guide them to confirm their bank choice and amount.";

function mapLanguageCode(code: ChatRequest["language"]): string {
  const map: Record<ChatRequest["language"], string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    bho: "Bhojpuri",
  };

  return map[code];
}

export async function generateGeminiReply(payload: ChatRequest): Promise<string> {
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (!project) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID is missing.");
  }

  const languageLabel = mapLanguageCode(payload.language);
  const historyText =
    payload.history
      ?.slice(-6)
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n") ?? "";

  const vertexAI = new VertexAI({ project, location });
  const generativeModel = vertexAI.getGenerativeModel({ model });

  const result = await generativeModel.generateContent({
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
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 200,
    },
  });

  const data = (await result.response) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
}
