import type { AiInspection } from "@/lib/types";
import { createGeminiAnalysis } from "@/lib/gemini-analysis";
import { reserveGeminiDailyUse } from "@/lib/gemini-usage";
import { createMockAnalysis } from "@/lib/mock-analysis";
import { createTemplateAnalysis } from "@/lib/template-analysis";

function getAiMode() {
  return (process.env.AI_MODE || "mock").trim().toLowerCase();
}

export async function createAiInspection(sourceText: string, date: string): Promise<AiInspection> {
  const mode = getAiMode();

  if (mode !== "gemini") {
    return createMockAnalysis(sourceText);
  }

  if (!process.env.GEMINI_API_KEY) {
    return createTemplateAnalysis(sourceText, "GEMINI_API_KEY is not set");
  }

  const usage = await reserveGeminiDailyUse(date);

  if (!usage.allowed) {
    return createTemplateAnalysis(
      sourceText,
      `daily Gemini limit reached (${usage.count}/${usage.limit})`,
    );
  }

  try {
    return await createGeminiAnalysis(sourceText);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown Gemini error";

    return createTemplateAnalysis(sourceText, reason);
  }
}
