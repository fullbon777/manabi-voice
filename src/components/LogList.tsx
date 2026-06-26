import Link from "next/link";
import { formatDateTime } from "@/lib/date";
import type { AssessmentStatus, InterventionType, LearningLogView } from "@/lib/types";

type LogListVariant = "default" | "compact";

export function LogList({
  logs,
  variant = "default",
}: {
  logs: LearningLogView[];
  variant?: LogListVariant;
}) {
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
          className={`block transition hover:bg-emerald-50 ${
            variant === "compact" ? "p-4" : "p-5"
          }`}
          href={`/logs/${log.id}`}
          key={log.id}
        >
          <div
            className={`flex flex-col gap-2 ${
              variant === "compact" ? "" : "sm:flex-row sm:items-start sm:justify-between"
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {formatDateTime(log.createdAt)}
              </p>
              <h2
                className={`mt-1 line-clamp-2 font-semibold text-zinc-950 ${
                  variant === "compact" ? "text-base leading-6" : "text-lg"
                }`}
              >
                {log.title}
              </h2>
            </div>
            <span
              className={`w-fit shrink-0 border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-800 ${
                variant === "compact" ? "px-2 py-0.5" : "px-2.5 py-1"
              }`}
              title={inspectionLabel(log)}
            >
              {variant === "compact"
                ? compactStatusLabel(log)
                : `${assessmentLabel[log.assessmentStatus]} / ${inspectionLabel(log)}`}
            </span>
          </div>
          <p
            className={`mt-3 text-sm leading-6 text-zinc-700 ${
              variant === "compact" ? "line-clamp-2" : "line-clamp-3"
            }`}
          >
            {log.sourceText}
          </p>
          {variant === "default" ? (
            <p className="mt-3 line-clamp-2 border-l-2 border-emerald-200 pl-3 text-sm leading-6 text-zinc-500">
              {log.learningNote.noteBody}
            </p>
          ) : null}
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

const compactAssessmentLabel: Record<AssessmentStatus, string> = {
  major_misunderstanding: "補足あり",
  mostly_correct_with_gaps: "問いあり",
  well_understood: "よく理解",
  uncertain: "確認中",
};

const compactInterventionLabel: Partial<Record<InterventionType, string>> = {
  explain_first: "補足あり",
  question_then_explain: "問いあり",
  extend_or_complete: "よく理解",
  cautious_follow_up: "確認中",
};

function compactStatusLabel(log: LearningLogView) {
  return (
    compactInterventionLabel[log.interventionType] ?? compactAssessmentLabel[log.assessmentStatus]
  );
}
