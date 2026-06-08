import type { InspectionItem, LearningLogView } from "@/lib/types";

type Section = {
  title: string;
  description: string;
  items: InspectionItem[];
};

export function InspectionSections({ log }: { log: LearningLogView }) {
  const sections: Section[] = [
    {
      title: "主張",
      description: "話した内容の中で、事実や理解として言い切っている部分です。",
      items: log.claims,
    },
    {
      title: "自然だが曖昧",
      description: "会話としては自然でも、復習時に意味が揺れそうな表現です。",
      items: log.vagueButNatural,
    },
    {
      title: "確認したい曖昧さ",
      description: "理解の確認に必要な前提や対象が足りない可能性があります。",
      items: log.needsClarification,
    },
    {
      title: "説明不足",
      description: "理由、具体例、適用範囲などを補うと定着しやすい箇所です。",
      items: log.insufficientExplanations,
    },
    {
      title: "正誤確認候補",
      description: "後で資料や検索根拠にあたるべき可能性がある主張です。",
      items: log.factCheckTargets,
    },
  ];

  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <section className="border border-zinc-200 bg-white p-5" key={section.title}>
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-lg font-semibold text-zinc-950">{section.title}</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600">{section.description}</p>
          </div>
          <div className="mt-4 grid gap-3">
            {section.items.length === 0 ? (
              <p className="text-sm text-zinc-500">該当項目はありません。</p>
            ) : (
              section.items.map((item, index) => (
                <article className="bg-zinc-50 p-4" key={`${section.title}-${index}`}>
                  <h3 className="font-medium text-zinc-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{item.detail}</p>
                  {item.suggestion ? (
                    <p className="mt-3 border-l-2 border-emerald-500 pl-3 text-sm leading-6 text-emerald-900">
                      {item.suggestion}
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function QuestionList({ title, questions }: { title: string; questions: string[] }) {
  return (
    <section className="border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
      <ol className="mt-4 grid gap-3">
        {questions.map((question, index) => (
          <li className="flex gap-3 text-sm leading-6 text-zinc-700" key={question}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-zinc-900 text-xs font-semibold text-white">
              {index + 1}
            </span>
            <span>{question}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
