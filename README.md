# Manabi Voice

> English summary: Manabi Voice is a learning inspection app. Users explain what they learned by voice or text, the app transcribes speech with AmiVoice API, checks their understanding with AI, and saves the result as a date-based learning journal. It is not a summarization app.

Manabi Voice は、学んだことを自分の言葉で話す／書くと、AI が理解状態を確認し、学び日誌として残せるアプリです。

一般的な「音声入力 → 文字起こし → 要約」ではなく、ユーザー自身の説明をもとに、曖昧な表現、説明不足、誤解の可能性、あとで正誤確認したい主張を見つけます。そのうえで、理解状態に応じて確認質問、詳しい解説、復習用の問い、発展的な問いを返します。

## コンセプト

このアプリの中心は、学習者が自分の言葉で説明することです。

話した内容をきれいに要約して終わるのではなく、次のような状態を見ます。

- どこまで説明できているか
- どの表現が曖昧か
- 理由や具体例が足りているか
- 誤解の可能性があるか
- 復習時にどんな問いへ戻るとよいか

理解状態によって返し方も変えます。

- 大きな誤解がありそうな場合: 先にやさしく説明する
- 大筋は合っているが不足がある場合: 確認質問を出してから解説する
- よく理解できている場合: 無理に質問せず、発展・復習に寄せる
- 判断材料が少ない場合: 断定せず、追加説明を促す

## 主な機能

- ブラウザ録音
- テキスト入力
- AmiVoice API による音声文字起こし
- mock 文字起こしモード
- Gemini による理解状態の確認
- mock / template fallback による AI 点検
- SQLite への学び日誌保存
- 今日の学び日誌
- 過去の日誌のカレンダー表示
- 日付別の日誌一覧
- 理解ノートを主役にした詳細ページ

## 主な流れ

1. `/record` で録音、またはテキスト入力
2. 録音した音声を AmiVoice API で文字起こし
3. 文字起こし結果を確認し、必要なら手で修正
4. 生成 AI または mock/template fallback で理解状態を確認
5. 理解ノート、確認質問、解説、復習用の問いを生成
6. 日付ベースの学び日誌として保存
7. `/`, `/logs`, `/days/[date]`, `/logs/[id]` から読み返す

## Zenn 記事

Zennfes Spring 2026 向けの記事を作成しています。

- AmiVoice API と生成 AI で「要約しない」学び日誌アプリを作った

公開後に記事 URL を追記します。

## 技術スタック

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma 7
- SQLite
- Tailwind CSS 4
- AmiVoice API
- Gemini API

## セットアップ

依存パッケージをインストールします。

```bash
npm install
```

環境変数ファイルを作成します。

```bash
cp .env.example .env
```

Prisma スキーマをローカル SQLite に反映します。

```bash
npm run db:push
```

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで開きます。

```text
http://localhost:3000
```

## 環境変数

`.env` にローカルの秘密情報を設定します。`.env` はコミットしないでください。

```env
DATABASE_URL="file:./dev.db"

TRANSCRIBE_MODE="mock"
AI_MODE="mock"
FACT_CHECK_MODE="mock"

AMIVOICE_API_KEY=""
AMIVOICE_API_URL="https://acp-api.amivoice.com/v1/recognize"
AMIVOICE_ENGINE="-a-general"
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
```

### 文字起こしモード

`TRANSCRIBE_MODE="mock"` は固定のサンプルテキストを返します。デフォルトで、外部 API を呼びません。

`TRANSCRIBE_MODE="amivoice"` は録音した音声を AmiVoice API に送ります。利用する場合は `AMIVOICE_API_KEY` を設定してください。

### AI 点検モード

`AI_MODE="mock"` はローカルの mock 点検結果を返します。デフォルトで、外部 API を呼びません。

`AI_MODE="gemini"` は文字起こしされた説明を Gemini に送ります。利用する場合は `GEMINI_API_KEY` を設定してください。

Gemini が利用不可、レート制限、不正なレスポンスなどで失敗した場合は、テンプレートの fallback 点検を保存し、できるだけ日誌作成フローを止めないようにしています。

## スクリプト

```bash
npm run dev
npm run lint
npm run build
npm run db:push
npm run prisma:generate
```

## 検証

意味のある変更後は以下を実行してください。

```bash
npm run lint
npm run build
```

この環境では、Turbopack が `creating new process`、`binding to a port`、`Operation not permitted (os error 1)` を含む sandbox 権限エラーで失敗することがあります。その場合はアプリコードの問題ではなく環境権限の問題として扱い、必要に応じて `npm run build` を一度だけ elevated で再実行します。

## 現時点の制限

- 本番用のログイン機能は未実装です。
- 複数ユーザーのデータ分離は未実装です。
- 本番 DB ではなくローカル SQLite を使っています。
- 検索による正誤確認は未実装です。
- デプロイ設定はまだ整えていません。

## 注意事項

- mock モードは API キーなしで動作します。
- 無料枠で試せることを前提にしています。
- `.env` はコミットしないでください。
- 実 API を使う場合は AmiVoice API / Gemini API の利用条件と料金を確認してください。
