import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type {
  AiInspection,
  AssessmentStatus,
  InterventionType,
  LearningNote,
  LearningLogView,
} from "@/lib/types";

function asInspectionArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asLearningNote(value: unknown, fallback: string): LearningNote {
  if (
    typeof value === "object" &&
    value !== null &&
    "noteBody" in value &&
    "footnotes" in value
  ) {
    const note = value as { noteBody: unknown; footnotes: unknown };

    if (typeof note.noteBody === "string") {
      return {
        noteBody: note.noteBody,
        footnotes: asStringArray(note.footnotes),
      };
    }
  }

  return {
    noteBody: fallback,
    footnotes: [],
  };
}

function deriveAssessmentStatus(sourceText: string): AssessmentStatus {
  const normalized = sourceText.trim().replace(/\s+/g, " ");
  const sentences = normalized
    .split(/(?<=[。！？!?])|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const hasMajorMisunderstanding = [
    "誤解",
    "間違",
    "逆",
    "関係ない",
    "同じもの",
    "必要ない",
    "不要",
  ].some((marker) => normalized.includes(marker));
  const hasVagueMarker = ["それ", "これ", "なんか", "いろいろ", "すごく", "ちゃんと", "多分"].some(
    (marker) => normalized.includes(marker),
  );

  if (hasMajorMisunderstanding) {
    return "major_misunderstanding";
  }

  if (normalized.length < 60 || sentences.length < 2) {
    return "uncertain";
  }

  if (normalized.length >= 180 && sentences.length >= 4 && !hasVagueMarker) {
    return "well_understood";
  }

  return "mostly_correct_with_gaps";
}

function deriveInterventionType(status: AssessmentStatus): InterventionType {
  switch (status) {
    case "major_misunderstanding":
      return "explain_first";
    case "well_understood":
      return "extend_or_complete";
    case "uncertain":
      return "cautious_follow_up";
    case "mostly_correct_with_gaps":
    default:
      return "question_then_explain";
  }
}

export function toLearningLogView(log: {
  id: string;
  date: string;
  sourceText: string;
  reconstructedContent: string;
  learningNote: unknown;
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
  const assessmentStatus = deriveAssessmentStatus(log.sourceText);
  const interventionType = deriveInterventionType(assessmentStatus);

  return {
    id: log.id,
    date: log.date,
    sourceText: log.sourceText,
    assessmentStatus,
    interventionType,
    learningNote: asLearningNote(log.learningNote, log.reconstructedContent),
    reconstructedContent: log.reconstructedContent,
    claims: asInspectionArray(log.claims) as AiInspection["claims"],
    vagueButNatural: asInspectionArray(log.vagueButNatural) as AiInspection["vagueButNatural"],
    needsClarification: asInspectionArray(log.needsClarification) as AiInspection["needsClarification"],
    insufficientExplanations: asInspectionArray(
      log.insufficientExplanations,
    ) as AiInspection["insufficientExplanations"],
    factCheckTargets: asInspectionArray(log.factCheckTargets) as AiInspection["factCheckTargets"],
    checkQuestions: asStringArray(log.checkQuestions),
    explanation: log.groundedExplanation,
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
