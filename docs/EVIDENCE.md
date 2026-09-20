# Evidence traceability

This document maps every feature in Stroke Recovery Companion back to its
supporting research and clinical guidelines, so the link between the app and
the evidence is auditable. It is the long-form companion to the in-app
"Research & Evidence" screen and the machine-readable registry in
`src/lib/evidence.ts`.

**Compiled:** 20 September 2026.
**Research basis:** five research workstreams were completed before the build:
guideline/dose, cognition, language/vision, digital safety/privacy, and Apple
iPhone/iPad platform accessibility. Their findings, limitations, and primary
source links are synthesized here and in `docs/RESEARCH_METHOD.md` and
`docs/APPLE_PLATFORM.md`.

> **The one thing to remember:** improving a score on a trained task is not the
> same as improving everyday life. Much of the evidence shows near-transfer
> (the trained task improves) without far-transfer (independence in daily
> activities). Where a feature's evidence is impairment-level only, this
> document says so explicitly, and the app never claims otherwise.

---

## Evidence strength legend

| Label | Meaning |
|---|---|
| **STRONG** | High-certainty, consistent evidence or a firm guideline recommendation. |
| **MODERATE** | Reasonable evidence, usually with limitations (small samples, mixed populations). |
| **LOW** | Limited, inconsistent or low-certainty evidence. |
| **VERY LOW** | Very uncertain; single-subject/case-series or highly heterogeneous evidence. |
| **UNCERTAIN** | No usable estimate of effect; explicitly unproven. |
| **EXPERT CONSENSUS** | Guideline opinion without strong trial evidence. |
| **EXPLORATORY** | Hypothesis-generating subgroup/moderator findings, not established. |

**Impairment vs functional.** Throughout, "impairment-level" means a change on
the test/task being trained. "Functional" (or "ADL/IADL") means a change in
real-world independence — self-care, home/financial management, leisure,
driving, work. These are deliberately kept separate.

---

## Traceability table

