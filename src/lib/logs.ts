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

function titleFromLearningNote(value: unknown, fallback: string) {
  if (typeof value === "object" && value !== null && "title" in value) {
    const note = value as { title: unknown };

    if (typeof note.title === "string" && note.title.trim().length > 0) {
      return note.title;
    }
  }

  return fallback.slice(0, 40) || "学びログ";
}

function assessmentStatusFromLearningNote(
  value: unknown,
  fallback: AssessmentStatus,
): AssessmentStatus {
  if (typeof value === "object" && value !== null && "assessmentStatus" in value) {
    const note = value as { assessmentStatus: unknown };

    if (
      note.assessmentStatus === "major_misunderstanding" ||
      note.assessmentStatus === "mostly_correct_with_gaps" ||
      note.assessmentStatus === "well_understood" ||
      note.assessmentStatus === "uncertain"
    ) {
      return note.assessmentStatus;
    }
  }

  return fallback;
}

function interventionTypeFromLearningNote(
  value: unknown,
  fallback: InterventionType,
): InterventionType {
  if (typeof value === "object" && value !== null && "interventionType" in value) {
    const note = value as { interventionType: unknown };

    if (
      note.interventionType === "explain_first" ||
      note.interventionType === "question_then_explain" ||
      note.interventionType === "extend_or_complete" ||
      note.interventionType === "cautious_follow_up"
    ) {
      return note.interventionType;
    }
  }

  return fallback;
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
  const derivedAssessmentStatus = deriveAssessmentStatus(log.sourceText);
  const assessmentStatus = assessmentStatusFromLearningNote(
    log.learningNote,
    derivedAssessmentStatus,
  );
  const interventionType = interventionTypeFromLearningNote(
    log.learningNote,
    deriveInterventionType(assessmentStatus),
  );

  return {
    title: titleFromLearningNote(log.learningNote, log.sourceText),
    id: log.id,
    date: log.date,
    sourceText: log.sourceText,
    assessmentStatus,
    interventionType,
    learningNote: asLearningNote(log.learningNote, log.reconstructedContent),
    reconstructedContent: log.reconstructedContent,
    understoodPoints: asInspectionArray(log.claims) as AiInspection["understoodPoints"],
    possibleMisunderstandings: asInspectionArray(
      log.needsClarification,
    ) as AiInspection["possibleMisunderstandings"],
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
    nextReviewQuestions: asStringArray(log.reviewQuestions),
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
