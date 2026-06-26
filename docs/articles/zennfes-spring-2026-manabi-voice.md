---
title: "AmiVoice APIと生成AIで「要約しない」学び日誌アプリを作った"
emoji: "🎙️"
type: "tech"
topics: ["amivoice", "nextjs", "生成ai", "typescript", "個人開発"]
published: false
---

## 作ったもの

**Manabi Voice** は、学んだことを自分の言葉で話す（または書く）と、その説明を AI が点検して、日誌として残せるアプリです。

技術スタック:

- Next.js 16 (App Router)
- React 19 / TypeScript
- Prisma 7 + SQLite
- Tailwind CSS 4
- AmiVoice API（音声文字起こし）
- Gemini API（理解状態の点検）

よくある「音声入力 → 要約」のアプリではありません。ユーザーの説明を要約するのではなく、**理解の状態を点検して、その人に合った返し方をする**ところに設計の中心があります。

情報系の学部に通っている大学生です。個人開発には前から興味があったものの、ちゃんとアプリを作るのは今回がほぼ初めてでした。何を作るかがなかなか決まらずにいたところ、Zennfes Spring 2026 のスポンサーテーマに AmiVoice API を見つけて、「音声認識と生成 AI を組み合わせた学習支援アプリなら、自分でも使いたいし、テーマとしてちょうどいい」と思って作り始めました。

開発期間は 2〜3 週間です。最初から本番運用まで作り込むのではなく、まずは「話した学びを、要約ではなく理解点検の日誌にする」という体験を一通り動くところまで持っていくことを目標にしました。

## なぜ「話す」ことから始めるのか

Manabi Voice では、音声入力はあくまで入口です。音声を使うこと自体が目的ではなく、**「自分の言葉で説明する」行為**に価値を置いています。

学んだことを人に説明しようとすると、いくつかのことが起きます。

- 内容を **思い出す** 必要がある
- 説明するために **構造化** しなければならない
- 言葉にしてみて、自分でも **曖昧な部分に気づく**

これは学習研究でも知られている効果です。研究では、学習者が自分で説明を生成することで理解が深まることが示されています[^chi1989][^chi1994]。また Roscoe & Chi (2007) は、他者に教える行為が知識の構築につながることを示し[^roscoe2007]、Roediger & Karpicke (2006) は、学んだことを思い出す行為そのもの（retrieval practice）が長期記憶に効果的であることを報告しています[^roediger2006]。

ただし「声に出すだけで覚える」というほど単純ではありません。重要なのは、学んだ内容を **自分の言葉に変換して、説明として組み立てる** プロセスです。

Manabi Voice における音声認識は、このプロセスを「話す」というかたちでアプリに渡す入口です。AmiVoice API の役割は、単なる便利な文字起こしではなく、**学習者の生の説明をテキストとして取り出す** ための仕組みです。

[^chi1989]: Chi, M. T. H., et al. (1989). Self-explanations: How students study and use examples in learning to solve problems. _Cognitive Science_, 13(2). https://doi.org/10.1207/s15516709cog1302_1

[^chi1994]: Chi, M. T. H., et al. (1994). Eliciting self-explanations improves understanding. _Cognitive Science_, 18(3). https://doi.org/10.1207/s15516709cog1803_3

[^roscoe2007]: Roscoe, R. D., & Chi, M. T. H. (2007). Understanding Tutor Learning. _Review of Educational Research_, 77(4). https://doi.org/10.3102/0034654307309920

[^roediger2006]: Roediger, H. L., & Karpicke, J. D. (2006). Test-Enhanced Learning. _Psychological Science_, 17(3). https://doi.org/10.1111/j.1467-9280.2006.01693.x

## なぜ「要約アプリ」にしなかったのか

音声を文字起こしした後の一般的な流れはこうです。

> 音声入力 → 文字起こし → **要約**

これはこれで便利ですが、学習の場面では問題があります。きれいな要約を渡してしまうと、ユーザーは「もう分かった」気分になり、自分の理解に向き合う機会がなくなります。

Manabi Voice の流れは違います。

> 音声入力 → 文字起こし → **意味を復元** → **理解状態を点検** → **介入方法を選ぶ** → **日誌として残す**

たとえば、ユーザーが HTTP キャッシュについて説明したとします。

