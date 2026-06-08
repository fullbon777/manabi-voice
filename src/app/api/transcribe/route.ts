const mockTranscript =
  "今日はHTTPキャッシュについて学びました。キャッシュは同じデータを毎回取りに行かずに、保存したレスポンスを再利用する仕組みです。ただし、ずっと古い情報を使うのではなく、Cache-ControlやETagを使って鮮度を確認したり、必要なときに再検証したりします。つまり速さだけではなく、通信量を減らしながら正しい情報を保つためのルールだと理解しました。";

function getTranscribeMode() {
  return (process.env.TRANSCRIBE_MODE || "mock").trim().toLowerCase();
}

export async function POST(request: Request) {
  const mode = getTranscribeMode();

  if (mode !== "mock") {
    return Response.json(
      { error: "Only TRANSCRIBE_MODE=mock is implemented." },
      { status: 501 },
    );
  }

  await request.formData().catch(() => null);

  return Response.json({
    mode,
    transcript: mockTranscript,
  });
}
