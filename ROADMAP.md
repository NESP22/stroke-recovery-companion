# Roadmap

Post-MVP items. These are intentionally out of scope for the initial,
local-first public deployment so that no personal health data is handled
server-side until each item has been designed and reviewed.

## 1. Clinician portal

A read-only (or minimally interactive) view for a clinician/carer to review
adherence and goal progress, with explicit patient consent and export controls.

## 2. Validated outcome measures & licensing review

Integrate licensed, validated instruments (e.g. PHQ-9, FSS, specific aphasia /
cognitive measures) only after a licensing review. The MVP deliberately uses
simple unvalidated self-report scales and does not interpret them clinically.

## 3. FHIR import

Import relevant data (e.g. care plans, medications, appointments) from
FHIR-compatible systems, with user-controlled, local-first handling and no
server persistence.

## 4. Optional end-to-end encrypted sync

Allow users to sync their data across their own devices under end-to-end
encryption, so the service provider cannot read it. Requires a threat model,
key-management design and a security review. **Disabled in the MVP.**

## 5. Multilingual support

Translate the UI and content; add localised emergency numbers and plain-language
adaptation, with native-speaker review.

## 6. Usability study

A structured usability study with stroke survivors and caregivers (screen
readers, motor/speech constraints, cognitive load), with ethics approval.

## 7. IRB / clinical validation

A prospective study (with institutional review board / research ethics
approval) to evaluate feasibility and any effect on function or adherence,
before any efficacy claims are made.

---

Each item becomes a GitHub issue when work begins; see the repository issue
tracker.
