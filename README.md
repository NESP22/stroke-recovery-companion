# Stroke Recovery Companion

A **privacy-first, local-first** companion app for people recovering from a
stroke. It supports clinician-directed rehabilitation — it does **not** replace
it.

> **Not a medical device and not medical advice.** This app is an adjunct to
> the plan set by your physiotherapist, occupational therapist,
> speech-language pathologist and medical team. It does not diagnose, treat or
> replace professional care.

## What it is

Stroke Recovery Companion provides short, fatigue-aware daily sessions across
the areas most commonly affected after stroke:

- **Orientation** — a calm reminder of the date, time, season and routine.
- **Memory** — spaced retrieval, errorless-style practice and external
  reminder prompts.
- **Attention** — low-distraction focus practice with adjustable difficulty
  and no time pressure.
- **Problem-solving** — Goal–Plan–Do–Check steps for everyday tasks.
- **Language & words** — word-finding practice, a tap-to-speak phrase board,
  and conversation tips for partners.
- **Visual scanning** — guided scanning practice with safety wording.
- **Daily routines** — morning, midday and evening checklists.
- **Mood & fatigue** — a supportive self-check (not a diagnosis) with
  escalation guidance.
- **Caregiver support** — communication and self-care tips for helpers.

Every feature is backed by a written evidence trail: an in-app
"Research & Evidence" screen, a `docs/EVIDENCE.md` traceability table, and
`docs/RESEARCH_METHOD.md` explaining how the evidence was gathered and rated.

## Privacy and safety

- **Local-first.** All data stays in the user's browser (IndexedDB /
  localStorage). There is no server-side datastore and no telemetry.
- **No PHI.** The app collects no names, dates of birth, addresses or
  medication details. Demo content is synthetic only. Nothing is uploaded.
- **Not HIPAA-compliant** (and it does not claim to be) — see `PRIVACY.md`.
- **Emergency warning.** A persistent FAST reminder: new face droop, arm/leg
  weakness, speech/language change, major vision change, severe balance
  problem, sudden confusion or severe headache → call emergency services.

## Tech

React + TypeScript + Vite (PWA), deployed to Cloudflare Pages. No backend
service is required — the app is fully static and client-side.

## Development

```bash
npm install
npm run dev          # local dev server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest
npm run check:phi    # privacy / PHI scan
npm run build        # typecheck + production build
npm run verify       # all of the above in one pass
```

## Project layout

- `src/lib/evidence.ts` — the single source of truth mapping every feature to
  its evidence (strength, limitations, sources).
- `src/lib/sessionPolicy.ts` — the evidence-derived session-length policy.
- `src/modules/` — one screen per practice area.
- `docs/` — `EVIDENCE.md` (traceability) and `RESEARCH_METHOD.md`.
- `scripts/check-phi.mjs` — privacy/PHI scan used by CI.

## Positioning and scope

This is an open-source wellness/rehab **adjunct**. It is not a medical device,
and it deliberately avoids claims about restoring function or treating disease.
See `ROADMAP.md` for what is intentionally out of scope today (clinician
portal, FHIR import, encrypted sync, and clinical validation, among others).

## License

MIT — see `LICENSE`.
