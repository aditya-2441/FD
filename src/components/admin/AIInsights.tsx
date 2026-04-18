"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function AIInsights() {
  const [insightText, setInsightText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    try {
      setIsLoading(true);
      setInsightText("");

      const res = await fetch("/api/admin/insights");
      const data = (await res.json()) as
        | { success: true; insight: string }
        | { success: false; error: string };

      if (!res.ok || !("success" in data) || data.success === false) {
        throw new Error("success" in data && data.success === false ? data.error : "Failed to generate report");
      }

      setInsightText(data.insight || "");
    } catch (e) {
      setInsightText(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Sparkles className="h-4 w-4" />
        {isLoading ? "Generating..." : "Generate AI Strategy Report"}
      </button>

      {insightText ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <pre className="whitespace-pre-wrap font-sans">{insightText}</pre>
        </div>
      ) : null}
    </div>
  );
}