| Feature | Source(s) | Strength | Limitations | App behaviour |
|---|---|---|---|---|
| **Orientation cues** (date, time, season, routine) | Canadian Stroke Best Practices VCI; Frontiers in Neuroscience 2026 | EXPERT CONSENSUS | No stroke-specific review shows a standalone orientation exercise improves recovery; cues are compensatory support only. | Shows current day/date/time/season + a routine cue. Does NOT claim to restore orientation. |
| **Memory practice** (spaced retrieval, errorless, reminders) | Cochrane 2016 (das Nair); Jones 2021; Hudes 2022; ACRM/Cicerone 2019; CSBPR | LOW | Cochrane found only short-term self-reported benefit, no ADL effect. Errorless learning = low-tier, little transfer. Spaced retrieval lacks a stroke-specific trial. External-aid evidence promising but small. | Offers practice/compensation techniques. Does NOT claim memory restoration. |
| **Attention practice** (low-distraction, no timer) | Cochrane 2019 (Loetscher); CSBPR attention; ACRM/Cicerone 2019 | LOW | Only immediate divided-attention gain, very low certainty; no effect on daily life/mood/QoL. Practice-Standard evidence is TBI-extrapolated. | Find-the-target exercise, adjustable difficulty, no time pressure. Does NOT claim everyday-function benefit. |
| **Problem-solving** (Goal–Plan–Do–Check) | CST-vs-CRFT meta-analysis 2026; Cochrane 2013 (Chung); CO-OP stroke review 2017 | MODERATE | Cochrane found no overall executive-rehab benefit. Positive signal from strategy training is proxy-rated, small, mixed brain-injury samples, unclear long-term. | Walks Goal/Plan/Do/Check for scenarios as a thinking exercise. Does NOT claim proven independence gains. |
| **Language & words** (naming, phrase board, talking tips) | Big CACTUS 2020; ESO aphasia guideline 2025; SFA meta-analysis 2018; Simmons-Mackie 2010; Cochrane SLT | MODERATE | Word drills improve *trained* words only; no conversation/untrained-word generalisation. Adjunct to SLT, not a replacement. | Naming with semantic/first-sound cues, tap-to-speak phrase board, partner tips. Does NOT claim conversation restoration. |
| **Visual scanning** | Cochrane neglect 2021 (Longley); Cochrane VFD 2019 (Pollock); ACRM/Cicerone 2019 | VERY LOW | ADL independence "remains unproven"; field-restoration is not proven (placebo demonstrated); prisms can cause headache. | Guided scanning with safety warning (seated only). Does NOT claim vision restoration or neglect treatment. |
| **Daily routine checklists** | VA/DoD CPG 2024; NICE NG236 | MODERATE | A checklist is a compensatory prompt, not therapy; a tick is activity, not ability. | Morning/midday/evening checklists stored on-device. Does NOT replace occupational therapy. |
| **Mood & fatigue check-in** | NICE NG236; VA/DoD CPG 2024 | EXPERT CONSENSUS | A 0–10 self-rating is not a validated diagnostic tool. | Records a simple score + escalation guidance; signposts to professional support. Does NOT diagnose. |
| **Caregiver support** | Simmons-Mackie 2010; ARMed4Stroke 2024/25; ASHA | MODERATE | Mainly benefits the caregiver (burden/QoL); no patient mobility gain shown. | Communication tips, self-care reminders, escalation guidance. Does NOT claim to improve the patient's recovery. |
| **Session length & pacing** | NICE NG236; VA/DoD CPG 2024; Liu et al. 2025; fatigue (38–77%); npj Digital Medicine 2024 | LOW | No guideline sets an app session length. "≤30 min is better" is an exploratory, confounded subgroup finding. 20–30 min = tolerability default, not an optimum. | Defaults to 15 min, caps at 30 (60 only with clinician/carer override), fatigue check, rest prompts, stop-anytime. Never claims "30 min is optimal". |
| **Accessible design** | Rose 2003; aphasia-friendly materials; 2026 accessibility study | MODERATE | Modest effect (~11% comprehension gain in one study); design-led rather than trial-based. | Large targets, scalable type, high contrast, keyboard nav, screen-reader semantics, read-aloud, no time pressure. |
| **Apple iPhone/iPad platform** | Apple/WebKit; WCAG 2.2; `05-apple-ios-ipad.md` | EXPERT CONSENSUS / PLATFORM CAPABILITY | Home Screen install is manual; Web Push is installed-PWA only; programmatic browser dictation is not reliable in Home Screen web apps. | iPhone/iPad-first PWA, safe-area support, 44px targets, zoom/scalable text, reduced motion, install guide; unsupported native capabilities remain roadmap items. |
| **Local-first privacy** | Cloudflare HIPAA; FTC HBNR; FDA General Wellness | EXPERT CONSENSUS | Not a HIPAA-covered service (BAA would need Enterprise plan). A non-HIPAA health app still falls under FTC HBNR. | On-device storage only, no server datastore, no PHI, synthetic data, no HIPAA claim, wellness-adjunct positioning. |
| **Emergency stroke warning** | AHA/ASA stroke warning signs (FAST) | EXPERT CONSENSUS | Static safety information, not personalised advice. | Persistent FAST banner + onboarding reinforcement. Never interprets symptoms. |

---

## Session-duration policy (evidence-labelled)

Per `01-guidelines-dose.md` and `04-digital-safety-privacy.md`:

- **No fixed session length is specified by any guideline** (STRONG). NICE and
  AHA/ASA define only a ≥3 h/day *total multidisciplinary* dose; VA/DoD rates
  computer-assisted cognitive rehabilitation "insufficient evidence". The app
  never cites the 3-hour figure as a screen-time target.
- **Duration must be individualised to fatigue and mood** (STRONG). NICE
  NG236 §1.2.19 and Canadian SBPR §3.2 require adapting duration, rests and
  distraction to the person.
