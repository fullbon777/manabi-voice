import Link from "next/link";
import { LogList } from "@/components/LogList";
import { getLogDates, getRecentLogs } from "@/lib/logs";

function groupDatesByMonth(dates: Array<{ date: string; count: number }>) {
  return dates.reduce<Record<string, Array<{ date: string; count: number }>>>((groups, item) => {
    const month = item.date.slice(0, 7);

    return {
      ...groups,
      [month]: [...(groups[month] ?? []), item],
    };
  }, {});
}

export default async function LogsPage() {
  const [recentLogs, dates] = await Promise.all([getRecentLogs(10), getLogDates()]);
  const groupedDates = groupDatesByMonth(dates);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8">
      <section className="grid gap-5 border-b border-zinc-200 pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-700">読み返し</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
            過去の日誌を読み返す
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            以前の学びを日付からたどり、理解ノートや復習の問いをもう一度見返します。
          </p>
        </div>
        <Link
          className="bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white"
          href="/record"
        >
          日誌を書く
        </Link>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950">最近の日誌</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            新しい記録から順に、学びの流れを読み返します。
          </p>
        </div>
        <LogList logs={recentLogs} />
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950">日付から読む</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            その日に残した日誌だけをまとめて開けます。
          </p>
        </div>
        {dates.length === 0 ? (
          <div className="border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
            まだ読み返せる日誌がありません。
          </div>
        ) : (
          <div className="grid gap-4">
            {Object.entries(groupedDates).map(([month, monthDates]) => (
              <section className="border border-zinc-200 bg-white p-5" key={month}>
                <h3 className="text-sm font-semibold text-zinc-950">{month}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {monthDates.map((item) => (
                    <Link
                      className="border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                      href={`/days/${item.date}`}
                      key={item.date}
                    >
                      {item.date} / {item.count}件
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
