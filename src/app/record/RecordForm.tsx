"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type RecordingStatus = "idle" | "recording" | "recorded";

const mimeTypeCandidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

export function RecordForm() {
  const router = useRouter();
  const [sourceText, setSourceText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  async function startRecording() {
    setError(null);
    setRecordingError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecordingError("このブラウザでは録音機能を利用できません。直接テキスト入力してください。");
      return;
    }

    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = mimeTypeCandidates.find((mimeType) =>
        MediaRecorder.isTypeSupported(mimeType),
      );
      const recorder = new MediaRecorder(
        stream,
        supportedMimeType ? { mimeType: supportedMimeType } : undefined,
      );

      chunksRef.current = [];
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingStatus("recording");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || supportedMimeType || "audio/webm",
        });
        const nextAudioUrl = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(nextAudioUrl);
        setRecordingStatus("recorded");
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
      };

      recorder.start();
    } catch (err) {
      setRecordingStatus("idle");
      setRecordingError(
        err instanceof Error ? err.message : "マイクの利用を開始できませんでした。",
      );
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  async function transcribeRecording() {
    if (!audioBlob) {
      setRecordingError("文字起こしする録音がありません。");
      return;
    }

    setError(null);
    setRecordingError(null);
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "learning-recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        transcript?: string;
        error?: string;
      };

      if (!response.ok || !payload.transcript) {
        throw new Error(payload.error || "文字起こしに失敗しました。");
      }

      setSourceText(payload.transcript);
    } catch (err) {
      setRecordingError(err instanceof Error ? err.message : "文字起こしに失敗しました。");
    } finally {
      setIsTranscribing(false);
    }
  }

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

  const statusLabel =
    recordingStatus === "recording"
      ? "録音中"
      : recordingStatus === "recorded"
        ? "録音完了"
        : "未録音";

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="grid gap-4 border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">ブラウザ録音</h2>
            <p className="mt-1 text-sm text-zinc-500">状態: {statusLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
              disabled={recordingStatus === "recording" || isSubmitting || isTranscribing}
              onClick={startRecording}
              type="button"
            >
              録音開始
            </button>
            <button
              className="border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
              disabled={recordingStatus !== "recording"}
              onClick={stopRecording}
              type="button"
            >
              録音停止
            </button>
          </div>
        </div>

        {audioUrl ? (
          <div className="grid gap-3">
            <audio className="w-full" controls src={audioUrl}>
              <track kind="captions" />
            </audio>
            <div className="flex justify-end">
              <button
                className="bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={isTranscribing || isSubmitting}
                onClick={transcribeRecording}
                type="button"
              >
                {isTranscribing ? "mock 文字起こし中" : "mock 文字起こし"}
              </button>
            </div>
          </div>
        ) : null}

        {recordingStatus === "recording" ? (
          <p className="border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            マイクから録音しています。話し終えたら録音停止を押してください。
          </p>
        ) : null}
        {recordingStatus === "recorded" ? (
          <p className="border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
            録音が完了しました。再生で確認してから mock 文字起こしできます。
          </p>
        ) : null}
        {recordingError ? (
          <p className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {recordingError}
          </p>
        ) : null}
      </section>

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
