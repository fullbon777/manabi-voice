import Link from "next/link";
import { notFound } from "next/navigation";
import { LogList } from "@/components/LogList";
import { isDateString } from "@/lib/date";
import { getLogsByDate } from "@/lib/logs";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  if (!isDateString(date)) {
    notFound();
  }

  const logs = await getLogsByDate(date);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8">
      <section className="grid gap-5 border-b border-zinc-200 pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <Link className="text-emerald-700 transition hover:text-emerald-900" href="/logs">
              日付から読む
            </Link>
            <span aria-hidden="true" className="text-zinc-400">
              /
            </span>
            <span className="text-zinc-600">{date}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">{date}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            この日に残した学び日誌をまとめて読み返します。
          </p>
        </div>
        <Link className="bg-emerald-700 px-4 py-3 text-sm font-semibold text-white" href="/record">
          日誌を書く
        </Link>
      </section>
      <LogList logs={logs} />
    </main>
  );
}
