import type { AiInspection, InspectionItem } from "@/lib/types";

const claimMarkers = ["です", "である", "だった", "になる", "される", "できる"];
const vagueMarkers = ["それ", "これ", "なんか", "いろいろ", "すごく", "ちゃんと", "多分"];
const factMarkers = ["世界初", "必ず", "絶対", "一番", "すべて", "唯一", "最新"];

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

  return {
    reconstructedContent:
      `話した内容を、意味を落とさずに復元します。${normalized}` +
      (normalized.endsWith("。") ? "" : "。"),
    claims,
    vagueButNatural,
    needsClarification,
    insufficientExplanations,
    factCheckTargets,
    checkQuestions: [
      `「${anchor.slice(0, 48)}${anchor.length > 48 ? "..." : ""}」について、前提条件を一つ補足できますか？`,
      "その内容が成り立つ理由を、自分の言葉で一文追加できますか？",
      "具体例または反例を一つ挙げるなら何ですか？",
    ],
    groundedExplanation:
      "これは mock 分析です。外部検索や実 API は使わず、入力文の長さ、断定表現、曖昧語、文数から点検観点を作っています。実装後はこの同じ構造に AmiVoice/Gemini/検索根拠を接続できます。",
    reviewQuestions: [
      "今日の学びの中心概念を一文で説明してください。",
      "説明が不足していた箇所に、理由と具体例を足してください。",
      "正誤確認が必要な主張がある場合、確認に使う資料名を挙げてください。",
    ],
  };
}
