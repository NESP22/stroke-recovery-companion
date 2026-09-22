// Evidence registry — the single source of truth that maps every app feature
// back to the five research reports in ../Documents/stroke-recovery-research.
//
// This file exists so that:
//   1. Every module can render a "Why this is here" link (see EvidenceLink.tsx).
//   2. The in-app "Research & Evidence" screen (Evidence.tsx) can list it all.
//   3. docs/EVIDENCE.md mirrors it for auditors and clinicians.
//
// Language rules (mandatory, from the RESEARCH DOCUMENTATION GATE):
//   - Never say an intervention is "proven" when transfer to ADL/IADL is uncertain.
//   - Always separate IMPAIRMENT-level evidence (test scores on the trained task)
//     from REAL-WORLD / FUNCTIONAL evidence (independence in everyday life).
//   - A "why this is here" must state sources, evidence strength, and limitations.

export type EvidenceStrength =
  | 'STRONG'
  | 'MODERATE'
  | 'LOW'
  | 'VERY LOW'
  | 'UNCERTAIN'
  | 'EXPERT CONSENSUS'
  | 'EXPLORATORY';

export interface EvidenceSource {
  /** Short human-readable citation. */
  label: string;
  url: string;
}

export interface EvidenceEntry {
  /** Stable id — matches a module id, or a cross-cutting topic id. */
  id: string;
  title: string;
  /** Plain-language "why this is here", for a patient/caregiver. */
  why: string;
  strength: EvidenceStrength;
  /**
   * Where the evidence actually lands. We separate:
   *  - IMPAIRMENT = scores on the trained task/test (near transfer).
   *  - FUNCTIONAL = independence in real ADL/IADL tasks (far transfer).
   */
  evidenceScope: string;
  limitations: string;
  /** What the app does, and what it explicitly does NOT claim. */
  appBehavior: string;
  sources: EvidenceSource[];
}

