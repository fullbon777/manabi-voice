import Link from "next/link";
import { formatDateTime } from "@/lib/date";
import type { AssessmentStatus, LearningLogView } from "@/lib/types";

export function LogList({ logs }: { logs: LearningLogView[] }) {
  if (logs.length === 0) {
    return (
      <div className="border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
        まだ日誌がありません。話したことや書いたことから、点検つきの学び日誌を残せます。
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
      {logs.map((log) => (
        <Link
          className="block p-5 transition hover:bg-emerald-50"
          href={`/logs/${log.id}`}
          key={log.id}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {formatDateTime(log.createdAt)}
              </p>
              <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-zinc-950">
                {log.title}
              </h2>
            </div>
            <span className="shrink-0 border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
              {assessmentLabel[log.assessmentStatus]} / {inspectionLabel(log)}
            </span>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-700">{log.sourceText}</p>
          <p className="mt-3 line-clamp-2 border-l-2 border-emerald-200 pl-3 text-sm leading-6 text-zinc-500">
            {log.learningNote.noteBody}
          </p>
        </Link>
      ))}
    </div>
  );
}

function inspectionLabel(log: LearningLogView) {
  const count =
    log.claims.length +
    log.needsClarification.length +
    log.insufficientExplanations.length +
    log.factCheckTargets.length;

  if (count === 0) {
    return "理解メモつき";
  }

  return `点検メモ ${count}件`;
}

const assessmentLabel: Record<AssessmentStatus, string> = {
  major_misunderstanding: "先に解説",
  mostly_correct_with_gaps: "確認質問",
  well_understood: "発展・完了",
  uncertain: "追加確認",
};
