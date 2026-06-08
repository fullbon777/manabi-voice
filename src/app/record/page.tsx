import Link from "next/link";
import { RecordForm } from "@/app/record/RecordForm";

export default function RecordPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">mock mode</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-zinc-950">
            学びログを作成
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            入力した内容を、意味を落とさず復元し、曖昧さ、説明不足、正誤確認候補、確認質問に分けて保存します。
          </p>
        </div>
        <Link className="border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700" href="/">
          今日
        </Link>
      </div>
      <section className="border border-zinc-200 bg-zinc-50 p-5">
        <RecordForm />
      </section>
    </main>
  );
}
