import Link from "next/link";
import { RecordForm } from "@/app/record/RecordForm";

export default function RecordPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">学び入力</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
            学び日誌を書く
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            今日学んだことを自分の言葉で残します。話した内容をもとに、理解ノートと復習の手がかりを日誌にします。
          </p>
        </div>
        <Link
          className="border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700"
          href="/logs"
        >
          読み返す
        </Link>
      </div>
      <section className="border border-zinc-200 bg-zinc-50 p-5">
        <RecordForm />
      </section>
    </main>
  );
}
