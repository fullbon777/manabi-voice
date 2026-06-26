import Link from "next/link";
import { LogList } from "@/components/LogList";
import { getTodayDateString } from "@/lib/date";
import { getLogsByDate } from "@/lib/logs";

export default async function Home() {
  const today = getTodayDateString();
  const logs = await getLogsByDate(today);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8">
      <section className="grid gap-5 border-b border-zinc-200 pb-8">
        <div>
          <p className="text-sm font-medium text-emerald-700">今日の学び日誌</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
            {today} の記録
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            話したことを日誌として残し、あとから理解ノートと点検結果を読み返せます。要約ではなく、今日の理解を深めるための記録です。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white"
            href="/record"
          >
            日誌を書く
          </Link>
          <Link
            className="border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-700"
            href="/logs"
          >
            過去の日誌を読み返す
          </Link>
        </div>
      </section>
      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950">今日書いた日誌</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600">
            今日の学びを、あとから読み返せる形で残します。
          </p>
        </div>
        <LogList logs={logs.slice(0, 3)} />
      </section>
    </main>
  );
}
