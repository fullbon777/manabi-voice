import type {
  AiInspection,
  AssessmentStatus,
  InspectionItem,
  InterventionType,
  LearningNote,
} from "@/lib/types";

const templateQuestions = [
  "この説明の中心になる言葉は何ですか？",
  "具体例を1つ出せますか？",
  "なぜそうなると思いますか？",
  "どこまで分かっていて、どこがまだ曖昧ですか？",
  "一言で説明すると？",
];

function splitSentences(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[。！？!?])|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function makeItem(title: string, detail: string, suggestion?: string): InspectionItem {
  return { title, detail, suggestion };
}

function getStatus(normalized: string, sentences: string[]): AssessmentStatus {
  if (normalized.length < 60 || sentences.length < 2) {
    return "uncertain";
  }

  return "mostly_correct_with_gaps";
}

function getInterventionType(status: AssessmentStatus): InterventionType {
  return status === "uncertain" ? "cautious_follow_up" : "question_then_explain";
}

function getLearningNote(normalized: string, sentences: string[]): LearningNote {
  const baseText = sentences.slice(0, 3).join(" ") || normalized;

  return {
    noteBody:
      "今日の範囲では、" +
      baseText +
      (baseText.endsWith("。") ? "" : "。") +
      "このノートは、入力された表現のうち読み取れる正しい部分を中心に、あとで復習できる形へ整えたものです。外部AIを使えない状態のため、内容の正誤は断定せず、中心語、理由、具体例を確認しながら補う前提で残します。",
    footnotes: ["※ Geminiを呼べないため、テンプレ質問で確認する保存モードです。"],
  };
}

export function createTemplateAnalysis(sourceText: string, reason: string): AiInspection {
  const normalized = sourceText.trim().replace(/\s+/g, " ");
  const sentences = splitSentences(normalized);
  const assessmentStatus = getStatus(normalized, sentences);
  const interventionType = getInterventionType(assessmentStatus);
  const learningNote = getLearningNote(normalized, sentences);
  const understoodPoints =
    sentences.length > 0
      ? sentences.slice(0, 2).map((sentence, index) =>
          makeItem(
            `読み取れた内容 ${index + 1}`,
            sentence,
            "中心語、理由、具体例を足すと、理解状態を確認しやすくなります。",
          ),
        )
      : [
          makeItem(
            "読み取れた内容",
            "入力文から学習対象を十分に特定できませんでした。",
            "何について学んだのかを一文で補足してください。",
          ),
        ];
  const possibleMisunderstandings = [
    makeItem(
      "断定は保留",
      "外部AIによる実評価を行っていないため、誤解の有無は断定していません。",
      "次の確認質問に答えると、理解の輪郭を出しやすくなります。",
    ),
  ];
  const insufficientExplanations = [
    makeItem(
      "確認材料が不足",
      "理由、前提、具体例のどれかを補う必要があります。",
      "テンプレ質問から答えやすいものを一つ選んで追記してください。",
    ),
  ];
  const factCheckTargets = [
    makeItem(
      "正誤確認は未実施",
      "Geminiを呼ばないfallbackのため、事実確認候補の抽出は最小限です。",
    ),
  ];
  const explanation =
    `Gemini分析を使えないため、外部APIなしのテンプレ質問モードで保存しました。理由: ${reason}`;

  return {
    title: sentences[0]?.slice(0, 40) || "テンプレ確認ログ",
    assessmentStatus,
    interventionType,
    learningNote,
    reconstructedContent:
      `話した内容を、意味を落とさずに復元します。${normalized}` +
      (normalized.endsWith("。") ? "" : "。"),
    understoodPoints,
    possibleMisunderstandings,
    claims: understoodPoints,
    vagueButNatural: [],
    needsClarification: possibleMisunderstandings,
    insufficientExplanations,
    factCheckTargets,
    checkQuestions: templateQuestions,
    explanation,
    groundedExplanation: explanation,
    nextReviewQuestions: templateQuestions.slice(0, 3),
    reviewQuestions: templateQuestions.slice(0, 3),
  };
}
