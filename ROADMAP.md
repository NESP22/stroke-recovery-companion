# Roadmap

The current release is an **MVP** scoped tightly to what the evidence supports
for a local-first, at-home adjunct. Everything below is intentionally deferred.

## In scope today (MVP)

- Onboarding, goals, fatigue check and short daily plan.
- Orientation / routine cues; compensatory memory supports; reduced-distraction
  attention practice; Goal–Plan–Do–Check workflows; aphasia word-finding and
  communication supports; visual scanning (with evidence caveats); ADL
  checklists; caregiver mode; a functional/adherence dashboard.
- Evidence trail: in-app "Research & Evidence" screen, `docs/EVIDENCE.md`
  traceability table, `docs/RESEARCH_METHOD.md`.
- Privacy-first architecture: local-first storage, no PHI, synthetic data.

## Deferred (tracked as GitHub issues)

1. **Clinician portal** — a professional view to review adherence and goals.
2. **Validated outcome measures / licensing review** — before any clinical
   measure is shown, it must be licensed and validated appropriately.
3. **FHIR import** — optional import of structured data from a care record.
4. **Optional encrypted sync** — cross-device sync with end-to-end encryption,
   and a careful re-assessment of the local-first privacy posture.
5. **Multilingual support** — translations and right-to-left layout, with
   aphasia-friendly language in each locale.
6. **Usability study** — co-design and testing with stroke survivors and
   caregivers (accessibility is an efficacy variable, not a nicety).
7. **Future clinical validation / IRB** — a prospective study to establish
   efficacy and safety before any clinical claim is made.

## Non-goals

- Diagnosis, treatment recommendations, or anything that makes the app a
  regulated medical device.
- Brain "training" claims; the app is explicitly not a commercial brain game.
- Any server-side storage of health data.

Pull requests that advance the deferred items are welcome — please follow the
evidence-first rules in `CONTRIBUTING.md`.
