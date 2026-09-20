# Stroke Recovery Companion

A **privacy-first, local-first** web app that supports clinician-directed stroke
rehabilitation as an *adjunct* — never a replacement for professional care.

> **Not a medical device. Not medical advice.** This app does not diagnose,
> treat or substitute for clinical rehabilitation. It supports a care plan set
> by a speech-language pathologist, occupational therapist, physiotherapist or
> doctor.

---

## What this is

Stroke Recovery Companion is a PWA with short, fatigue-aware daily practice
sessions and plain-language supports across the areas commonly affected after a
stroke. It is designed to be used **alongside** a care team's plan.

### Modules

1. **Onboarding** — functional goals + clinician/caregiver configuration
   (behaviour flags only; no personal identifiers).
2. **Daily session** — fatigue-aware, capped at **30 minutes by default**,
   with rest prompts and no time pressure.
3. **Orientation** — date, time, season and routine cues.
4. **Memory** — spaced retrieval, errorless-style practice and written
   reminder prompts.
5. **Attention** — low-distraction practice with adjustable difficulty.
6. **Problem-solving** — Goal–Plan–Do–Check (metacognitive) prompts.
7. **Language & words** — naming practice, a tap-to-speak phrase board and
   communication tips. *Adjunct to speech-language therapy.*
8. **Visual scanning** — side-emphasis scanning practice with safety wording.
9. **Daily routines** — ADL checklists.
10. **Mood & fatigue** — a simple self-check with escalation language
    (not a diagnosis).
11. **Caregiver support** — communication tips, self-care and escalation
    guidance.
12. **Progress dashboard** — adherence and activity, explicitly *not* a
    medical measure of recovery.

See [docs/EVIDENCE.md](docs/EVIDENCE.md) for the source guidelines, evidence
strength and the honest limitations of each module.

---

## Privacy first

- **Local-first by default.** All personal data (goals, sessions, check-ins,
  checklist ticks) is stored **only in the user's browser** via IndexedDB /
  localStorage. There is **no server-side datastore** and **no telemetry**.
- **No free text.** Onboarding uses preset choices; reminders use presets.
  The public deployment cannot accidentally store names, dates of birth,
  medications or other PHI.
- **No HIPAA claim.** Cloudflare only offers BAAs to Enterprise customers;
  this project does **not** claim HIPAA compliance.
- **Optional cloud sync is future work and disabled** (see ROADMAP).
- Read [PRIVACY.md](PRIVACY.md) for the full statement.

---

## Accessibility

Large touch targets (≥48 px), scalable text (three sizes), high-contrast mode,
reduced-motion support, keyboard/focus-visible support, plain language, one
primary task per screen, optional read-aloud (Web Speech API) and no timers or
time pressure by default.

---

## Tech stack

- **TypeScript** + **React 18** + **Vite 8**
- **react-router-dom 7**
- **Vitest 5** + Testing Library (unit/component tests)
- **ESLint 9** (flat config) + strict `tsc`
- Hand-rolled **service worker** (cache-first for the app shell; personal data
  is never cached) and web app manifest
- **Cloudflare Pages** static hosting with security headers (CSP, no-frame,
  permissions policy) — no Workers/KV/D1/R2 for personal data in the MVP

## Getting started

```bash
npm install
npm run dev        # start dev server
npm run build      # typecheck + production build
npm run test       # run tests
npm run lint       # lint
npm run check:phi  # scan for accidental PHI patterns
npm run verify     # lint + typecheck + test + check:phi + build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Conventional commits, tests required for
new behaviour. See [SECURITY.md](SECURITY.md) for reporting vulnerabilities and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.

## License

[MIT](LICENSE)
