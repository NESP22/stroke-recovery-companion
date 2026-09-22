# Outcome measurement — construct, limits and positioning

This document explains what the app's pre/post "practice check" is, what it is
for, and — just as importantly — what it is **not**. It is the long-form
companion to the code in `src/lib/outcome.ts` (and the personalization layer in
`src/lib/personalization.ts`), and it exists so the app's change-tracking can be
audited against the same standard applied to every other feature in
`docs/EVIDENCE.md`.

> **Positioning in one line:** the app's practice check is an **in-app
> personalization and change-tracking aid, not a clinical assessment.** It is
> not validated, not standardized, and not diagnostic. It produces no
> clinical score and makes no clinical claim.

---

## What the construct is

The practice check is a short, optional, skippable set of **synthetic, preset**
tasks across six scored domains — orientation, attention, memory, language/word
finding, visual scanning, and sequencing/problem solving — plus a fatigue
self-rating and a functional-goal self-rating. Its only outputs are:

- **Personalization** — up to three practice-focus domains, a starting level
  (gentle / standard / challenging) per domain, and a fatigue-aware session
  length (see `src/lib/personalization.ts`).
- **Change tracking** — a per-domain, per-app-task comparison between a "pre"
  check and a later "post" check (see `src/lib/outcome.ts`).

Every stimulus is a preset choice. The app never collects free-text responses,
names, dates of birth, addresses, medication names, or uploads, and never sends
anything to a server.

### Why the battery is not "validated" or "standardized"

A **validated** instrument has been tested against a reference population and
shown to measure a construct reliably, with published norms, cut-offs and
known measurement error. A **standardized** instrument has fixed administration
and scoring rules so results are comparable across people and settings.

The app's practice check has **none** of this:

- no norming or reference sample,
- no reliability or validity studies,
- no cut-offs, severity bands or clinical interpretation,
- content that is deliberately synthetic and non-clinical (it cannot be, and
  must not be, compared against a validated test).

That is why the app never says "validated", "standardized", "clinical",
"diagnostic", "impairment test", or any severity label, and why the UI uses
"practice check" / "app performance check" rather than clinical terminology.

### Why it does not use MoCA / MMSE / NIHSS / Barthel / FIM / PROMIS

Those are proprietary or validated instruments. Reproducing their items, or
any items from a validated instrument, without an explicit licensed source and
permission would be both legally and clinically inappropriate. The app's tasks
are synthetic and do not copy any instrument's content.

---

## Alternate forms (A/B)

To reduce the familiarity/practice effect that would otherwise inflate a
post-check purely from having seen the same stimuli before, the check ships two
equivalent-content forms, **A** and **B**, with the same task *structure* but
different stimulus sets (different orientation items, memory words, naming
targets, sequencing routines, and scanning arrangements).

The form shown is deterministic (`src/lib/outcome.ts` → `nextForm`):

- the first check ever uses **Form A**,
- every subsequent check uses the **opposite** of the immediately prior check,
  so the same stimulus set is never presented twice in a row.

This alternation is a practice-effect mitigation, not a solution: alternate
forms are not equivalent in a psychometric sense, which is one more reason the
results are never treated as a validated measurement.

---

## Practice effect, natural recovery and confounding

Even with alternate forms, a pre/post difference on an app task **cannot** be
attributed to the app. The following confounds are unavoidable in this design
and are stated to the user in the change report:

- **Practice / familiarity effect** — getting better at the specific task or
  test format through repetition, even when the stimuli change.
- **Day-to-day fatigue** — post-stroke fatigue (reported in roughly 38–77% of
  survivors) changes task performance from session to session; the check
  records fatigue explicitly but cannot remove its effect.
- **Natural recovery** — early spontaneous recovery after stroke is common and
  would occur with or without the app.
- **Other therapy** — most users are receiving physiotherapy, occupational
  therapy, speech-language therapy or neuropsychological input concurrently;
  any change could come from those.
- **Motivation, mood, time of day, environment** — all unmeasured.

