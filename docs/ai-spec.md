# AI Spec

## Role

The AI inspects the user's learning explanation.

It should not simply summarize.

## AI output fields

- reconstructedContent
- claims
- vagueButNatural
- needsClarification
- insufficientExplanations
- factCheckTargets
- checkQuestions
- groundedExplanation
- reviewQuestions

## Important behavior

- Do not add information the user did not say.
- Do not treat every pronoun or vague phrase as a problem.
- Judge whether vague wording prevents understanding.
- Do not ask "What is that?" directly.
- Ask natural confirmation questions.
- Do not score understanding with numbers.
- If a claim may be factually wrong, mark it as needing fact check.
- Search-based fact checking will be added later.
