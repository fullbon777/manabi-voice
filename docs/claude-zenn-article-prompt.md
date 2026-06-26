# Claude Code 用プロンプト: Zennfes Spring 2026 記事作成

あなたは Zenn 向け技術記事を書くスペシャリストです。
このリポジトリ `manabi-voice` を参照しながら、Zennfes Spring 2026 に投稿するための記事 Markdown を作成してください。

## 目的

Zennfes Spring 2026 のスポンサーテーマに合わせて、Manabi Voice というアプリの記事を書きたいです。

公式イベントページ:

https://zenn.dev/events/zennfes-spring-2026

狙うテーマ:

- 音声認識 API「AmiVoice API」と生成 AI を併せて活用した実装事例・知見

この記事では、単に「音声認識を使った」ではなく、

> AmiVoice API でユーザーの音声説明を文字起こしし、生成 AI で要約ではなく理解状態を点検し、学び日誌として読み返せるようにした

というプロダクト設計と実装を伝えたいです。

## まずやってほしいこと

1. Zennfes Spring 2026 の公式ページを確認してください。
2. Zenn の人気技術記事、特に以下に近い記事をいくつか検索して、構成や文体を参考にしてください。
   - 個人開発アプリを作った記事
   - AI アプリ開発記事
   - 音声認識 API 活用記事
   - Next.js / Prisma / 生成 AI の実装記事
   - ハッカソン・イベント応募記事
3. ただし、本文をコピーしないでください。構成・読みやすさ・見出しの作り方だけ参考にしてください。
4. その後、このリポジトリを読んで、実装に即した記事を書いてください。

## 参照してほしいファイル

最低限、以下を読んでください。

- `README.md`
- `docs/product.md`
- `docs/ai-spec.md`
- `docs/requirements.md`
- `src/app/api/transcribe/route.ts`
- `src/lib/analysis.ts`
- `src/lib/gemini-analysis.ts`
- `src/lib/mock-analysis.ts`
- `src/lib/template-analysis.ts`
- `src/app/record/RecordForm.tsx`
- `src/app/page.tsx`
- `src/app/logs/page.tsx`
- `src/app/logs/[id]/page.tsx`
- `src/app/days/[date]/page.tsx`
- `src/components/LogList.tsx`
- `src/components/InspectionSections.tsx`
- `prisma/schema.prisma`
- `.env.example`

重要:

- `.env` は読まないでください。
- API キーや秘密情報を記事に書かないでください。
- 実装されていないことを、実装済みのように書かないでください。

## アプリの理解

Manabi Voice は、要約アプリではありません。

ユーザーが授業・読書・仕事などで学んだことを、自分の言葉で話す/書く。
アプリはその説明をもとに、理解状態を点検します。

中心思想:

- 話した内容をただ要約しない
- ユーザー自身の説明から理解の状態を見る
- 誤解が大きい場合は、先にやさしく説明する
- 大筋は合っているが曖昧な場合は、確認質問を出す
- よく理解できている場合は、無理に質問せず発展・復習に寄せる
- 結果を日誌として保存し、あとで読み返せるようにする

処理の流れ:

1. ブラウザで録音、またはテキスト入力
2. AmiVoice API で音声を文字起こし
3. 生成 AI または mock/template fallback で理解状態を点検
4. 理解ノート、確認質問、詳しい解説、復習用の問いを生成
5. 日付ベースの学び日誌として保存
6. 今日の記録、過去の日誌、カレンダー、詳細ページで読み返す

## 記事で強調したいこと

### 1. 「要約ではない」こと

一般的な流れは、

> 音声入力 → 文字起こし → 要約

になりがちです。

Manabi Voice は違います。

> 音声入力 → 文字起こし → 意味を復元 → 理解状態を点検 → 介入方法を選ぶ → 日誌として残す

この違いを記事の芯にしてください。

### 2. なぜ「話す」のか

記事の導入または「なぜ音声なのか」の章で、学んだことを話す意味を説明してください。

ポイント:

- Manabi Voice は、音声を使うこと自体が目的ではない。
- 学習者が自分の言葉で説明することに価値がある。
- 説明するには、学んだ内容を思い出し、構造化し、足りない部分に気づく必要がある。
- これは self-explanation、retrieval practice、learning by teaching などの研究ともつながる。
- ただし「声に出すだけで必ず覚える」とは書かない。
- 「自分の言葉で説明する」「思い出して言語化する」ことが重要だと書く。

参考文献:

- Chi et al. (1989) Self-explanations: How students study and use examples in learning to solve problems  
  https://doi.org/10.1207/s15516709cog1302_1
- Chi et al. (1994) Eliciting self-explanations improves understanding  
  https://doi.org/10.1207/s15516709cog1803_3
- Roscoe & Chi (2007) Understanding Tutor Learning: Knowledge-Building and Knowledge-Telling in Peer Tutors' Explanations and Questions  
  https://doi.org/10.3102/0034654307309920
- Roediger & Karpicke (2006) Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention  
  https://doi.org/10.1111/j.1467-9280.2006.01693.x

この論点を入れることで、AmiVoice API の役割を「便利な文字起こし」以上のものとして説明できます。
音声認識は、学習者の「自分の説明」をアプリに渡す入口です。

### 3. AmiVoice API の役割

AmiVoice API は、ユーザーの「自分の言葉で説明した音声」を取り出す入口です。

記事では `src/app/api/transcribe/route.ts` を参照しながら、以下を説明してください。

