import Link from "next/link";
import { LogList } from "@/components/LogList";
import { getLogDates, getRecentLogs } from "@/lib/logs";

const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

function groupDatesByMonth(dates: Array<{ date: string; count: number }>) {
  return dates.reduce<Record<string, Array<{ date: string; count: number }>>>((groups, item) => {
    const month = item.date.slice(0, 7);

    return {
      ...groups,
      [month]: [...(groups[month] ?? []), item],
    };
  }, {});
}

function getMonthCells(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1));
  const firstWeekday = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

function formatDate(yearMonth: string, day: number) {
  return `${yearMonth}-${String(day).padStart(2, "0")}`;
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
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
                  <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                    {weekDays.map((weekDay) => (
                      <div className="py-1 text-xs font-medium text-zinc-500" key={weekDay}>
                        {weekDay}
                      </div>
                    ))}
                    {getMonthCells(month).map((day, index) => {
                      if (day === null) {
                        return <div aria-hidden="true" key={`${month}-blank-${index}`} />;
                      }

                      const date = formatDate(month, day);
                      const item = monthDates.find((monthDate) => monthDate.date === date);

                      if (!item) {
                        return (
                          <div
                            className="flex min-h-12 items-center justify-center border border-transparent text-sm text-zinc-300"
                            key={date}
                          >
                            {day}
                          </div>
                        );
                      }

                      return (
                        <Link
                          aria-label={`${item.date} の日誌 ${item.count}件を読む`}
                          className="flex min-h-12 flex-col items-center justify-center border border-emerald-200 bg-emerald-50 px-1 text-sm font-semibold text-emerald-900 transition hover:border-emerald-400 hover:bg-emerald-100"
                          href={`/days/${item.date}`}
                          key={date}
                        >
                          <span>{day}</span>
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <span className="mt-0.5 text-[10px] leading-none text-emerald-700">
                            {item.count}件
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">最近の日誌</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              新しい記録から、読み返したい日誌をすばやく探せます。
            </p>
          </div>
          <LogList logs={recentLogs} variant="compact" />
        </section>
      </div>
    </main>
  );
}
