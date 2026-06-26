import Link from "next/link";
import { formatDateTime } from "@/lib/date";
import type { AssessmentStatus, LearningLogView } from "@/lib/types";

export function LogList({ logs }: { logs: LearningLogView[] }) {
  if (logs.length === 0) {
    return (
      <div className="border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
        まだ学びログがありません。話した内容やテキストから、点検つきのログを作成できます。
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
                {log.learningNote.noteBody}
              </h2>
            </div>
            <span className="shrink-0 border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
              {assessmentLabel[log.assessmentStatus]} / 点検 {inspectionCount(log)} 件
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">{log.sourceText}</p>
        </Link>
      ))}
    </div>
  );
}

function inspectionCount(log: LearningLogView) {
  return (
    log.claims.length +
    log.needsClarification.length +
    log.insufficientExplanations.length +
    log.factCheckTargets.length
  );
}

const assessmentLabel: Record<AssessmentStatus, string> = {
  major_misunderstanding: "先に解説",
  mostly_correct_with_gaps: "確認質問",
  well_understood: "発展・完了",
  uncertain: "追加確認",
};
