# Research method

This document records how the evidence behind Stroke Recovery Companion was
gathered and rated, so the basis for every feature can be re-examined.

## What the evidence base is (and is not)

Five source reports were prepared by evidence agents in September 2026:
guideline/dose, cognition, language/vision, digital safety/privacy, and Apple
iPhone/iPad platform/accessibility. Their claims and citations are distilled
into `docs/EVIDENCE.md`, the in-app evidence registry, and
`docs/APPLE_PLATFORM.md`. They draw on:

1. **National/international clinical guidelines** (highest-priority): NICE NG236
   (UK, 2023), VA/DoD Stroke Rehabilitation CPG v5.0 (US, 2024), Canadian Stroke
   Best Practices 7th edition (2025), AHA/ASA guidelines (2026), ESO aphasia
   and visual-impairment guidelines (2025), and ACRM/Cicerone (2019).
2. **Systematic reviews and meta-analyses**, with Cochrane reviews given the
   most weight (memory, attention, executive function, spatial neglect, SLT,
   visual field defects, VR).
3. **Large or pivotal randomised trials** (e.g. Big CACTUS) and individual
   participant-data analyses (RELEASE), used where review-level evidence was
   thin.
4. **Primary regulatory sources** for privacy/safety: Cloudflare's HIPAA
   guidance, the FTC Health Breach Notification Rule, and FDA General Wellness /
   Device Software Functions guidance.
5. **Primary platform/accessibility sources** for the Apple-first implementation:
   Apple/WebKit documentation and W3C/WCAG 2.2, supplemented by high-quality
   usability research for older adults and cognitive impairment.

## Source hierarchy (order of precedence)

When sources disagree, the following order is used:

1. Cochrane systematic reviews and multi-guideline consensus.
2. Authoritative clinical practice guidelines (NICE, VA/DoD, CSBPR, AHA/ASA,
   ESO).
3. Non-Cochrane meta-analyses and pivotal RCTs.
4. Smaller reviews, case series and single-subject work (flagged as such).
5. Viewpoints / opinion pieces (never treated as evidence, only as context).

## Search date

All searches were run **20 September 2026**, and the evidence reflects what was
published and retrievable up to that date. Sources are cited with their
publication year; a few 2025–2026 full texts sit behind paywalls and were used
at abstract level, which is noted where it applies.

## Inclusion and exclusion

**Included:** evidence specific to adults after stroke; brain-injury evidence
explicitly extrapolated to stroke where the guideline itself does so (e.g.
ACRM/Cicerone); dementia/MCI evidence only where the reports flag it as
non-stroke context (e.g. the dose–response "25–30 min" figure, spaced
retrieval).

**Excluded:** commercial "brain game" claims; interventions that are not
consumer-safe or not deliverable by an app (e.g. tDCS/brain stimulation,
prisms); restitutive "visual field restoration" claims (not proven, and
potentially misleading).

## Evidence strength rating

Each feature is given a strength label — STRONG, MODERATE, LOW, VERY LOW,
UNCERTAIN, EXPERT CONSENSUS, or EXPLORATORY — that tracks the certainty of the
underlying source, not the enthusiasm of the recommendation. Two things are
deliberately kept apart:

- **Impairment-level evidence** — a change on the trained task/test.
- **Functional evidence** — a change in real-world independence (ADL/IADL).

A feature whose evidence is only impairment-level is never described as
improving everyday life.

## Important caveats

- **Evidence changes.** These notes are a point-in-time snapshot. Guidelines
  and systematic reviews are periodically updated; before making external
  claims, re-check the primary sources at their URLs.
- **A recommendation can be strong while its evidence is weak.** Several
  guideline recommendations (e.g. ESO aphasia dose) are "strongly worded" but
  "based on low-quality evidence". This document preserves that distinction.
- **The absence of a session-length guideline is itself a finding.** No
  authoritative guideline specifies an app/screen session length; the app's
  session policy is therefore a fatigue-based engineering default, not a
  guideline endorsement (see `docs/EVIDENCE.md`).

## Keeping this up to date

When new evidence is added:

1. Update the relevant research report.
2. Update `src/lib/evidence.ts` (the in-app registry).
3. Update the traceability table in `docs/EVIDENCE.md`.
4. Re-run `npm run check:phi` and the test suite, and adjust any app copy that
   now over-claims.
