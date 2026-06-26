const mockTranscript =
  "今日はHTTPキャッシュについて学びました。キャッシュは同じデータを毎回取りに行かずに、保存したレスポンスを再利用する仕組みです。ただし、ずっと古い情報を使うのではなく、Cache-ControlやETagを使って鮮度を確認したり、必要なときに再検証したりします。つまり速さだけではなく、通信量を減らしながら正しい情報を保つためのルールだと理解しました。";

type AmiVoiceResponse = {
  text?: string;
  code?: string;
  message?: string;
};

function getTranscribeMode() {
  return (process.env.TRANSCRIBE_MODE || "mock").trim().toLowerCase();
}

function getAmiVoiceConfig() {
  return {
    apiKey: process.env.AMIVOICE_API_KEY?.trim(),
    apiUrl:
      process.env.AMIVOICE_API_URL?.trim() || "https://acp-api.amivoice.com/v1/recognize",
    engine: process.env.AMIVOICE_ENGINE?.trim() || "-a-general",
  };
}

function getAudioFile(formData: FormData) {
  const audio = formData.get("audio");

  return audio instanceof File ? audio : null;
}

async function transcribeWithAmiVoice(audio: File) {
  const { apiKey, apiUrl, engine } = getAmiVoiceConfig();

  if (!apiKey) {
    return Response.json({ error: "AMIVOICE_API_KEY is not set." }, { status: 500 });
  }

  const amiVoiceFormData = new FormData();
  amiVoiceFormData.append("u", apiKey);
  amiVoiceFormData.append("d", engine);
  amiVoiceFormData.append("a", audio, audio.name || "learning-recording.webm");

  const response = await fetch(apiUrl, {
    method: "POST",
    body: amiVoiceFormData,
  });
  const payload = (await response.json().catch(() => null)) as AmiVoiceResponse | null;

  if (!response.ok) {
    return Response.json(
      {
        error: payload?.message || `AmiVoice transcription failed with status ${response.status}.`,
        code: payload?.code,
      },
      { status: response.status },
    );
  }

  if (!payload?.text) {
    return Response.json(
      {
        error: payload?.message || "AmiVoice response did not include transcript text.",
        code: payload?.code,
      },
      { status: 502 },
    );
  }

  return Response.json({ mode: "amivoice", transcript: payload.text });
}

export async function POST(request: Request) {
  const mode = getTranscribeMode();
  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return Response.json({ error: "audio form data is required." }, { status: 400 });
  }

  if (mode === "mock") {
    return Response.json({
      mode,
      transcript: mockTranscript,
    });
  }

  if (mode === "amivoice") {
    const audio = getAudioFile(formData);

    if (!audio) {
      return Response.json({ error: "audio file is required." }, { status: 400 });
    }

    return transcribeWithAmiVoice(audio);
  }

  return Response.json(
    { error: `Unsupported TRANSCRIBE_MODE: ${mode}` },
    { status: 501 },
  );
}