- 「キャッシュは保存したレスポンスを再利用する仕組みです」と言ったら、それは **主張** として拾う
- 「ちゃんと確認する」のような表現があれば、必要に応じて **曖昧さ** として点検する
- 理由や具体例が足りなければ、**説明不足** として確認質問を出す
- 「キャッシュは必ず速くなる」のような断定があれば、**正誤確認候補** として残す

要約は「何を言ったか」を整理しますが、Manabi Voice は「**どこまで分かっていて、どこがまだ曖昧か**」を照らします。

## Manabi Voice の流れ

全体の処理は次の 6 ステップです。

1. **ブラウザで録音、またはテキスト入力** — `/record` ページでマイクから録音するか、直接テキストを書く
2. **AmiVoice API で音声を文字起こし** — 録音データを API に送り、テキストに変換する
3. **生成 AI で理解状態を点検** — 文字起こしされたテキストを Gemini に渡し、理解の状態を判定する
4. **介入方法を選んで返す** — 理解状態に応じて、確認質問・解説・復習の問いを組み合わせる
5. **日誌として保存** — 点検結果を日付ベースで SQLite に保存する
6. **あとから読み返す** — 今日の記録、カレンダーからの日付指定、詳細ページで復習する

テキスト入力にも対応しているので、「音声でなければ使えない」アプリではありません。話すのが自然な人は話し、書くのが楽な人は書く、という設計です。

## AmiVoice API で音声を文字起こしする

文字起こし処理は `src/app/api/transcribe/route.ts` にまとめています。環境変数 `TRANSCRIBE_MODE` の値で、mock と AmiVoice のどちらを使うか切り替えます。

```ts
function getTranscribeMode() {
  return (process.env.TRANSCRIBE_MODE || "mock").trim().toLowerCase();
}
```

mock モードでは固定のサンプルテキストを返すだけなので、API キーなしで UI の開発と動作確認ができます。

```ts
if (mode === "mock") {
  return Response.json({
    mode,
    transcript: mockTranscript,
  });
}
```

AmiVoice モードでは、ブラウザから送られた音声ファイルを `FormData` に詰めて、AmiVoice API の HTTP 音声認識エンドポイントに POST します。

```ts
async function transcribeWithAmiVoice(audio: File) {
  const { apiKey, apiUrl, engine } = getAmiVoiceConfig();

  const amiVoiceFormData = new FormData();
  amiVoiceFormData.append("u", apiKey);
  amiVoiceFormData.append("d", engine);
  amiVoiceFormData.append("a", audio, audio.name || "learning-recording.webm");

  const response = await fetch(apiUrl, {
    method: "POST",
    body: amiVoiceFormData,
  });
  // ...
}
```

AmiVoice API のインターフェースはシンプルで、`u`（API キー）、`d`（エンジン名）、`a`（音声ファイル）を `FormData` で送るだけです。日本語の汎用エンジン `-a-general` を使っています。

環境変数は `.env` で管理し、以下のように設定します。

```env
TRANSCRIBE_MODE="amivoice"
AMIVOICE_API_KEY="your-api-key"
AMIVOICE_API_URL="https://acp-api.amivoice.com/v1/recognize"
AMIVOICE_ENGINE="-a-general"
```

開発中はほとんどの時間を mock モードで過ごし、実際の音声認識を試したいときだけ `TRANSCRIBE_MODE="amivoice"` に切り替えていました。AmiVoice API の無料枠を温存しつつ、日誌体験や UI の開発を止めずに進められたのは、このモード分離のおかげです。

使ってみた所感としては、API 連携そのものはかなり扱いやすかったです。一方で、音声認識の結果をそのまま学習ログとして扱うには注意が必要でした。日本語の文章として自然に起こせる部分も多いのですが、技術用語、漢字変換、噛んだ部分、言い直した部分では意図と違う結果になることがあります。

そのため、このアプリでは「AmiVoice の結果をそのまま保存する」のではなく、「文字起こし結果を確認して、必要なら直してから点検に回す」UI にしています。音声認識の精度をアプリ側で無理に隠すより、ユーザーが最終的な説明文を確認できる余地を残す方が、学習日誌としては自然でした。

## 生成 AI には「理解状態の点検」をさせる

生成 AI の役割は要約ではなく、**理解点検**です。ユーザーの説明を受け取って、以下の構造を返すよう Gemini に指示しています。

