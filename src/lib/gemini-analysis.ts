import { z } from "zod";
import type { AiInspection, AssessmentStatus, InspectionItem, InterventionType } from "@/lib/types";

const maxGeminiInputLength = 1500;
const maxGeminiAttempts = 2;

const inspectionItemSchema = z.object({
  title: z.string(),
  detail: z.string(),
  suggestion: z.string().optional(),
});

const assessmentStatusSchema = z.enum([
  "major_misunderstanding",
  "mostly_correct_with_gaps",
  "well_understood",
  "uncertain",
]);

const interventionTypeSchema = z.enum([
  "explain_first",
  "question_then_explain",
  "extend_or_complete",
  "cautious_follow_up",
]);

const geminiInspectionSchema = z.object({
  title: z.string(),
  reconstructedContent: z.string(),
  learningNote: z.object({
    noteBody: z.string(),
    footnotes: z.array(z.string()),
  }),
  assessmentStatus: assessmentStatusSchema,
  interventionType: interventionTypeSchema,
  understoodPoints: z.array(inspectionItemSchema),
  possibleMisunderstandings: z.array(inspectionItemSchema),
  insufficientExplanations: z.array(inspectionItemSchema),
  factCheckTargets: z.array(inspectionItemSchema),
  checkQuestions: z.array(z.string()),
  explanation: z.string(),
  nextReviewQuestions: z.array(z.string()),
});

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function getExpectedInterventionType(status: AssessmentStatus): InterventionType {
  switch (status) {
    case "major_misunderstanding":
      return "explain_first";
    case "mostly_correct_with_gaps":
      return "question_then_explain";
    case "well_understood":
      return "extend_or_complete";
    case "uncertain":
    default:
      return "cautious_follow_up";
  }
}

function normalizeItems(items: InspectionItem[]) {
  return items.map((item) => ({
    title: item.title,
    detail: item.detail,
    suggestion: item.suggestion,
  }));
}

function buildPrompt(sourceText: string) {
  return `あなたは、ユーザーが自分の言葉で説明した学習内容を点検する学習支援AIです。このアプリは要約アプリではありません。

入力を評価し、必ずJSONだけを返してください。Markdownやコードフェンスは禁止です。

判定方針:
- かなり間違っている: assessmentStatus="major_misunderstanding", interventionType="explain_first"
- 大筋は合っているが不足あり: assessmentStatus="mostly_correct_with_gaps", interventionType="question_then_explain"
- かなり正しい: assessmentStatus="well_understood", interventionType="extend_or_complete"
- 判断材料が足りない: assessmentStatus="uncertain", interventionType="cautious_follow_up"

learningNote:
- noteBody は、ユーザーが話した表現のうち正しい部分をもとにした今日の範囲の解説文にする
- ユーザーの言い方をなるべく活かす
- 話していない内容を広げすぎない
- 足りない前提は自然に補ってよい
- 具体例を書く場合は最後に少しだけ
- footnotes は誤解・不足・注意点を「※」で始まる短い文にする
- 誤解や不足がなければ footnotes は空配列にする

返すJSONのキー:
title, reconstructedContent, learningNote, assessmentStatus, interventionType, understoodPoints, possibleMisunderstandings, insufficientExplanations, factCheckTargets, checkQuestions, explanation, nextReviewQuestions

understoodPoints, possibleMisunderstandings, insufficientExplanations, factCheckTargets は { "title": string, "detail": string, "suggestion"?: string } の配列です。

入力:
${sourceText}`;
}

function extractText(payload: GeminiResponse) {
  return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

function parseJsonText(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("Gemini response did not contain JSON.");
  }

  return JSON.parse(match[0]);
}

function toAiInspection(parsed: z.infer<typeof geminiInspectionSchema>): AiInspection {
  const interventionType = getExpectedInterventionType(parsed.assessmentStatus);
  const understoodPoints = normalizeItems(parsed.understoodPoints);
  const possibleMisunderstandings = normalizeItems(parsed.possibleMisunderstandings);
  const insufficientExplanations = normalizeItems(parsed.insufficientExplanations);
  const factCheckTargets = normalizeItems(parsed.factCheckTargets);

  return {
    title: parsed.title,
    assessmentStatus: parsed.assessmentStatus,
    interventionType,
    learningNote: parsed.learningNote,
    reconstructedContent: parsed.reconstructedContent,
    understoodPoints,
    possibleMisunderstandings,
    claims: understoodPoints,
    vagueButNatural: [],
    needsClarification: possibleMisunderstandings,
    insufficientExplanations,
    factCheckTargets,
    checkQuestions: parsed.checkQuestions,
    explanation: parsed.explanation,
    groundedExplanation: parsed.explanation,
    nextReviewQuestions: parsed.nextReviewQuestions,
    reviewQuestions: parsed.nextReviewQuestions,
  };
}

function isQuotaError(status: number, bodyText: string) {
  return status === 429 || /quota|rate limit|resource exhausted/i.test(bodyText);
}

function getGeminiErrorReason(status: number, bodyText: string) {
  if (isQuotaError(status, bodyText)) {
    return "Gemini quota or rate limit was reached";
  }

  if (status === 503) {
    return "Gemini API is temporarily unavailable (status 503)";
  }

  return `Gemini API failed with status ${status}`;
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestGeminiAnalysis({
  apiKey,
  model,
  sourceText,
}: {
  apiKey: string;
  model: string;
  sourceText: string;
}) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(sourceText) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 3000,
          responseMimeType: "application/json",
        },
      }),
    },
  );
}

export async function createGeminiAnalysis(sourceText: string): Promise<AiInspection> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const limitedSourceText = sourceText.trim().slice(0, maxGeminiInputLength);
  let lastErrorReason = "unknown Gemini error";

  for (let attempt = 1; attempt <= maxGeminiAttempts; attempt += 1) {
    const response = await requestGeminiAnalysis({
      apiKey,
      model,
      sourceText: limitedSourceText,
    });
    const bodyText = await response.text();

    if (response.ok) {
      const payload = JSON.parse(bodyText) as GeminiResponse;
      const text = extractText(payload);
      const parsed = geminiInspectionSchema.parse(parseJsonText(text));

      return toAiInspection(parsed);
    }

    lastErrorReason = getGeminiErrorReason(response.status, bodyText);

    if (response.status === 503 && attempt < maxGeminiAttempts) {
      await wait(1200);
      continue;
    }

    break;
  }

  throw new Error(lastErrorReason);
}
