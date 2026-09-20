# Evidence base

This document maps every feature of Stroke Recovery Companion back to the
guidelines and systematic reviews that inform it. It is deliberately honest:
for each recommendation we state the evidence strength, whether the evidence is
at the *impairment* level (scores on a trained task) or the *functional* level
(independence in real life), and where the evidence is weak or uncertain.

A companion app is **not** a medical device and **not** medical advice. Where the
evidence only supports *compensatory* support (helping someone cope) rather than
*restorative* training (improving the underlying function), we say so and we do
not claim otherwise in the product.

---

## Key sources

| # | Source | Link |
|---|--------|------|
| 1 | NICE NG236 — Stroke rehabilitation in adults (2023) | https://www.nice.org.uk/guidance/ng236 |
| 2 | VA/DoD — Management of Stroke Rehabilitation CPG (2024) | https://www.healthquality.va.gov/guidelines/Rehab/stroke/index.asp |
| 3 | Canadian Stroke Best Practices (CSBPR, 7th ed.) — Cognitive Rehabilitation / Vascular Cognitive Impairment | https://www.strokebestpractices.ca/recommendations/vascular-cognitive-impairment/3-cognitive-rehabilitation |
| 4 | European Stroke Organisation (ESO) — Aphasia rehabilitation guideline (2025) | Brady et al., *European Stroke Journal* 10(4):1189–1220. DOI: 10.1177/23969873241311025 |
| 5 | Cochrane — Cognitive rehabilitation for memory deficits after stroke (2016) | das Nair et al. CD002293. https://www.cochrane.org/evidence/CD002293 |
| 6 | Cochrane — Cognitive rehabilitation for attention deficits after stroke (2019) | Loetscher et al. CD002842. https://www.cochrane.org/evidence/CD002842 |
| 7 | Cochrane — Non-pharmacological interventions for spatial neglect (2021) | Longley et al. CD003586.pub4. https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003586.pub4 |
| 8 | Cochrane — Occupational therapy for cognitive impairment after stroke | CD006430. https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD006430.pub3 |
| 9 | Cochrane — Cognitive training for people with mild to moderate dementia/vascular cognitive impairment | Bahar-Fuchs et al. 2019 |
| 10 | Digital interventions for post-stroke rehabilitation — systematic review & meta-analysis (2025) | *Archives of Physical Medicine and Rehabilitation*. S0003999325008020 |
| 11 | Telerehabilitation in post-stroke care — SR & meta-analysis (2025) | *Top Stroke Rehabil.* 32(3):323–335. DOI: 10.1080/10749357.2024.2392439 |
| 12 | Errorless learning in cognitive rehabilitation — critical review | Middleton & Schwartz (2012). PMC3381647 |
| 13 | Retrieval practice and spacing in naming rehabilitation (aphasia) | Middleton et al. (2016), *J Speech Lang Hear Res.* |
| 14 | Scanning training for visual field defects / neglect | NCBI Bookshelf NBK585577 |

---

## 1. Fatigue-aware, short sessions (≤30 minutes by default)

**Evidence.** Post-stroke fatigue affects roughly 38–77% of stroke survivors and
is effort-induced (CSBPR Mood, Cognition & Fatigue). NICE NG236 (2023) includes
assessment for fatigue as a distinct rehabilitation need. The 2025 systematic
review of digital interventions found **shorter sessions (≤30 minutes) were
associated with superior overall cognition outcomes** compared with longer
durations (Archives PM&R, S0003999325008020). NICE NG236 also carries
recommendations on telerehabilitation and intensity of rehabilitation.

**Strength.** Short-session *feasibility/tolerability*: moderate (multiple SRs).
A specific "30-minute" ceiling: **low / exploratory** — no guideline mandates an
exact app session length; 30 minutes is a defensible tolerability default, not a
proven efficacy optimum.

**Implementation.** The daily session is capped at 30 minutes by default
(configurable lower). A fatigue/energy check precedes the session; high fatigue
triggers a rest-first suggestion. Rest prompts appear at a configurable
interval. There is no countdown timer and no time pressure.

