// Functional-practice helpers — structured-only data, no free text.
//
// The completion/assistance recorded here are preset enums. They are NOT a
// clinical independence score and must never be labelled as one.

import type {
  AssistanceLevel,
  CompletionStatus,
  FunctionalAttempt,
  FunctionalPracticeLog,
} from '../types';

export const ASSISTANCE_LEVELS: { value: AssistanceLevel; label: string }[] = [
  { value: 'independent', label: 'I did it on my own' },
  { value: 'with-prompts', label: 'I needed a prompt or reminder' },
  { value: 'with-help', label: 'I needed help from someone' },
];

export const COMPLETION_STATUSES: { value: CompletionStatus; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'partially-completed', label: 'Partly done' },
  { value: 'not-completed', label: 'Not done this time' },
];

export const ASSISTANCE_VALUES: ReadonlySet<string> = new Set(
  ASSISTANCE_LEVELS.map((l) => l.value),
);
export const COMPLETION_VALUES: ReadonlySet<string> = new Set(
  COMPLETION_STATUSES.map((s) => s.value),
);

export function isAssistanceLevel(v: string): v is AssistanceLevel {
  return ASSISTANCE_VALUES.has(v);
}

export function isCompletionStatus(v: string): v is CompletionStatus {
  return COMPLETION_VALUES.has(v);
}

export function emptyLog(): FunctionalPracticeLog {
  return { version: 1, attempts: [] };
}

/** Append one attempt. Returns a new log (never mutates the input). */
export function recordAttempt(
  log: FunctionalPracticeLog,
  attempt: FunctionalAttempt,
): FunctionalPracticeLog {
  return { ...log, attempts: [...log.attempts, attempt] };
}

export interface FunctionalSummary {
  total: number;
  completed: number;
  partiallyCompleted: number;
  notCompleted: number;
  independent: number;
  withPrompts: number;
  withHelp: number;
}

export function summarizeLog(log: FunctionalPracticeLog): FunctionalSummary {
  const s: FunctionalSummary = {
    total: log.attempts.length,
    completed: 0,
    partiallyCompleted: 0,
    notCompleted: 0,
    independent: 0,
    withPrompts: 0,
    withHelp: 0,
  };
  for (const a of log.attempts) {
    if (a.completion === 'completed') s.completed += 1;
    else if (a.completion === 'partially-completed') s.partiallyCompleted += 1;
    else if (a.completion === 'not-completed') s.notCompleted += 1;

    if (a.assistance === 'independent') s.independent += 1;
    else if (a.assistance === 'with-prompts') s.withPrompts += 1;
    else if (a.assistance === 'with-help') s.withHelp += 1;
  }
  return s;
}
