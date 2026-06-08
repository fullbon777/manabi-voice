import Link from "next/link";
import { LogList } from "@/components/LogList";
import { getTodayDateString } from "@/lib/date";
import { getLogsByDate } from "@/lib/logs";

export default async function Home() {
  const today = getTodayDateString();
  const logs = await getLogsByDate(today);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8">
      <section className="grid gap-5 border-b border-zinc-200 pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-700">今日の学びログ</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">{today}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            保存済みの学びを、復元内容、点検結果、確認質問、詳しい解説つきで確認します。ここでは要約ではなく、理解を深めるためのログを扱います。
          </p>
        </div>
        <Link className="bg-emerald-700 px-4 py-3 text-sm font-semibold text-white" href="/record">
          学びログを作成
        </Link>
      </section>
      <LogList logs={logs} />
    </main>
  );
}
