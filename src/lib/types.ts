export type InspectionItem = {
  title: string;
  detail: string;
  suggestion?: string;
};

export type AssessmentStatus =
  | "major_misunderstanding"
  | "mostly_correct_with_gaps"
  | "well_understood"
  | "uncertain";

export type InterventionType =
  | "explain_first"
  | "question_then_explain"
  | "extend_or_complete"
  | "cautious_follow_up";

export type LearningNote = {
  noteBody: string;
  footnotes: string[];
};

export type AiInspection = {
  title: string;
  assessmentStatus: AssessmentStatus;
  interventionType: InterventionType;
  learningNote: LearningNote;
  reconstructedContent: string;
  understoodPoints: InspectionItem[];
  possibleMisunderstandings: InspectionItem[];
  claims: InspectionItem[];
  vagueButNatural: InspectionItem[];
  needsClarification: InspectionItem[];
  insufficientExplanations: InspectionItem[];
  factCheckTargets: InspectionItem[];
  checkQuestions: string[];
  explanation: string;
  groundedExplanation: string;
  nextReviewQuestions: string[];
  reviewQuestions: string[];
};

export type LearningLogView = AiInspection & {
  id: string;
  date: string;
  sourceText: string;
  createdAt: Date;
  updatedAt: Date;
};