**Uncertainty.** Session length as an efficacy variable is under-studied; we
flag it as a default, not a recommendation.

---

## 2. Orientation cues (date / time / season / routine)

**Evidence.** No stroke-specific systematic review establishes a standalone
"reality-orientation" exercise as effective. Orientation support is treated in
guidelines as a *compensatory* support for disorientation, not as restorative
treatment.

**Strength.** Expert consensus / compensatory support only.

**Implementation.** The Orientation screen shows the current time, date, day of
week, season and a plain routine cue. It is offered as a gentle anchor, and the
app does not claim it restores orientation.

**Uncertainty.** HIGH — no efficacy claim is made.

---

## 3. Memory compensation (spaced retrieval, errorless-style practice, external prompts)

**Evidence.** CSBPR recommends: external cues/support devices for memory
difficulty (Strong, Moderate quality); internal strategies including spaced
retrieval practice (Strong, Moderate); and errorless learning for moderate–severe
memory impairment on specific functional tasks (Strong, Moderate). The 2016
Cochrane review (das Nair) found memory rehabilitation produced a **short-term
improvement on *subjective* memory measures only** (SMD 0.36), with **no
benefit on objective memory, ADL, mood or quality of life, and no long-term
persistence**. Middleton & Schwartz's critical review shows retrieval practice
with spacing often outperforms errorless learning for *retention*, while
errorless learning is best for *learning specific skills with limited
generalisation*.

**Strength.** Compensatory strategies: moderate. Direct memory-function
improvement: **low, and limited to subjective/short-term** — we do not claim the
app "improves memory".

**Implementation.** Three techniques: (a) spaced retrieval (recall at increasing
intervals), (b) errorless-style practice (answer shown first, cue faded), and
(c) preset-only written reminder prompts (an external memory aid). Reminder
content is preset (no free text) for privacy.

**Uncertainty.** Benefit is mostly compensatory; transfer to everyday function
is uncertain (Cochrane 2016).

---

## 4. Attention practice (reduced distractions, adjustable difficulty)

**Evidence.** CSBPR recommends *reducing cognitive demands* for people with
impaired attention: shorter sessions, planned rests, reducing background
distractions, and avoiding activity when tired (Strong/consensus). The 2019
Cochrane review (Loetscher) found **no convincing effect on global attention**;
only divided attention improved (PASAT SMD 0.67), with very low-quality
evidence overall.

**Strength.** Environmental compensation: moderate. Restorative attention
training: **very low / uncertain**.

**Implementation.** A single-target visual search task in a clean,
low-distraction screen with adjustable difficulty and **no timer by default**
(avoids time pressure). Framed as practice, not treatment.

**Uncertainty.** HIGH — no claim of restoring attention is made.

---

## 5. Executive function / problem-solving (Goal–Plan–Do–Check)

**Evidence.** CSBPR recommends metacognitive strategy training and formal
problem-solving strategies for mild–moderate executive dysfunction (Strong,
Moderate quality), plus external strategies (written/electronic cues). This is
the strongest-supported cognitive domain for strategy training.

**Strength.** Moderate.

**Implementation.** Everyday scenarios walk the user through Goal → Plan → Do →
Check, with reflective prompts and no scored "right answer". The practice is the
metacognitive process itself.

**Uncertainty.** Generalisation to untrained tasks is the known limitation;
framed accordingly.

---

## 6. Language / aphasia adjunct (naming, phrase board, communication tips)

**Evidence.** ESO (2025) recommends higher total speech-language therapy dose
(≥20 h; low-quality evidence) and suggests individually-tailored SLT and digital
delivery models. Retrieval practice with spacing improves naming retention
(Middleton et al. 2016). Naming/warm-up exercise is an **adjunct**, not a
replacement, for speech-language pathology.

**Strength.** SLT itself: guideline-recommended. A *digital adjunct*: suggested
(ESO), low-quality. Naming exercises: supported at the item/retention level.

**Implementation.** Naming practice (semantic cue → first-sound cue → reveal), a
tap-to-speak phrase board for supported communication, and caregiver
communication tips. Prominently labelled "adjunct to speech-language therapy".

