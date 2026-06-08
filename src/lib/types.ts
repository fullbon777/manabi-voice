export type InspectionItem = {
  title: string;
  detail: string;
  suggestion?: string;
};

export type AiInspection = {
  reconstructedContent: string;
  claims: InspectionItem[];
  vagueButNatural: InspectionItem[];
  needsClarification: InspectionItem[];
  insufficientExplanations: InspectionItem[];
  factCheckTargets: InspectionItem[];
  checkQuestions: string[];
  groundedExplanation: string;
  reviewQuestions: string[];
};

export type LearningLogView = AiInspection & {
  id: string;
  date: string;
  sourceText: string;
  createdAt: Date;
  updatedAt: Date;
};
