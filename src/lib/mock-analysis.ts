import type {
  AiInspection,
  AssessmentStatus,
  InspectionItem,
  InterventionType,
  LearningNote,
} from "@/lib/types";

const claimMarkers = ["です", "である", "だった", "になる", "される", "できる"];
const vagueMarkers = ["それ", "これ", "なんか", "いろいろ", "すごく", "ちゃんと", "多分"];
const factMarkers = ["世界初", "必ず", "絶対", "一番", "すべて", "唯一", "最新"];
const misunderstandingMarkers = ["誤解", "間違", "逆", "関係ない", "同じもの", "必要ない", "不要"];

function splitSentences(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[。！？!?])|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function firstOrFallback(sentences: string[], fallback: string) {
  return sentences.find((sentence) => sentence.length > 0) ?? fallback;
}

function makeItem(title: string, detail: string, suggestion?: string): InspectionItem {
  return { title, detail, suggestion };
}

function getAssessmentStatus({
  normalized,
  sentences,
  vagueSentences,
}: {
  normalized: string;
  sentences: string[];
  vagueSentences: string[];
}): AssessmentStatus {
  if (misunderstandingMarkers.some((marker) => normalized.includes(marker))) {
    return "major_misunderstanding";
  }

  if (normalized.length < 60 || sentences.length < 2) {
    return "uncertain";
  }

  if (normalized.length >= 180 && sentences.length >= 4 && vagueSentences.length === 0) {
    return "well_understood";
  }

  return "mostly_correct_with_gaps";
}

