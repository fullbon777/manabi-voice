# AI Spec

## Role

The AI inspects the user's learning explanation.

It should not simply summarize.

## AI output fields

- assessmentStatus
- interventionType
- reconstructedContent
- claims
- vagueButNatural
- needsClarification
- insufficientExplanations
- factCheckTargets
- checkQuestions
- explanation
- groundedExplanation
- reviewQuestions

## assessmentStatus

Use one of:

- `major_misunderstanding`: the user's explanation appears substantially wrong or based on a wrong premise.
- `mostly_correct_with_gaps`: the main idea is broadly right, but there are vague terms, insufficient explanations, missing conditions, or small mistakes.
- `well_understood`: the explanation is clear and mostly sufficient for the scope discussed.
- `uncertain`: the input is too short, ambiguous, or under-specified to judge understanding reliably.

## App behavior by status

- `major_misunderstanding`: explain before asking confirmation questions. First point out the misunderstanding gently, then give the correct explanation. If useful, explain why the misunderstanding is easy to make. Leave review questions after the explanation. Do not make the user think through a question that assumes the wrong premise.
- `mostly_correct_with_gaps`: ask confirmation questions first. Leave space for the user to think, then provide correct answers to the confirmation questions and a detailed explanation of the scope covered today. This is the central app experience.
- `well_understood`: do not force interrogation. Provide extension questions, review questions, and a path such as completing today's log.
- `uncertain`: do not overjudge. Ask for the missing context or mark the explanation as needing cautious follow-up.

## interventionType

Use a short label that tells the UI how to present the response, such as:

- `explain_first`
- `question_then_explain`
- `extend_or_complete`
- `cautious_follow_up`

## Important behavior

- Do not add information the user did not say.
- Do not treat every pronoun or vague phrase as a problem.
- Judge whether vague wording prevents understanding.
- Do not ask "What is that?" directly.
- Ask natural confirmation questions.
- Do not score understanding with numbers.
- Do not always ask confirmation questions.
- Switch between questions, detailed explanations, review prompts, and extension prompts based on `assessmentStatus`.
- If a claim may be factually wrong, mark it as needing fact check.
- Search-based fact checking will be added later.
