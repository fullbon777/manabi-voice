import Link from "next/link";
import { InspectionSections, QuestionList } from "@/components/InspectionSections";
import { formatDateTime } from "@/lib/date";
import { getLogById } from "@/lib/logs";

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await getLogById(id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">{formatDateTime(log.createdAt)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
            学びログ詳細
          </h1>
        </div>
        <div className="flex gap-2">
          <Link className="border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700" href="/">
            今日
          </Link>
          <Link
            className="border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700"
            href={`/days/${log.date}`}
          >
            {log.date}
          </Link>
        </div>
      </div>

      <section className="border border-zinc-200 bg-white p-5">
        <p className="text-sm font-medium text-zinc-500">復元内容</p>
        <p className="mt-3 text-lg leading-8 text-zinc-950">{log.reconstructedContent}</p>
      </section>

      <section className="border border-zinc-200 bg-white p-5">
        <p className="text-sm font-medium text-zinc-500">元の入力</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700">{log.sourceText}</p>
      </section>

      <InspectionSections log={log} />

      <QuestionList questions={log.checkQuestions} title="確認質問" />

      <section className="border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-950">根拠つき説明</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-700">{log.groundedExplanation}</p>
      </section>

      <QuestionList questions={log.reviewQuestions} title="復習質問" />
    </main>
  );
}