function getInterventionType(status: AssessmentStatus): InterventionType {
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

function getCheckQuestions(status: AssessmentStatus, anchor: string) {
  const clippedAnchor = `${anchor.slice(0, 48)}${anchor.length > 48 ? "..." : ""}`;

  switch (status) {
    case "major_misunderstanding":
      return [
        "解説を読んだあと、どの前提が違っていたかを一文で言い直せますか？",
        "正しい説明では、何と何を区別する必要がありますか？",
      ];
    case "well_understood":
      return [
        `「${clippedAnchor}」を別の具体例に当てはめるとどう説明できますか？`,
        "今日の理解を一段深めるなら、どの例外や限界を調べますか？",
        "今日はここで完了にするなら、復習時に見る一文をどう残しますか？",
      ];
    case "uncertain":
      return [
        "何について学んだ説明なのか、対象や場面を一つ補足できますか？",
        "結論だけでなく、なぜそうなるのかを一文足せますか？",
      ];
    case "mostly_correct_with_gaps":
    default:
      return [
        `「${clippedAnchor}」について、前提条件を一つ補足できますか？`,
        "その内容が成り立つ理由を、自分の言葉で一文追加できますか？",
        "具体例または反例を一つ挙げるなら何ですか？",
      ];
  }
}

function getExplanation(status: AssessmentStatus) {
  switch (status) {
    case "major_misunderstanding":
      return "これは mock 点検です。入力に誤解や逆転を示す表現が含まれているため、確認質問より先に、前提のズレをやわらかく直す介入として扱います。実運用では、どの部分が誤解かを具体的に指摘し、正しい説明と、誤解が起きやすい理由を提示します。外部検索や実 API は使っていません。";
    case "well_understood":
      return "これは mock 点検です。説明量があり、強い曖昧語も少ないため、無理に詰問せず、発展質問や復習用の問いに寄せます。実運用では、今日の説明範囲を保ったまま、応用例、例外、次に調べる観点を提示します。外部検索や実 API は使っていません。";
    case "uncertain":
      return "これは mock 点検です。入力が短い、または判断材料が少ないため、理解状態を強く断定せず、追加の文脈を求める介入として扱います。実運用では、不足している対象、理由、具体例を確認します。外部検索や実 API は使っていません。";
    case "mostly_correct_with_gaps":
    default:
      return "これは mock 点検です。大筋は説明できている可能性がある一方で、曖昧さ、説明不足、条件の不足が残る状態として扱います。確認質問で先に考える余地を残し、その後に正しい答えと、今日話した範囲に対する詳しい解説を返す想定です。外部検索や実 API は使っていません。";
  }
}

function getLearningNote({
  assessmentStatus,
  normalized,
  sentences,
}: {
  assessmentStatus: AssessmentStatus;
  normalized: string;
  sentences: string[];
}): LearningNote {
  const scopeSentences = sentences.length > 0 ? sentences.slice(0, 3) : [normalized];
  const baseText = scopeSentences.join(" ");
  const noteBody =
    "今日の範囲では、" +
    baseText +
    (baseText.endsWith("。") ? "" : "。") +
    "この説明は、話した内容の中心を残しながら、学んだことをあとで読み返せる形に整えた理解ノートです。前提や条件が足りないところは、今日扱った範囲を外へ広げすぎないように補うと、理解の輪郭がはっきりします。具体例を書くなら、最後に一つだけ短く添えるくらいで十分です。";

  const footnotes: string[] = [];

  if (assessmentStatus === "major_misunderstanding") {
    footnotes.push("※ 誤解を示す表現があるため、正しい前提に置き換えて読み直してください。");
  }

  if (assessmentStatus === "uncertain") {
    footnotes.push("※ 入力が短いため、対象、理由、使う場面の補足が必要です。");
  }

  if (assessmentStatus === "mostly_correct_with_gaps") {
    footnotes.push("※ 大筋は残せますが、条件や理由を一文足すと理解ノートとして安定します。");
  }

  return { noteBody, footnotes };
}

function getReviewQuestions(status: AssessmentStatus) {
  switch (status) {
    case "major_misunderstanding":
      return [
        "誤解していた前提を、正しい前提に置き換えて一文で説明してください。",
        "似ているが別物の概念がある場合、その違いを一つ挙げてください。",
        "次回の復習で、同じ誤解を避けるための確認ポイントを書いてください。",
      ];
    case "well_understood":
      return [
        "今日の学びの中心概念を一文で説明してください。",
        "別の具体例に当てはめて、同じ考え方が使えるか確認してください。",
        "今日はここで完了するなら、次回見返す一文を残してください。",
      ];
    case "uncertain":
      return [
        "何について学んだのか、対象を具体名で書いてください。",
        "結論、理由、具体例をそれぞれ一文で足してください。",
        "正誤確認が必要な主張がある場合、確認に使う資料名を挙げてください。",
      ];
    case "mostly_correct_with_gaps":
    default:
      return [
        "今日の学びの中心概念を一文で説明してください。",
        "説明が不足していた箇所に、理由と具体例を足してください。",
        "正誤確認が必要な主張がある場合、確認に使う資料名を挙げてください。",
      ];
  }
}

export function createMockAnalysis(sourceText: string): AiInspection {
  const normalized = sourceText.trim().replace(/\s+/g, " ");
  const sentences = splitSentences(normalized);
  const anchor = firstOrFallback(sentences, normalized);
  const claimSentences = sentences.filter((sentence) =>
    claimMarkers.some((marker) => sentence.includes(marker)),
  );
  const vagueSentences = sentences.filter((sentence) =>
    vagueMarkers.some((marker) => sentence.includes(marker)),
  );
  const factSentences = sentences.filter((sentence) =>
    factMarkers.some((marker) => sentence.includes(marker)),
  );
  const assessmentStatus = getAssessmentStatus({ normalized, sentences, vagueSentences });
  const interventionType = getInterventionType(assessmentStatus);

  const claims =
    claimSentences.length > 0
      ? claimSentences.slice(0, 4).map((sentence, index) =>
          makeItem(
            `主張 ${index + 1}`,
            sentence,
            "根拠や条件を添えると、あとで正誤確認しやすくなります。",
          ),
        )
      : [
          makeItem(
            "明示的な主張は少なめ",
            anchor,
            "何を学んだのか、因果関係や定義を一文で言い切るとログの再利用性が上がります。",
          ),
        ];

  const vagueButNatural =
    vagueSentences.length > 0
      ? vagueSentences.slice(0, 3).map((sentence) =>
          makeItem(
            "自然だが曖昧な表現",
            sentence,
            "文脈で通じる範囲です。重要語だけは具体名に置き換えると、復習時に迷いにくくなります。",
          ),
        )
      : [
          makeItem(
            "大きな曖昧さは検出なし",
            "mock 点検では、理解を妨げるほどの代名詞やぼかし表現は強く出ていません。",
          ),
        ];

  const needsClarification =
    normalized.length < 80
      ? [
          makeItem(
            "説明の前提が短い",
            "入力が短いため、何について学んだのかは分かっても、前提や適用範囲が確認しきれません。",
            "対象、理由、具体例を一つずつ足して話し直すと確認しやすくなります。",
          ),
        ]
      : [];

  const insufficientExplanations =
    sentences.length < 3
      ? [
          makeItem(
            "理由と例が不足",
            "学んだ内容の結論はありますが、なぜそうなるのか、どんな場面で使うのかがまだ薄いです。",
            "「なぜ」「例」「例外」の順で一文ずつ追加してください。",
          ),
        ]
      : [
          makeItem(
            "説明量は最低限あり",
            "複数の文があり、結論だけで終わってはいません。重要な語の定義があるとさらに安定します。",
          ),
        ];

  const factCheckTargets =
    factSentences.length > 0
      ? factSentences.slice(0, 3).map((sentence) =>
          makeItem(
            "正誤確認候補",
            sentence,
            "断定が強いため、後で一次情報や信頼できる資料で確認する対象にします。",
          ),
        )
      : [
          makeItem(
            "強い正誤確認候補は検出なし",
            "mock 点検では、検索で裏取りすべき強い断定は目立っていません。",
          ),
        ];

  const explanation = getExplanation(assessmentStatus);
  const learningNote = getLearningNote({ assessmentStatus, normalized, sentences });

  return {
    assessmentStatus,
    interventionType,
    learningNote,
    reconstructedContent:
      `話した内容を、意味を落とさずに復元します。${normalized}` +
      (normalized.endsWith("。") ? "" : "。"),
    claims,
    vagueButNatural,
    needsClarification,
    insufficientExplanations,
    factCheckTargets,
    checkQuestions: getCheckQuestions(assessmentStatus, anchor),
    explanation,
    groundedExplanation: explanation,
    reviewQuestions: getReviewQuestions(assessmentStatus),
  };
}
