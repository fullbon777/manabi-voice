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

This app is not a summarization app and must not drift into one. The core concept is:

Users explain what they learned in their own words. The app inspects that explanation and, depending on the user's apparent understanding, returns questions, detailed explanations, review prompts, or extension prompts to help deepen understanding.

The app must not always ask questions. It should switch intervention style based on understanding state:

- If the explanation contains a major misunderstanding, first point out the misunderstanding gently, then explain the correct idea. Add why the misunderstanding is easy to make if useful, and leave review questions. Avoid making the user reason from a wrong premise.
- If the explanation is mostly correct but vague, insufficient, or slightly mistaken, ask confirmation questions first so the user can think. After that, provide the correct answers and a detailed explanation of the scope discussed today. This is the center of the product experience.
- If the explanation is well understood, do not force interrogation. Offer extension questions, review questions, and a path such as "complete for today".

The core flow is:

1. User enters or speaks what they learned.
2. The app transcribes it.
3. The AI reconstructs the content without losing meaning.
4. The AI checks unclear wording, insufficient explanations, and claims that may need fact checking.
5. The AI judges the understanding state and chooses the intervention style.
6. The AI returns confirmation questions, detailed explanations, review prompts, or extension prompts as appropriate.
7. The result is saved as a date-based learning log.

Avoid turning this into a simple summary app.
