import { NextRequest } from "next/server";
import { z } from "zod";
import { createAiInspection } from "@/lib/analysis";
import { getLogsByDate, toLearningLogView } from "@/lib/logs";
import { prisma } from "@/lib/prisma";
import { getTodayDateString, isDateString } from "@/lib/date";

const createLogSchema = z.object({
  sourceText: z.string().trim().min(1).max(12000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !isDateString(date)) {
    return Response.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  const logs = await getLogsByDate(date);

  return Response.json({ logs });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createLogSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "sourceText is required", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const date = parsed.data.date ?? getTodayDateString();
  const analysis = await createAiInspection(parsed.data.sourceText, date);
  const log = await prisma.learningLog.create({
    data: {
      date,
      sourceText: parsed.data.sourceText,
      reconstructedContent: analysis.reconstructedContent,
      learningNote: {
        ...analysis.learningNote,
        title: analysis.title,
        assessmentStatus: analysis.assessmentStatus,
        interventionType: analysis.interventionType,
      },
      claims: analysis.claims,
      vagueButNatural: analysis.vagueButNatural,
      needsClarification: analysis.needsClarification,
      insufficientExplanations: analysis.insufficientExplanations,
      factCheckTargets: analysis.factCheckTargets,
      checkQuestions: analysis.checkQuestions,
      groundedExplanation: analysis.groundedExplanation,
      reviewQuestions: analysis.reviewQuestions,
    },
  });

  return Response.json({ log: { ...toLearningLogView(log), ...analysis } }, { status: 201 });
}