| フィールド                  | 役割                                         |
| --------------------------- | -------------------------------------------- |
| `assessmentStatus`          | 理解状態の判定（4 段階）                     |
| `interventionType`          | UI 側の返し方ラベル                          |
| `reconstructedContent`      | ユーザーの説明を意味を落とさずに復元したもの |
| `learningNote`              | 今日の学びを読み返せるノート（本文 + 脚注）  |
| `understoodPoints`          | 話の中で理解として言い切っている主張         |
| `possibleMisunderstandings` | 誤解の可能性がある部分                       |
| `insufficientExplanations`  | 理由・例・条件が足りない箇所                 |
| `factCheckTargets`          | 断定が強く、あとで裏取りすべき主張           |
| `checkQuestions`            | ユーザーに返す確認質問                       |
| `explanation`               | 詳しい解説                                   |
| `nextReviewQuestions`       | 復習用の問い                                 |

この構造は「なぜこのフィールドが要るのか」から逆算して作りました。

たとえば `assessmentStatus` が `mostly_correct_with_gaps`（大筋合っているが不足あり）なら、すぐ解説するのではなく、まず確認質問で考えてもらう。`major_misunderstanding`（大きな誤解）なら、質問より先に解説する。AI にはこの理解状態を判定させ、アプリ側でも `assessmentStatus` から期待される `interventionType` に揃えることで、UI が適切な返し方を選べるようにしています。

`factCheckTargets` は、「必ず〜」「すべて〜」のような強い断定を拾うためのフィールドです。現時点では検索による裏取りは実装していませんが、「あとで確認すべき候補」として記録に残します。

Gemini へのプロンプトでは、以下の方針を明示しています。

```
判定方針:
- かなり間違っている: assessmentStatus="major_misunderstanding"
- 大筋は合っているが不足あり: assessmentStatus="mostly_correct_with_gaps"
- かなり正しい: assessmentStatus="well_understood"
- 判断材料が足りない: assessmentStatus="uncertain"
```

レスポンスは `responseMimeType: "application/json"` を指定して JSON で受け取り、Zod でバリデーションしています。

```ts
const geminiInspectionSchema = z.object({
  title: z.string(),
  reconstructedContent: z.string(),
  learningNote: z.object({
    noteBody: z.string(),
    footnotes: z.array(z.string()),
  }),
  assessmentStatus: assessmentStatusSchema,
  interventionType: interventionTypeSchema,
  // ...
});
```

Zod を使っているのは、Gemini のレスポンスが期待どおりの構造かどうかを実行時に検証するためです。AI のレスポンスは構造が保証されないので、スキーマバリデーションで壊れたレスポンスを早期に弾いています。

## 理解状態ごとに返し方を変える

Manabi Voice は **常に質問を返すアプリ** ではありません。理解状態によって介入の仕方を切り替えます。

### `major_misunderstanding` — 先に解説

誤解が大きい場合、いきなり質問しても間違った前提のまま考えてしまいます。まず誤解をやさしく指摘し、正しい説明を渡してから、復習用の問いを出します。

### `mostly_correct_with_gaps` — 確認質問してから解説

大筋は合っているけれど、曖昧な部分や説明不足がある場合。これが一番多いケースで、**アプリ体験の中心**です。まず確認質問でユーザーに考える余地を残し、その後に正しい答えと詳しい解説を返します。

### `well_understood` — 発展的な内容か完了

よく理解できている場合は、無理に詰問しません。発展的な質問、復習用の問い、「今日はここで完了」という選択肢を提示します。

### `uncertain` — 慎重に確認

入力が短い、または判断材料が少ない場合。理解を断定せず、追加の文脈を求めます。

この判定は `assessmentStatus` と `interventionType` の組み合わせで制御しています。

```ts
function getExpectedInterventionType(
  status: AssessmentStatus,
): InterventionType {
  switch (status) {
    case "major_misunderstanding":
      return "explain_first";
    case "mostly_correct_with_gaps":
      return "question_then_explain";
    case "well_understood":
      return "extend_or_complete";
    case "uncertain":
    default:
      return "cautious_follow_up";
  }
}
```

## 日誌として読み返せるUIにする

UI は「ログ管理画面」ではなく、「**日誌を読み返す体験**」として設計しています。

### `/record` — 日誌を書く

