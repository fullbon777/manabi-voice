"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RecordForm() {
  const router = useRouter();
  const [sourceText, setSourceText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText }),
      });
      const payload = (await response.json()) as {
        id?: string;
        log?: { id?: string };
        error?: string;
      };
      const logId = payload.id ?? payload.log?.id;

      if (!response.ok || !logId) {
        throw new Error(payload.error || "学びログを保存できませんでした。");
      }

      router.push(`/logs/${logId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "学びログを保存できませんでした。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-zinc-800">学んだこと</span>
        <textarea
          className="min-h-72 resize-y border border-zinc-300 bg-white p-4 text-base leading-7 text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          maxLength={12000}
          name="sourceText"
          onChange={(event) => setSourceText(event.target.value)}
          placeholder="例: 今日、HTTP キャッシュは単に速くする仕組みではなく、鮮度と再検証のルールで通信量と正しさのバランスを取るものだと学んだ..."
          required
          value={sourceText}
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">{sourceText.length.toLocaleString()} / 12,000 文字</p>
        <button
          className="bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isSubmitting || sourceText.trim().length === 0}
          type="submit"
        >
          {isSubmitting ? "点検して保存中" : "mock 点検して保存"}
        </button>
      </div>
      {error ? (
        <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
      ) : null}
    </form>
  );
}
