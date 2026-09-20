# Contributing

Thank you for considering contributing to Stroke Recovery Companion. This
project is a **safety-sensitive, evidence-bound** piece of software, so a few
rules apply before code.

## Ground rules

1. **Evidence first.** Every feature must trace to a source in
   `src/lib/evidence.ts` and `docs/EVIDENCE.md`. Do not add an exercise or
   claim that the evidence does not support.
2. **Never over-claim.** If a feature's evidence is impairment-level only, say
   so. Do not imply it improves everyday independence unless the source does.
3. **Privacy is non-negotiable.** No server-side persistence, no telemetry, no
   free-text input fields, no PHI. Run `npm run check:phi` before committing.
4. **Synthetic data only.** Never add real patient information, names, dates of
   birth, addresses or medication lists to the repository.

## Getting started

```bash
npm install
npm run dev
```

Make your change, then run the full gate locally:

```bash
npm run verify
```

## Tests

Add or update tests for any new behaviour. Tests run with Vitest:

```bash
npm test
```

## Updating the evidence trail

If you add a feature or change a claim:

1. Update the relevant research report (in the research directory).
2. Update `src/lib/evidence.ts` (strength, limitations, sources, app behaviour).
3. Update the traceability table in `docs/EVIDENCE.md`.
4. Update any in-app "Why this is here" copy that would now over-claim.

## Accessibility

All UI must meet the project's accessibility baseline: large touch targets
(≥44px), scalable type, high contrast, keyboard navigation, screen-reader
semantics, plain language, one primary task per screen, optional read-aloud,
and no default time pressure.

## Code of conduct

Please read `CODE_OF_CONDUCT.md`. Be kind, patient and respectful.