- **A ~20–30 min session is a defensible tolerability/feasibility default,
  not an optimum** (LOW / EXPLORATORY). The "≤30 min is superior" claim comes
  from one confounded, between-study subgroup analysis (Liu et al. 2025).
- **Total dose matters more than per-session length** (MODERATE).

**Policy in code (`src/lib/sessionPolicy.ts`):** default 15 minutes; ceiling
30 minutes for self-configured use; 60-minute ceiling reachable only when
`clinicianConfigured` is set (a clinician/carer helped set the app up).

---

## Privacy, safety and positioning posture

- **Local-first:** all data lives in the user's browser (IndexedDB/localStorage).
  No server-side datastore (no D1/R2/KV) stores any personal data. Synthetic
  demo data only.
- **No HIPAA claim.** Cloudflare signs a BAA only for Enterprise customers and
  only before PHI flows; a self-service deployment cannot be described as
  HIPAA-compliant.
- **FTC Health Breach Notification Rule** is the relevant breach-notification
  boundary for a non-HIPAA health app.
- **Positioning:** adjunct to clinician-directed rehabilitation. Not a medical
  device, not a diagnosis, not a replacement for PT/OT/SLP/medical care.
  Avoids disease-treatment / function-restoration claims to stay in the
  low-risk "general wellness" lane.
- **Emergency safety:** persistent FAST warning; if new face droop, arm/leg
  weakness, speech/language change, major vision change, severe balance
  problem, sudden confusion or severe headache appear → call emergency
  services.
- **Mood:** supportive self-check only; no diagnosis; escalation guidance for
  persistent low mood / self-harm thoughts.

---

## Full source list

Key primary sources (URLs also inline in `src/lib/evidence.ts`):

- NICE NG236 "Stroke rehabilitation in adults" (2023) —
  https://www.nice.org.uk/guidance/ng236
- VA/DoD "Management of Stroke Rehabilitation" CPG v5.0 (2024) —
  https://www.healthquality.va.gov/guidelines/Rehab/stroke/
- Canadian Stroke Best Practices 7th ed. (2025) — cognitive rehabilitation &
  sleep/fatigue modules — https://www.strokebestpractices.ca
- AHA/ASA 2026 Guideline for Adult Stroke Rehabilitation and Recovery —
  https://doi.org/10.1161/STR.0000000000000536
- AHA/ASA Scientific Statement — Rehabilitation of Cognitive Deficits
  Poststroke — https://doi.org/10.1161/STROKEAHA.121.034218
- Cochrane reviews: memory (das Nair 2016), attention (Loetscher 2019),
  executive function (Chung 2013), spatial neglect (Longley 2021), SLT
  (CD000425), visual field defects (Pollock 2019).
- ESO guideline on aphasia rehabilitation (2025) —
  https://pmc.ncbi.nlm.nih.gov/articles/PMC12098336
- Big CACTUS (2020) — https://pubmed.ncbi.nlm.nih.gov/31201053
- ACRM / Cicerone 2019 systematic review —
  https://www.bumc.bu.edu/neurorehabilitationlab/files/2021/04/Evidence-Based-Cognitive-Rehabilitation_Systematic-Review_2019_AuthorCopy.pdf
- Liu et al. 2025 (Arch Phys Med Rehabil) digital-interventions meta-analysis —
  https://doi.org/10.1016/j.apmr.2025.07.004
- npj Digital Medicine 2024 dose–response (non-stroke) —
  https://www.nature.com/articles/s41746-024-01210-9
- Cloudflare HIPAA compliance — https://www.cloudflare.com/trust-hub/compliance-resources/hipaa
- FTC Health Breach Notification Rule —
  https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- FDA General Wellness guidance —
  https://www.hhs.gov/guidance/sites/default/files/hhs-guidance-documents/FDA/1300013_0.pdf

The complete, numbered source lists live in the four research reports.
