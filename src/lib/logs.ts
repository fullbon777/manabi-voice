import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { AiInspection, LearningLogView } from "@/lib/types";

function asInspectionArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function toLearningLogView(log: {
  id: string;
  date: string;
  sourceText: string;
  reconstructedContent: string;
  claims: unknown;
  vagueButNatural: unknown;
  needsClarification: unknown;
  insufficientExplanations: unknown;
  factCheckTargets: unknown;
  checkQuestions: unknown;
  groundedExplanation: string;
  reviewQuestions: unknown;
  createdAt: Date;
  updatedAt: Date;
}): LearningLogView {
  return {
    id: log.id,
    date: log.date,
    sourceText: log.sourceText,
    reconstructedContent: log.reconstructedContent,
    claims: asInspectionArray(log.claims) as AiInspection["claims"],
    vagueButNatural: asInspectionArray(log.vagueButNatural) as AiInspection["vagueButNatural"],
    needsClarification: asInspectionArray(log.needsClarification) as AiInspection["needsClarification"],
    insufficientExplanations: asInspectionArray(
      log.insufficientExplanations,
    ) as AiInspection["insufficientExplanations"],
    factCheckTargets: asInspectionArray(log.factCheckTargets) as AiInspection["factCheckTargets"],
    checkQuestions: asStringArray(log.checkQuestions),
    groundedExplanation: log.groundedExplanation,
    reviewQuestions: asStringArray(log.reviewQuestions),
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

export async function getLogsByDate(date: string) {
  const logs = await prisma.learningLog.findMany({
    where: { date },
    orderBy: { createdAt: "desc" },
  });

  return logs.map(toLearningLogView);
}

export async function getLogById(id: string) {
  const log = await prisma.learningLog.findUnique({ where: { id } });

  if (!log) {
    notFound();
  }

  return toLearningLogView(log);
}
