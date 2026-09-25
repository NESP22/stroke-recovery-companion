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

## Personalized practice plan (Version 0.2)

A short, optional **baseline check** (offered after onboarding, and reachable
from Settings and My progress) asks a few gentle, preset questions about
orientation, attention, memory, word-finding, visual scanning and sequencing,
plus a fatigue self-rating. From those answers and your chosen goals, the app
suggests:

- up to three **practice focus** areas,
- a **starting level** (gentle / standard / challenging) per area, and
- a fatigue-aware **session length**, still capped by the existing session
  policy.

**Limitations.** This baseline is **not a validated instrument and not a
diagnostic cognitive screen.** It is not the MoCA, the MMSE, or any other
screening tool; it has no norming or cut-offs and cannot detect impairment,
severity, or recovery. It never labels anyone as mildly/moderately/severely
impaired, never infers stroke location or recovery probability, and it uses
non-clinical wording ("practice focus", "starting level"). The plan is stored
on-device only and can be retaken or cleared via Clear All Data. New or
worsening symptoms are handled by the FAST emergency banner, not this flow.

## Adaptive practice, functional practice and outcome check (Version 0.3)

Three further capabilities build on the personalized plan, all local and
optional:

- **Adaptive training** — a transparent, conservative per-domain engine that
  nudges a starting level (gentle / standard / challenging) one step at a time
  after enough practice, holds or lowers the level when fatigue is high, and
  never counts a skipped attempt as failure. It never makes treatment
  decisions.
- **Functional practice** — Goal–Plan–Do–Check prompts for synthetic everyday
  tasks (morning routine, a simple shopping list, preparing for an appointment,
  a recipe sequence, and planning a short outing), tied to your chosen goals.
  Assistance and completion are recorded as structured choices, never as a
  clinical independence score.
- **Pre/post "practice check"** — a repeatable check with two alternating forms
  (A/B) so the same items are never shown twice in a row. Results are compared
  **per domain only** (correct/attempted, hints, fatigue) and labelled
  "higher / about the same / lower on this app task". There is **no total
  score** and no "percentage recovered": score changes can reflect practice
  effects, day-to-day fatigue, natural recovery or other therapy, and cannot
  show that the app caused the change.

**These are not validated or clinical assessments.** See
`docs/OUTCOME_MEASUREMENT.md` for the full construct, limitations and the
NICE NG236 / VA/DoD 2024 boundary the app respects.

## Tech

React + TypeScript + Vite (PWA), deployed to Cloudflare Pages. No backend
service is required — the app is fully static and client-side.

### Apple-first MVP

iPhone and iPad are the reference devices for v0.1. In Safari, open the
in-app **Install on iPhone/iPad** guide and use **Share → Add to Home Screen**.
The installed PWA is the preferred Apple experience for offline use and local
persistence. The interface accounts for safe areas, 44px+ touch targets,
scalable text, reduced motion, portrait iPhone, and portrait/landscape iPad.

Current web limitations are documented rather than hidden: programmatic browser
dictation is not relied on (use the iOS keyboard microphone instead), Web Push
is not enabled in v0.1, and App Store distribution / native-only capabilities
remain future work. The platform research synthesis and implementation
decisions are documented in `docs/APPLE_PLATFORM.md`, and the pre-release
manual device pass is `docs/DEVICE_CHECKLIST.md`.

## Development

```bash
npm install
npm run dev          # local dev server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest (unit/component)
npm run test:e2e     # Playwright WebKit — iPhone/iPad portrait + landscape
npm run check:phi    # privacy / PHI scan
npm run build        # typecheck + production build
npm run verify       # all of the above in one pass
```

## Project layout

- `src/lib/evidence.ts` — the single source of truth mapping every feature to
  its evidence (strength, limitations, sources).
- `src/lib/sessionPolicy.ts` — the evidence-derived session-length policy.
- `src/modules/` — one screen per practice area.
- `docs/` — `EVIDENCE.md` (traceability), `OUTCOME_MEASUREMENT.md` (the
  pre/post check construct and limits) and `RESEARCH_METHOD.md`.
- `scripts/check-phi.mjs` — privacy/PHI scan used by CI.

## Positioning and scope

This is an open-source wellness/rehab **adjunct**. It is not a medical device,
and it deliberately avoids claims about restoring function or treating disease.
See `ROADMAP.md` for what is intentionally out of scope today (clinician
portal, FHIR import, encrypted sync, and clinical validation, among others).

## License

MIT — see `LICENSE`.