録音してもいいし、テキストで直接書いてもいい入力画面です。録音後はブラウザ上で再生・確認してから文字起こしでき、文字起こし結果はテキストエリアに入るので、修正してから送信できます。
![](https://static.zenn.studio/user-upload/1f2df6d9ff07-20260626.png)

### `/` — 今日の学び日誌

トップページは今日の記録だけを表示します。「今日何を学んだか」にフォーカスした画面で、過去のログで埋まることがありません。
![](https://static.zenn.studio/user-upload/d9fda0030b24-20260626.png)
![](https://static.zenn.studio/user-upload/35e08e9520d1-20260626.png)

### `/logs` — カレンダーから読み返す

過去の日誌を日付からたどる画面です。月ごとのカレンダーに、日誌がある日はドットと件数が表示されます。右側には最近の日誌がコンパクトに並びます。
![](https://static.zenn.studio/user-upload/492f394fb24b-20260626.png)

カレンダーは手書きで実装しています。日付ごとの件数は DB から取得し、日誌がある日だけリンクにしています。

### `/days/[date]` — その日の日誌一覧

特定日の日誌をまとめて読み返す画面です。カレンダーからの遷移先になります。
![](https://static.zenn.studio/user-upload/246643c1de29-20260626.png)

### `/logs/[id]` — 理解ノートが主役の詳細ページ

詳細ページでは、**理解ノート**（`learningNote`）を最も目立つ位置に配置しています。理解ノートは、ユーザーが話した表現をもとに、今日の範囲の内容を読み返せる形に整えたものです。要約ではなく、ユーザーの言い方を活かしながら、足りない前提を自然に補う方針で書かれます。
![](https://static.zenn.studio/user-upload/00a0ad8c0613-20260626.png)

点検の詳細（主張、曖昧さ、説明不足、正誤確認候補、確認質問、解説、復習の問い）は `<details>` タグで折りたたんでいます。日誌を読み返す体験の中で、点検結果はあくまで補助情報です。

日誌一覧（`LogList`）では、`default` と `compact` の 2 つの表示バリアントを使い分けています。

```tsx
<LogList logs={logs} variant="compact" />
```

`default` では理解ノートの冒頭がプレビュー表示され、`compact` では最近の日誌をすばやく一覧するための省スペース表示になります。

## mock mode を残して開発しやすくする

Manabi Voice には、文字起こしと AI 点検の両方に mock モードがあります。

```env
TRANSCRIBE_MODE="mock"
AI_MODE="mock"
```

この状態なら API キーが一切なくても、アプリの全画面を動かせます。

mock モードの存在は開発スピードだけでなく、**設計判断にも影響しました**。

- UI を先に作り込めるので、AI のレスポンス構造を固める前に「どう表示するか」を決められた
- mock と実 API の出力構造を揃えることで、API の切り替えがコード上は環境変数 1 つで済む
- 無料枠を気にせず何度でも試せるので、日誌の読み返し体験を繰り返し調整できた

AI 点検にはさらに **template fallback** があります。Gemini の API キーが未設定、日次上限に達している、API エラーが返ってきた場合は、テンプレートベースの簡易点検に自動的に切り替わります。

```ts
export async function createAiInspection(
  sourceText: string,
  date: string,
): Promise<AiInspection> {
  const mode = getAiMode();

  if (mode !== "gemini") {
    return createMockAnalysis(sourceText);
  }

  if (!process.env.GEMINI_API_KEY) {
    return createTemplateAnalysis(sourceText, "GEMINI_API_KEY is not set");
  }

  // 日次上限チェック、Gemini呼び出し、エラー時のfallback...
}
```

AI が使えない状況でも、できるだけ日誌の保存フローを止めないようにしています。「日誌を書いたのに、AI 側の都合で保存できなかった」という体験は避けたかったので、fallback は意識的に入れました。

## 実装してみて分かったこと

### 文字起こし結果は、そのまま点検に回さない方がよかった

実際に使ってみると、AmiVoice API でも聞き取りミスはありました。特に技術用語、早口になった部分、話し言葉の言い直しでは、意図と違う文字起こしになることがあります。

そこで Manabi Voice では、文字起こし結果をそのまま保存・点検に回すのではなく、一度テキストエリアに入れて、ユーザーが手で直せるようにしました。

これは精度の保険として重要でした。漢字の変換ミスや、噛んでしまった部分の誤認識をそのまま生成 AI に渡すと、理解状態ではなく文字起こしのノイズを点検してしまう可能性があります。点検したいのは音声認識の精度ではなく、学習者の説明そのものです。そのため、文字起こし後にユーザーが内容を確認し、必要なところだけ直してから保存できる流れにしました。

### 音声の「粗さ」は理解点検の材料になる

文章で入力すると、どうしても最初から整った文にしようとしてしまいます。一方で、話した説明には言い直しや曖昧な表現が残ります。

普通の要約アプリなら、その粗さは消したくなるノイズかもしれません。しかし Manabi Voice では、そこに理解状態の手がかりがあります。どこで言い淀んだか、どの概念を曖昧に言ったか、具体例が出てこなかったか。音声認識でその説明をテキストとして取り出せると、生成 AI が「きれいな答え」ではなく「いまの理解」を点検しやすくなります。

### AmiVoice API は Route Handler と相性がよかった

FormData で音声ファイルと API キーとエンジン名を送るだけなので、Next.js の Route Handler に閉じ込めやすかったです。ブラウザ側には API キーを出さず、録音した音声ファイルだけを `/api/transcribe` に送る構成にできました。

WebSocket のリアルタイム認識もありますが、今回のユースケースでは HTTP の同期認識で十分でした。学習日誌では、会話中にリアルタイム字幕を出すよりも、「話し終わったあとに文字起こしを見直して、点検に回す」流れの方が体験に合っていました。

### 生成 AI のレスポンス構造を固めるのが一番難しかった

「理解状態を 4 段階に分けて、それぞれの返し方を変える」という設計方針はすぐ決まりましたが、実際にプロンプトを書いて Gemini から安定した JSON を返してもらうまでには試行錯誤がありました。`responseMimeType: "application/json"` を使い、Zod でバリデーションすることで、ある程度安定するようになりました。

### 「要約しない」を守るのは意外と難しい

プロンプトに「要約するな」と書いても、生成 AI は要約方向に流れがちです。「理解ノートは、ユーザーが話した表現のうち正しい部分をもとにした今日の範囲の解説文にする」「話していない内容を広げすぎない」と具体的に制約を書く必要がありました。

### mock mode でUIを先に作る判断は正解だった

API を待たずに画面を作れたので、日誌を読み返す体験や理解ノートの見せ方に集中できました。AI のレスポンス構造が固まってから mock の出力を揃え直す作業は発生しましたが、それでもトータルでは速かったと感じています。

### ログ一覧ではなく、日誌として読み返すUIにする必要があった

最初は「保存したログを新しい順に並べる」だけでも成立すると思っていました。しかし画面を見返してみると、それでは学習記録を管理しているだけに見えました。

このアプリで大事なのは、過去の自分の理解に戻れることです。そこで、ホームは今日の学びに絞り、過去の日誌はカレンダーから読み返す形にしました。詳細ページでも、点検項目より先に理解ノートを大きく見せています。

この変更で、アプリの見え方が「ログ管理」から「学びの日誌」に近づきました。UI の言葉や情報の順番は、プロダクトの思想をかなり左右するのだと感じました。

## 本番化するなら

現時点では、Manabi Voice はローカルで動く個人開発アプリです。本番環境へ持っていくなら、以下の課題があります。

- **認証**: ログイン機能がないので、複数ユーザーで使えない
- **データ分離**: `LearningLog` にユーザー ID がないので、全員のログが混ざる
- **DB 移行**: SQLite からホスティングされた Postgres への移行
- **API キー管理**: ローカルでは `.env`、本番ではホスティング環境の secrets 管理が必要
- **音声ファイルサイズ**: 長い録音の制限やストリーミング対応
- **セキュリティ**: CSRF、セッション管理、認可、rate limit
- **デプロイ**: Vercel や他のプラットフォームへの展開

これらは今後の課題として認識していますが、今回の記事の主題ではありません。まずは「音声から理解を点検して日誌にする」という体験の設計と実装に集中しました。

## まとめ

Manabi Voice は、AmiVoice API で文字起こしした学習者の説明を、生成 AI で**要約するのではなく理解状態を点検し**、日誌として読み返せるようにするアプリです。

作ってみて改めて感じたのは、音声認識 API と生成 AI の組み合わせは「文字起こし → 要約」だけではないということです。ユーザーの説明をそのまま受け取り、理解の状態を照らし、その人に合った返し方をする。そういう使い方もできます。

技術的には Next.js 16 + Prisma 7 + AmiVoice API + Gemini API という構成で、mock mode と fallback を組み合わせることで、無料枠を意識しながら開発を進められました。

「自分の言葉で説明してみる → 点検してもらう → 日誌として残す」。このサイクルを気軽に回せるアプリとして、もう少し育てていきたいと考えています。

ソースコードは [GitHub](https://github.com/fullbon777/manabi-voice) に置いています。