export const EVIDENCE: EvidenceEntry[] = [
  {
    id: 'orientation',
    title: 'Orientation cues',
    why: 'Knowing the date, time, season and routine is a practical support that can help people feel oriented through the day. Guidelines handle orientation as a compensatory support, not as a treatment that "fixes" the brain.',
    strength: 'EXPERT CONSENSUS',
    evidenceScope:
      'COMPENSATORY support. There is no stroke-specific review showing that a standalone "reality-orientation" exercise improves recovery.',
    limitations:
      'No stroke-specific systematic review establishes a dedicated orientation-training module as effective. Orientation cues are reasonable supports, not a proven restorative treatment.',
    appBehavior:
      'The app shows the current day, date, time, season and a routine cue. It does NOT claim to restore orientation or treat disorientation.',
    sources: [
      {
        label: 'Canadian Stroke Best Practices — Vascular Cognitive Impairment (orientation handled within screening/assessment and compensatory support)',
        url: 'https://www.strokebestpractices.ca/recommendations/vascular-cognitive-impairment/3-cognitive-rehabilitation',
      },
      {
        label: 'Frontiers in Neuroscience 2026 — interventions for post-stroke cognitive impairment (systematic review)',
        url: 'https://frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2026.1778597/pdf',
      },
    ],
  },
  {
    id: 'memory',
    title: 'Memory practice',
    why: 'Some memory techniques — external reminders, spaced retrieval and errorless learning — are used in rehabilitation to help people compensate for memory difficulties. The best-supported approach is external aids and taught strategies.',
    strength: 'LOW',
    evidenceScope:
      'Mostly IMPAIRMENT-level / self-reported. Evidence for improved independence in everyday life (ADL/IADL) is weak or absent.',
    limitations:
      'Cochrane (2016) found only modest short-term self-reported memory benefit and no effect on everyday function. Errorless learning is a low-tier option with little transfer to new tasks. Spaced retrieval is well-supported in dementia/MCI but has no large stroke-specific trial. External-aid evidence is promising but often from small studies.',
    appBehavior:
      'The app offers spaced retrieval, errorless-style practice and preset reminder prompts as practice/compensation techniques. It does NOT claim to restore memory or guarantee improvement.',
    sources: [
      {
        label: 'Cochrane — memory rehabilitation after stroke (das Nair 2016)',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD002293.pub3/full',
      },
      {
        label: 'Jones 2021 — prospective memory meta-analysis (external memory aids, g = 0.805)',
        url: 'https://pubmed.ncbi.nlm.nih.gov/33393806',
      },
      {
        label: 'Hudes 2022 — compensatory memory interventions meta-analysis (ABI)',
        url: 'https://pubmed.ncbi.nlm.nih.gov/35238602',
      },
      {
        label: 'ACRM / Cicerone 2019 — errorless learning rated a low-tier Practice Option',
        url: 'https://www.bumc.bu.edu/neurorehabilitationlab/files/2021/04/Evidence-Based-Cognitive-Rehabilitation_Systematic-Review_2019_AuthorCopy.pdf',
      },
      {
        label: 'Canadian Stroke Best Practices — memory (external cues, spaced retrieval, errorless learning)',
        url: 'https://www.strokebestpractices.ca/recommendations/activity-participation-following-stroke/3-cognitive-rehabilitation-for-individuals-with-stroke',
      },
    ],
  },
  {
    id: 'attention',
    title: 'Attention practice',
    why: 'Attention is a common difficulty after stroke. A low-distraction task with adjustable difficulty and no timer lets someone practise focusing gently, and guidelines recommend reducing distractions and planning rests.',
    strength: 'LOW',
    evidenceScope:
      'IMPAIRMENT-level only. Any improvement is on the trained task; there is no convincing effect on everyday function, mood or quality of life.',
    limitations:
      'Cochrane (2019) found only an immediate divided-attention improvement with very low certainty, and no effect on daily life. Stronger recommendation-grade evidence is extrapolated from brain-injury (not stroke) populations.',
    appBehavior:
      'The app provides a low-distraction find-the-target exercise with adjustable difficulty and no time pressure. It does NOT claim to improve everyday functioning.',
    sources: [
      {
        label: 'Cochrane — attention deficits after stroke (Loetscher 2019)',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD002842.pub3/full',
      },
      {
        label: 'Canadian Stroke Best Practices — attention (adapt environment: duration, rests, reduce distractions)',
        url: 'https://www.strokebestpractices.ca/recommendations/activity-participation-following-stroke/3-cognitive-rehabilitation-for-individuals-with-stroke',
      },
      {
        label: 'ACRM / Cicerone 2019 — attention training (direct + metacognitive) as Practice Standard',
        url: 'https://www.bumc.bu.edu/neurorehabilitationlab/files/2021/04/Evidence-Based-Cognitive-Rehabilitation_Systematic-Review_2019_AuthorCopy.pdf',
      },
    ],
  },
  {
    id: 'executive',
    title: 'Problem-solving (Goal–Plan–Do–Check)',
    why: 'Goal–Plan–Do–Check is a metacognitive strategy that helps people think through everyday tasks step by step. Strategy-based approaches are the most promising direction for carrying skills over to real tasks.',
    strength: 'MODERATE',
    evidenceScope:
      'Strategy training shows the best evidence of transfer to everyday task PERFORMANCE, but the effect is proxy-rated and short-term; large stroke-specific trials are lacking.',
    limitations:
      'Cochrane (2013) found no evidence of benefit from cognitive rehabilitation for executive dysfunction overall. The positive signal comes from strategy training (CO-OP, Goal Management Training) in small, often mixed brain-injury samples with near-normal cognition. Long-term and participation-level outcomes are unclear.',
    appBehavior:
      'The app walks through Goal, Plan, Do, Check for everyday scenarios as a thinking exercise (no scored "right answer"). It does NOT claim proven improvement in everyday independence.',
    sources: [
      {
        label: 'CST vs CRFT meta-analysis 2026 — strategy training improved task performance; computerized restorative training did not',
        url: 'https://link.springer.com/article/10.1007/s11065-025-09682-6',
      },
      {
        label: 'Cochrane — executive dysfunction after brain injury (Chung 2013)',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD008391.pub2',
      },
      {
        label: 'CO-OP in stroke — systematic review 2017',
        url: 'https://jptrs.org/journal/view.html?doi=10.14474/ptrs.2017.6.4.202',
      },
    ],
  },
  {
    id: 'aphasia',
    title: 'Language & words',
    why: 'Practising word-finding with structured cues can help retrieve personally important words, and a phrase board plus talking tips can support everyday conversation. Speech and language therapy itself is well-supported.',
    strength: 'MODERATE',
    evidenceScope:
      'Word drills help TRAINED words (impairment-level). Gains do not reliably carry over to conversation or untrained words. Conversation-partner training has the best evidence for real-world participation.',
    limitations:
      'Big CACTUS improved retrieval of personally chosen trained words (+16.4%) but did NOT improve conversation or untrained words. Word- and sentence-level drills generalise to everyday dialogue only "infrequently". This app is an adjunct, not a replacement for a speech-language pathologist.',
    appBehavior:
      'The app offers naming practice with semantic and first-sound cues, a tap-to-speak phrase board, and communication tips for the conversation partner. It does NOT claim to restore conversation or replace speech-language therapy.',
    sources: [
      {
        label: 'Big CACTUS (Lancet Neurology 2020) — self-managed computerised word-finding therapy',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31201053',
      },
      {
        label: 'ESO guideline on aphasia rehabilitation 2025',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12098336',
      },
      {
        label: 'Semantic Feature Analysis meta-analysis 2018',
        url: 'https://pubmed.ncbi.nlm.nih.gov/30208415',
      },
      {
        label: 'Simmons-Mackie 2010 — conversation partner training (participation)',
        url: 'https://pubmed.ncbi.nlm.nih.gov/21112422',
      },
      {
        label: 'Cochrane — speech and language therapy after stroke',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD000425.pub4',
      },
    ],
  },
  {
    id: 'neglect',
    title: 'Visual scanning',
    why: 'Scanning to one side is the most commonly recommended approach for people who miss things on one side after a stroke. It is practised as a careful, guided search — never as a way to "restore" lost vision.',
    strength: 'VERY LOW',
    evidenceScope:
      'IMPAIRMENT-level at best. Whether scanning improves independence in everyday life is explicitly "unproven".',
    limitations:
      'Cochrane found no reliable effect of scanning on persisting everyday (ADL) outcomes and rated the evidence very uncertain. "Field restoration" training is not proven and can be a placebo. Prisms can cause headache. Any "may help" wording must stay cautious.',
    appBehavior:
      'The app offers a guided find-the-target scanning exercise with a "look toward the side" prompt and a safety warning to practise only while seated. It does NOT claim to restore vision or treat neglect.',
    sources: [
      {
        label: 'Cochrane — spatial neglect (Longley 2021): ADL independence "remains unproven"',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD003586.pub4/full',
      },
      {
        label: 'Cochrane — visual field defects after stroke (Pollock 2019)',
        url: 'https://www.cochrane.org/evidence/CD008388_interventions-visual-field-defects-people-stroke',
      },
      {
        label: 'ACRM / Cicerone 2019 — visual scanning as a Practice Standard (impairment level)',
        url: 'https://www.bumc.bu.edu/neurorehabilitationlab/files/2021/04/Evidence-Based-Cognitive-Rehabilitation_Systematic-Review_2019_AuthorCopy.pdf',
      },
    ],
  },
  {
    id: 'adl',
    title: 'Daily routine checklists',
    why: 'Checklists act as external cues to help someone follow their morning, midday and evening routines. Task-specific practice tied to a person’s own goals is the strongest single recommendation in the guidelines.',
    strength: 'MODERATE',
    evidenceScope:
      'A check-list is a COMPENSATORY support (external aid). Task-specific practice for everyday activities is the best-supported (STRONG) recommendation, but the app only supports — it does not deliver — hands-on therapy.',
    limitations:
      'The checklist is a prompt, not therapy. A tick is a record of activity, not a measure of ability. Restorative gains in self-care require occupational-therapist-led, task-specific practice, which this app cannot replace.',
    appBehavior:
      'The app offers morning, midday and evening checklists saved on-device. It does NOT measure or claim to improve ability, and does not replace occupational therapy.',
    sources: [
      {
        label: 'VA/DoD Stroke Rehabilitation CPG 2024 — task-specific practice (Strong recommendation)',
        url: 'https://www.healthquality.va.gov/guidelines/Rehab/stroke/',
      },
      {
        label: 'NICE NG236 — rehabilitation linked to the person’s goals',
        url: 'https://www.nice.org.uk/guidance/ng236',
      },
    ],
  },
  {
    id: 'mood',
    title: 'Mood & fatigue check-in',
    why: 'Low mood and fatigue are common after stroke and affect how much rehabilitation people can do. A simple daily check helps notice changes and prompts people to seek support when needed.',
    strength: 'EXPERT CONSENSUS',
    evidenceScope:
      'SUPPORTIVE screening only. This is not a validated diagnostic instrument and cannot diagnose depression or anxiety.',
    limitations:
      'Guidelines recommend screening and treating mood early, but a 0–10 self-rating is a reflection, not a clinical assessment. Treatment (e.g. CBT, medication) is a clinical decision made by a professional, not this app.',
    appBehavior:
      'The app records a simple mood and fatigue score on-device and shows escalation guidance. It does NOT diagnose, and it signposts to professional support for persistent low mood or thoughts of self-harm.',
    sources: [
      {
        label: 'NICE NG236 — tailor sessions to mood and fatigue',
        url: 'https://www.nice.org.uk/guidance/ng236',
      },
      {
        label: 'VA/DoD Stroke Rehabilitation CPG 2024 — mood screening and treatment',
        url: 'https://www.healthquality.va.gov/guidelines/Rehab/stroke/',
      },
    ],
  },
  {
    id: 'caregiver',
    title: 'Caregiver support',
    why: 'Teaching the conversation partner how to communicate is one of the most reliably effective ways to improve participation for someone with aphasia. Supporting the caregiver’s own wellbeing also matters.',
    strength: 'MODERATE',
    evidenceScope:
      'Conversation-partner training has strong evidence for PARTICIPATION. Caregiver support mainly benefits the CAREGIVER (burden, quality of life) — evidence it improves the patient’s mobility is weak.',
    limitations:
      'A caregiver-mediated exercise trial found no mobility benefit for the patient, but caregivers reported better quality of life and mood. So this feature is best justified as support for the caregiver, not as a way to improve the patient’s outcomes.',
    appBehavior:
      'The app offers communication tips, self-care reminders and escalation guidance for helpers. It does NOT claim to improve the patient’s physical recovery.',
    sources: [
      {
        label: 'Simmons-Mackie 2010 — communication partner training',
        url: 'https://pubmed.ncbi.nlm.nih.gov/21112422',
      },
      {
        label: 'ARMed4Stroke 2024/25 — caregiver-mediated exercise + telerehab (no mobility gain; caregiver benefit)',
        url: 'https://doi.org/10.1177/02692155241261700',
      },
      {
        label: 'ASHA aphasia practice portal — individualise with care partners',
        url: 'https://www.asha.org/practice-portal/clinical-topics/aphasia',
      },
    ],
  },
  {
    id: 'session-policy',
    title: 'Session length & pacing',
    why: 'No guideline says how long a single app session should be. What we do know is that fatigue is common (roughly 4 to 8 in 10 people) and is brought on by mental effort — so short, flexible sessions with rests are a sensible default.',
    strength: 'LOW',
    evidenceScope:
      'Session LENGTH is not an established efficacy variable. Total practice dose and intensity matter more than minutes per session.',
    limitations:
      'There is no high-certainty evidence that short sessions beat longer ones — the "≤30 minutes is better" claim comes from one exploratory, confounded subgroup analysis. A 20–30 minute session is defensible only as a tolerability/feasibility default, not an optimum.',
    appBehavior:
      'The app defaults to a SHORT session (15 minutes), caps sessions at 30 minutes by default, asks about fatigue before and after, prompts rests, and always lets the user stop early. A longer cap (up to 60 minutes) is available only when a clinician/carer has configured it. It never claims "30 minutes is optimal".',
    sources: [
      {
        label: 'NICE NG236 — total multidisciplinary dose (not app session length); tailor to fatigue/mood',
        url: 'https://www.nice.org.uk/guidance/ng236',
      },
      {
        label: 'VA/DoD CPG 2024 — computer-assisted cognitive rehabilitation: "insufficient evidence"',
        url: 'https://www.healthquality.va.gov/guidelines/Rehab/stroke/',
      },
      {
        label: 'Liu et al. 2025 (Arch Phys Med Rehabil) — ≤30-min superiority is an exploratory subgroup finding',
        url: 'https://doi.org/10.1016/j.apmr.2025.07.004',
      },
      {
        label: 'Post-stroke fatigue prevalence and mechanism (38–77%)',
        url: 'https://pubmed.ncbi.nlm.nih.gov/21402652',
      },
      {
        label: 'npj Digital Medicine 2024 — 25–30 min/day computerised training (non-stroke cohort)',
        url: 'https://www.nature.com/articles/s41746-024-01210-9',
      },
    ],
  },
  {
    id: 'personalization',
    title: 'Personalized practice plan & baseline check',
    why: 'Stroke rehabilitation guidelines say to tailor sessions to the person’s goals, mood and fatigue. This app asks a few gentle, preset questions so it can suggest practice areas and a starting level that fit those goals. The suggestion is a convenience, not a medical judgement.',
    strength: 'EXPLORATORY',
    evidenceScope:
      'A PERSONALIZATION / CONVENIENCE feature. There is no validated evidence that a brief in-app baseline improves recovery outcomes; the only guideline-backed inputs are tailoring to the person’s own goals and to fatigue.',
    limitations:
      'The baseline check is NOT a validated cognitive screen (it is not the MoCA, MMSE or any diagnostic instrument), has no norming, and cannot detect impairment, severity or change over time. The mapping from task performance to a starting level is a transparent, deterministic rule — untested for outcomes and explicitly not a clinical assessment. It must never be used to label or diagnose.',
    appBehavior:
      'The app offers an optional, skippable, stop-anytime baseline check whose answers only choose practice focus areas, a starting level, and a fatigue-aware session length. It stores the result on-device and never claims diagnosis, weakness, recovery prediction or clinical significance.',
    sources: [
      {
        label: 'NICE NG236 — rehabilitation tailored to the person’s goals, mood and fatigue',
        url: 'https://www.nice.org.uk/guidance/ng236',
      },
      {
        label: 'VA/DoD Stroke Rehabilitation CPG 2024 — individualised, goal-directed rehabilitation',
        url: 'https://www.healthquality.va.gov/guidelines/Rehab/stroke/',
      },
    ],
  },
  {
    id: 'adaptive',
    title: 'Adaptive training level (per-domain)',
    why: 'The app gently adjusts the starting difficulty of each practice area based on how the tasks have been going and how tired you have been. The rule is simple and shown to you, so you can always see why a level moved.',
    strength: 'EXPLORATORY',
    evidenceScope:
      'An APP-TASK difficulty convenience. There is no validated evidence that a simple accuracy-based difficulty rule improves recovery outcomes; the only guideline-backed input is respecting fatigue (do less when tired).',
    limitations:
      'The adjustment is a deterministic, conservative rule (one level at a time, only after enough attempts, fatigue only holds or lowers, skipping never counts as failure) — untested for outcomes and explicitly not a clinical decision. For process-based exercises with no right/wrong answer the level is informational only.',
    appBehavior:
      'Tracks app-task accuracy, help/hints and completed attempts per practice area, and adjusts the starting level at most one step at a time. It never decides treatment, severity or recovery and never raises difficulty when you are very tired.',
    sources: [
      {
        label: 'NICE NG236 — rehabilitation adapted to the person’s mood and fatigue',
        url: 'https://www.nice.org.uk/guidance/ng236',
      },
      {
        label: 'VA/DoD Stroke Rehabilitation CPG 2024 — individualised, goal-directed rehabilitation',
        url: 'https://www.healthquality.va.gov/guidelines/Rehab/stroke/',
      },
    ],
  },
  {
    id: 'functional-practice',
    title: 'Real-life functional practice (Goal–Plan–Do–Check)',
    why: 'Strategy training that walks through Goal, Plan, Do, Check is one of the better-supported ways to help people manage everyday tasks after stroke. This app offers preset, everyday scenarios using that structure.',
    strength: 'MODERATE',
    evidenceScope:
      'STRATEGY training for everyday tasks. The positive signal comes from metacognitive strategy training studies; it is not proof of restored independence.',
    limitations:
      'Completing a practice task in the app is not the same as doing it in real life. The recorded completion/assistance are preset choices (an effort record), not a validated functional measure. No medication names, addresses or personal details appear in the tasks.',
    appBehavior:
      'Offers six preset everyday scenarios (morning routine, shopping list, appointment preparation, recipe, calendar/phone, packing) using Goal–Plan–Do–Check with preset choices only. It records structured assistance/completion enums, never a clinical independence score.',
    sources: [
      {
        label: 'Cochrane 2013 (Chung) — cognitive rehabilitation for executive dysfunction',
        url: 'https://www.cochrane.org/CD008391/STROKE_cognitive-rehabilitation-for-executive-dysfunction-in-adults-with-stroke-or-other-non-progressive-acquired-brain-damage',
      },
      {
        label: 'ACRM / Cicerone 2019 — metacognitive strategy training recommendations',
        url: 'https://www.bumc.bu.edu/neurorehabilitationlab/files/2021/04/Evidence-Based-Cognitive-Rehabilitation_Systematic-Review_2019_AuthorCopy.pdf',
      },
    ],
  },
  {
    id: 'outcome-measurement',
    title: 'Pre/post practice check (outcome measurement)',
    why: 'The app offers a short before-and-after practice check so you and your team can see how these app tasks feel over time. It compares each area separately and never produces a single score.',
    strength: 'EXPLORATORY',
    evidenceScope:
      'A PERSONALIZATION / CHANGE-TRACKING feature. Guidelines say clinical assessment should use valid, reliable and responsive tools; this app-specific check is explicitly NOT that — it is for personalization and self-tracking only.',
    limitations:
      'Changes on an app task can reflect familiarity/practice effects, day-to-day fatigue, natural recovery, other therapy, or other factors, and cannot show the app caused the change. There is deliberately no total cognitive or "recovered" score. Future clinical validation would require formal, validated instruments and independent study.',
    appBehavior:
      'Runs alternate A/B forms (never the same items twice in a row), compares pre vs post per domain only with transparent thresholds, shows training exposure, and reports functional-goal self-ratings separately. It never labels improvement/worsening clinically.',
    sources: [
      {
        label: 'NICE NG236 — use valid, reliable and responsive tools for clinical assessment',
        url: 'https://www.nice.org.uk/guidance/ng236',
      },
      {
        label: 'VA/DoD Stroke Rehabilitation CPG 2024 — research outcomes should use validated formal tests and emphasise functional outcomes',
        url: 'https://www.healthquality.va.gov/guidelines/Rehab/stroke/',
      },
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessible design',
    why: 'Larger text, fewer words, high contrast, one task per screen, voice output and no time pressure make the app easier for people with stroke-related reading, vision or thinking difficulties. Accessibility can change task performance.',
    strength: 'MODERATE',
    evidenceScope:
      'A DESIGN REQUIREMENT, not a treatment. Accessible formatting measurably improves comprehension and task performance.',
    limitations:
      'The effect of aphasia-friendly formatting is modest (one study found ~11% more knowledge). Most guidance is small-sample or design-led rather than large trials, so it is a low-risk, high-value requirement rather than a proven therapy.',
    appBehavior:
      'The app uses large touch targets, scalable type, high-contrast option, keyboard navigation, screen-reader semantics, plain language, one task per screen, optional read-aloud, and no default time pressure.',
    sources: [
      {
        label: 'Rose et al. 2003 — aphasia-friendly health information improves comprehension',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22136650',
      },
      {
        label: 'Aphasia-friendly materials (large font, white space, pictures)',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12208688',
      },
      {
        label: '2026 accessibility study — single-page + voiceover improved post-stroke performance',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12916776',
      },
    ],
  },
  {
    id: 'apple-platform',
    title: 'iPhone & iPad platform',
    why: 'iPhone and iPad are the reference devices for this app. Apple and web accessibility guidance support an installable web app with large touch targets, scalable text, VoiceOver-friendly semantics, reduced motion and offline support.',
    strength: 'EXPERT CONSENSUS',
    evidenceScope:
      'A PLATFORM and accessibility decision, not a rehabilitation treatment claim.',
    limitations:
      'Home Screen installation is manual in Safari. Web Push requires an installed web app and server-side subscription handling. Programmatic browser speech recognition is not reliable in iOS Home Screen web apps; native iOS would be needed for that capability and for App Store distribution.',
    appBehavior:
      'The app is an installable PWA designed first for iPhone/iPad, uses safe-area insets and 44px touch targets, preserves zoom and scalable text, supports reduced motion and read-aloud, provides an Add to Home Screen guide, and does not pretend unsupported web features are native capabilities.',
    sources: [
      {
        label: 'WebKit — Web Push for Web Apps on iOS and iPadOS',
        url: 'https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/',
      },
      {
        label: 'W3C — Web Content Accessibility Guidelines (WCAG) 2.2',
        url: 'https://www.w3.org/TR/WCAG22/',
      },
      {
        label: 'Apple — Accessibility for developers',
        url: 'https://developer.apple.com/accessibility/',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Local-first privacy',
    why: 'Health-related information deserves protection. The safest way to protect it in this app is to keep it on the person’s own device and not store it on a server at all.',
    strength: 'EXPERT CONSENSUS',
    evidenceScope:
      'A REGULATORY/ARCHITECTURE decision, not a clinical claim. This app is not a HIPAA-covered service.',
    limitations:
      'HIPAA compliance would require a signed Business Associate Agreement (Enterprise-only on Cloudflare) before any protected health information flows through the network. A non-HIPAA health app still falls under the FTC Health Breach Notification Rule and must avoid disease-treatment/function-restoration claims to stay in the low-risk "general wellness" lane.',
    appBehavior:
      'The app stores everything on-device (IndexedDB/localStorage), uses no server-side datastore, collects no PHI, uses synthetic/demo data only, and does NOT claim HIPAA compliance. It positions itself as an adjunct to clinician-directed rehabilitation, not a medical device or diagnosis tool.',
    sources: [
      {
        label: 'Cloudflare — HIPAA BAA is Enterprise-only and must be executed before PHI flows',
        url: 'https://www.cloudflare.com/trust-hub/compliance-resources/hipaa',
      },
      {
        label: 'FTC — Health Breach Notification Rule (applies to non-HIPAA health apps)',
        url: 'https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0',
      },
      {
        label: 'FDA — General Wellness guidance (wellness vs medical-device line)',
        url: 'https://www.hhs.gov/guidance/sites/default/files/hhs-guidance-documents/FDA/1300013_0.pdf',
      },
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency stroke warning',
    why: 'A new stroke is a medical emergency. Knowing the FAST signs and acting immediately can save lives and reduce long-term damage.',
    strength: 'EXPERT CONSENSUS',
    evidenceScope:
      'Public-health standard, not a research recommendation specific to this app.',
    limitations:
      'This is static safety information, not personalised advice. The app cannot assess whether someone is having a stroke.',
    appBehavior:
      'The app shows a persistent FAST warning and emergency guidance, and reinforces it during onboarding. It never tries to interpret symptoms.',
    sources: [
      {
        label: 'AHA/ASA — Stroke warning signs (FAST)',
        url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000536',
      },
    ],
  },
];

export function evidenceFor(id: string): EvidenceEntry | undefined {
  return EVIDENCE.find((e) => e.id === id);
}