**Uncertainty.** Dose and delivery-model evidence is low-quality (ESO 2025).

---

## 7. Visual scanning / neglect practice

**Evidence.** Scanning training improves reading (SMD 0.79) and visual scanning
(SMD 1.14) in people with visual field defects/neglect, but requires many
sessions (>40) and there is **insufficient evidence of benefit on everyday
function/ADL** (NBK585577; Cochrane 2021, CD003586 — very low-quality overall).

**Strength.** Scanning-task improvement: low. Functional transfer: **very
low / insufficient**.

**Implementation.** A side-emphasis scanning line (left/right/both) with safety
wording: "only practise while sitting safely; never while walking or driving."

**Uncertainty.** HIGH — no functional claim is made.

---

## 8. ADL / routine checklists

**Evidence.** External written/electronic cues and checklists are a recommended
compensatory strategy across CSBPR (executive function and memory sections) and
are consistent with VA/DoD's functional-goal orientation.

**Strength.** Compensatory support: moderate (guideline consensus).

**Implementation.** Morning / midday / evening routine checklists with
checkboxes, saved locally. A record of activity, not a measure of ability.

---

## 9. Mood & fatigue self-check (with escalation)

**Evidence.** NICE NG236 recommends screening for psychological changes
(depression, anxiety) after stroke, and CSBPR covers post-stroke fatigue
assessment. Self-report scales are screening aids, not diagnosis.

**Strength.** Screening recommendation: guideline-level. This app's 0–10 scale
is a *reflection aid*, not a validated screening instrument.

**Implementation.** 0–10 mood and fatigue ratings stored locally, with clear
escalation language (persistent low mood, self-harm, new stroke symptoms,
falls) and an explicit "not a diagnosis" note.

**Uncertainty.** The in-app scale is NOT a validated instrument (e.g. PHQ-9 /
FSS); it is deliberately not used for clinical interpretation.

---

## 10. Caregiver mode

**Evidence.** NICE NG236 requires services to consider carer needs and offer
training/support to reduce caregiver strain; VA/DoD publishes a carer companion
booklet. Communication strategies for aphasia are covered by CSBPR/ESO-adjacent
guidance.

**Strength.** Carer support: guideline-level (moderate). Specific in-app tips:
expert consensus.

**Implementation.** Communication tips, carer self-care reminders, and
escalation guidance.

---

## 11. Progress dashboard (adherence & function emphasis)

**Evidence.** No guideline supports interpreting app usage as a measure of
recovery. We deliberately track **adherence** (sessions, days, minutes) and
**activity** (checklist ticks, self-reported mood/fatigue), never a recovery or
impairment score.

**Strength.** N/A — this is reporting, not an intervention.

**Implementation.** Dashboard shows sessions completed, minutes practised, day
streak, today's routine ticks, and recent check-ins, with a prominent "not a
medical measure of recovery" notice.

---

## Digital delivery & telerehabilitation (cross-cutting)

**Evidence.** NICE NG236 (2023) includes telerehabilitation recommendations.
Systematic reviews (2024–2025) report digital/telerehabilitation interventions
are generally feasible, acceptable and safe, with modest effects; the strongest
and most consistent signal is on feasibility/acceptability rather than
large functional gains.

**Strength.** Feasibility/acceptability: moderate. Efficacy: mixed/modest.

**Implementation.** This app is a local-first web app (no server-side health
data), which supports the "safe, feasible digital adjunct" framing without
overstating efficacy.

---

## Flagged uncertainties (summary)

1. No guideline specifies an exact app session length; 30 minutes is a
   tolerability default, not a proven optimum.
2. Memory training shows subjective/short-term benefit only (Cochrane 2016);
   no functional or long-term benefit is claimed.
3. Attention training evidence is very low quality (Cochrane 2019).
4. Neglect/scanning training improves the trained task but not proven ADL
   transfer (Cochrane 2021).
5. Aphasia digital-adjunct evidence is low-quality (ESO 2025).
6. The in-app mood/fatigue scales are not validated instruments.
7. Orientation cues are compensatory only — no restorative claim.