- `TRANSCRIBE_MODE="mock"` なら外部 API なしで開発できる
- `TRANSCRIBE_MODE="amivoice"` なら AmiVoice API に音声を送って文字起こしする
- `AMIVOICE_API_KEY` は `.env` で管理する
- mock mode を残すことで、無料枠や API 制限を気にせず UI/日誌体験を開発できる

### 4. 生成 AI の役割

生成 AI は要約係ではなく、理解点検係です。

以下の観点を説明してください。

- `assessmentStatus`
- `interventionType`
- `claims`
- `vagueButNatural`
- `needsClarification`
- `insufficientExplanations`
- `factCheckTargets`
- `checkQuestions`
- `groundedExplanation`
- `reviewQuestions`

ただし、フィールド一覧だけの退屈な説明にしないでください。
「なぜこの構造にしたか」を中心にしてください。

### 5. UI 設計

UI は「ログ管理」ではなく「日誌を読み返す」体験に寄せています。

触れてほしい画面:

- `/record`: 学び日誌を書く。録音またはテキスト入力。
- `/`: 今日の学び日誌。
- `/logs`: 過去の日誌をカレンダーから読み返す。
- `/days/[date]`: 特定日の学び日誌一覧。
- `/logs/[id]`: 理解ノートを主役にした詳細ページ。点検詳細は補助情報。

特に `/logs` のカレンダー UI は、記事のスクショとして使いやすいはずです。

### 6. 本番化は今後の課題として正直に書く

今回の記事では、ログイン・本番デプロイ・本番 DB 移行は主題にしません。
実装していないなら、実装済みのように書かないでください。

今後の課題として、以下に触れてください。

- ログイン機能
- ユーザーごとの `LearningLog` 分離
- SQLite から hosted Postgres への移行
- API キー管理
- 音声ファイルサイズ制限
- rate limit
- CSRF / セッション / 認可
- デプロイ

ただし、記事の主役を奪わないように、最後の章で短く整理してください。

## 記事のトーン

- 日本語で書いてください。
- Zenn 向けの自然な技術記事にしてください。
- 読者が「自分も作れそう」と思える再現性を意識してください。
- ただの実装ログではなく、課題設定 → 設計判断 → 実装 → 学び、の流れにしてください。
- 文章は少し親しみやすくて OK ですが、くだけすぎないでください。
- 「すごい」「簡単」などの雑な表現は避け、何が良かったのか具体的に書いてください。
- 実装を過度に美化しないでください。mock mode、fallback、未実装の本番課題も正直に書いてください。

## 記事タイトル案

タイトルは最終的にあなたが改善してよいですが、方向性は以下です。

候補:

- AmiVoice API と生成 AI で「要約しない」学び日誌アプリを作った
- 音声で話した学びを、理解点検の日誌にするアプリを作った
- AmiVoice API + 生成 AI で、学習内容を要約せずに理解点検するアプリを作った

タイトルにはできれば以下の要素を含めてください。

- AmiVoice API
- 生成 AI
- 要約しない / 理解点検 / 学び日誌

## 推奨構成

以下の構成をベースに、読みやすく調整してください。

```md
---
title: "AmiVoice APIと生成AIで「要約しない」学び日誌アプリを作った"
emoji: "🎙️"
type: "tech"
topics: ["amivoice", "nextjs", "生成ai", "typescript", "個人開発"]
published: false
---

## 作ったもの

## なぜ「話す」ことから始めるのか

## なぜ「要約アプリ」にしなかったのか

## Manabi Voice の流れ

## AmiVoice API で音声を文字起こしする

## 生成 AI には「理解状態の点検」をさせる

## 理解状態ごとに返し方を変える

## 日誌として読み返せる UI にする

## mock mode を残して開発しやすくする

## 実装してみて分かったこと

## 本番化するなら

## まとめ
```

## スクショについて

記事本文を書きながら、必要な位置にスクショ挿入用のプレースホルダーを入れてください。

例:

```md
<!-- screenshot: /record の録音・入力画面 -->
```

または

```md
![学び日誌を書く画面](./images/record.png)
```

どちらでもよいですが、あとで差し替えやすい形にしてください。

おすすめスクショ:

1. `/record`
2. `/logs/[id]`
3. `/logs`
4. `/`

スクショを撮る場合:

- `.env` や API キーは絶対に写さない
- ブラウザの不要なタブや個人情報を写さない
- 画面の説明に必要なものだけ撮る

## コード引用について

コードは必要な箇所だけ短く引用してください。
長いファイル丸ごと引用は避けてください。

特に引用候補:

- `src/app/api/transcribe/route.ts` の mode 切り替え
- AmiVoice へ `FormData` を送る部分
- AI inspection の構造
- `LogList` の compact/default など、UI 判断が分かる部分

コード引用は「何をしているか」が分かる最小限にしてください。

## 出力

以下のファイルを作成してください。

`docs/articles/zennfes-spring-2026-manabi-voice.md`

もし `docs/articles/` がなければ作成してください。

記事本文を書いた後、最後に以下も出してください。

1. 記事の狙い
2. 想定読者
3. どの Zennfes テーマに合うか
4. まだ弱いところ
5. 追加で撮るべきスクショ
6. 公開前チェックリスト

## 注意

- アプリを勝手に大きく改修しないでください。
- 記事作成に必要な軽微な docs 用ディレクトリ作成は OK です。
- `.env` は読まない、触らない、記事に書かない。
- 未実装のログインやデプロイを実装済みのように書かない。
- Manabi Voice は要約アプリではない。この点を絶対にぶらさないでください。
