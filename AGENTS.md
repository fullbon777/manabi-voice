<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Rules

- This app is not a summarization app.
- This app inspects spoken learning content.
- Do not connect real external APIs unless explicitly requested.
- Use mock mode by default.
- Keep the project free-tier friendly.
- Do not add paid services.
- Do not use Docker unless explicitly requested.
- Do not commit `.env`.
- Use TypeScript.
- Run lint and build checks after meaningful changes.

## Product direction

The core flow is:

1. User enters or speaks what they learned.
2. The app transcribes it.
3. The AI reconstructs the content without losing meaning.
4. The AI checks unclear wording, insufficient explanations, and claims that may need fact checking.
5. The AI creates confirmation questions.
6. The result is saved as a date-based learning log.

Avoid turning this into a simple summary app.