The change report therefore states plainly that score changes can reflect any
of these factors and **cannot establish that the app caused the change**.

---

## Why there is no total score

The app deliberately does **not** compute a single overall or "percentage
recovered" number. A single aggregate score would:

- imply a level of measurement precision the synthetic tasks do not have,
- invite severity or recovery interpretations the app must avoid,
- hide which specific domains changed and by how much,
- look like a clinical or cognitive "score" when it is neither.

Comparison is therefore **per domain only**, using raw app metrics
(correct / attempted, hints used, fatigue). Change is labelled with exactly
three transparent, deterministic phrases — **"higher on this app task"**,
**"about the same on this app task"**, **"lower on this app task"** — using the
documented threshold in `src/lib/outcome.ts` (`COMPARISON_DELTA = 0.15`).
"Higher" and "lower" refer to this app task, never to clinical improvement or
deterioration.

Functional-goal self-ratings are reported **separately** from domain outcomes,
as raw before/after numbers on the 1–5 preset scale, with no clinical
interpretation.

---

## When a post check is suggested (and why it is neutral)

A post check can be taken at any time. The app also surfaces a **neutral
suggestion** after either **10 completed sessions** or **14 days since the
pre check** (`POST_SUGGEST_SESSIONS` / `POST_SUGGEST_DAYS` in
`src/lib/outcome.ts`). This is a product milestone chosen for plausibility, not
a clinical recommendation: there is no evidence that 10 sessions or 14 days is
a meaningful reassessment interval, and the app says so in the UI.

---

## What future clinical validation would require

If this battery were ever to be used for anything beyond personalization and
self-tracking, it would require, at minimum:

1. A clear construct definition and item pool generated from a defined
   domain model.
2. A reference sample representative of the target stroke population.
3. Reliability evidence (internal consistency, test–retest, inter-rater where
   relevant).
4. Validity evidence (content, construct, criterion — against established
   measures — and responsiveness to change).
5. Published norms and/or clinically meaningful change thresholds derived from
   data, not assumption.
6. Equivalence evidence for any alternate forms, plus practice-effect and
   learning-effect quantification.
7. Regulatory and ethical review appropriate to the intended use.

Until and unless that work is done and published, this check remains what it is
today: an optional, local, personalization and change-tracking aid.

---

## Authoritative sources and the boundary the app respects

The design is deliberately conservative relative to the evidence on assessment:

- **NICE NG236 (Stroke rehabilitation in adults, 2023)** recommends using
  **valid, reliable and responsive tools** for clinical assessment, and
  standardised cognitive assessment as part of a multidisciplinary
  rehabilitation approach.
- **VA/DoD Clinical Practice Guideline for the Management of Stroke
  Rehabilitation (2024)** specifies that **research neuropsychological
  outcomes should use clinically relevant, validated formal tests**, and
  emphasises **functional outcomes** alongside impairment-level measures.

These principles are exactly why the app's own check is **not** used for
clinical assessment and is **not** described as a validated test. The app's
check exists only to personalise practice and track app-task change; anything
clinical is referred to the person's rehabilitation team and to validated
tools administered by professionals.

---

## Implementation map

| Concern | Where |
|---|---|
| Pre/post types (`OutcomeAssessment`, `DomainOutcome`, `FunctionalGoalRating`, `AssessmentForm`, `AssessmentKind`) | `src/types.ts` |
| Form alternation, per-domain comparison, goal-rating comparison, training exposure, post-check suggestion | `src/lib/outcome.ts` |
| Personalization (max 3 focus domains, starting level, fatigue-aware session length) | `src/lib/personalization.ts` |
| Session-length policy (default 15, cap 30, 60 only with clinician/carer override) | `src/lib/sessionPolicy.ts` |
| Adaptive training engine (conservative, one-level-at-a-time, fatigue hold/downshift, skip-never-failure) | `src/lib/adaptiveEngine.ts` |
| Local persistence and Clear All Data integration | `src/lib/personalizationStorage.ts` and the outcome/adaptive storage module |
| Evidence traceability | `docs/EVIDENCE.md` |
