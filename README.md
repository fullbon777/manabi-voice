# Manabi Voice

Manabi Voice is a learning inspection app for spoken or written explanations.

Users explain what they learned in their own words. The app transcribes the explanation, inspects the user's apparent understanding, and saves a date-based learning log with confirmation questions, detailed explanations, review prompts, or extension prompts.

This is not a summarization app. The core purpose is to help users notice unclear wording, missing conditions, insufficient explanations, possible misunderstandings, and claims that may need later fact checking.

## Current Features

- Browser recording
- Mock transcription mode
- AmiVoice transcription mode
- Mock AI inspection mode
- Gemini AI inspection mode with fallback
- SQLite learning log storage
- Today's log list
- Date-based log pages
- Log detail pages with learning notes and inspection details

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 7
- SQLite
- Tailwind CSS 4

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Push the Prisma schema to the local SQLite database:

```bash
npm run db:push
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

Use `.env` for local secrets. Do not commit `.env`.

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

### Transcription Modes

`TRANSCRIBE_MODE="mock"` returns a fixed mock transcript. This is the default and does not call external APIs.

`TRANSCRIBE_MODE="amivoice"` sends the recorded audio to AmiVoice. Set `AMIVOICE_API_KEY` before using this mode.

### AI Inspection Modes

`AI_MODE="mock"` returns local mock inspection results. This is the default and does not call external APIs.

`AI_MODE="gemini"` sends the transcribed explanation to Gemini. Set `GEMINI_API_KEY` before using this mode. If Gemini is unavailable, rate-limited, or returns an invalid response, the app saves a template fallback inspection instead of failing the log creation flow.

## Main Flow

1. Open `/record`.
2. Record audio or type what you learned.
3. Transcribe the recording.
4. Inspect and save the learning log.
5. Review the generated learning note and inspection details.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run db:push
npm run prisma:generate
```

## Verification

After meaningful changes, run:

```bash
npm run lint
npm run build
```

In this environment, Turbopack may fail during `npm run build` with a sandbox error containing `creating new process`, `binding to a port`, and `Operation not permitted (os error 1)`. Treat that as an environment permission issue, not an app code issue, and rerun `npm run build` with elevated permissions once.

## Notes

- Keep mock mode working without API keys.
- Keep the project free-tier friendly.
- Do not add paid services unless explicitly requested.
- Do not commit `.env`.
- Search-grounded fact checking is not implemented yet.
