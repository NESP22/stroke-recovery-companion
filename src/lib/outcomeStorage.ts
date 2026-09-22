// Local persistence for outcome assessments, adaptive training state and
// functional-practice logs. Mirrors personalizationStorage.ts: all data stays
// on-device (getStore), with a sessionStorage fallback for refresh-safe use
// when persistent storage is unavailable.
//
// Clear All Data (Settings) calls clearOutcomeFallbacks() plus getStore().clear(),
// which together remove every Phase 3–4 record.

import { getStore } from './storage';
import { applyObservation, emptyAdaptiveState } from './adaptiveEngine';
import type {
  AdaptiveObservation,
  AdaptiveStateMap,
  DomainAdaptiveState,
  FunctionalPracticeLog,
  OutcomeAssessment,
  TrainableModuleId,
} from '../types';

export const ASSESSMENTS_KEY = 'outcome.assessments.v1';
export const ADAPTIVE_KEY = 'adaptive.v1';
export const FUNCTIONAL_KEY = 'functional.log.v1';

const SESSION_PREFIX = 'src-session:';

function sessionKey(key: string): string {
  return SESSION_PREFIX + key;
}

function safeSetSession(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(sessionKey(key), value);
      return true;
    }
  } catch {
    // Browser storage can be unavailable; caller keeps data in memory.
  }
  return false;
}

function safeGetSession(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(sessionKey(key));
    }
  } catch {
    // Browser storage can be unavailable.
  }
  return null;
}

function parseStored<T>(raw: string | null | undefined): T | null {
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Assessments (pre/post)
// ---------------------------------------------------------------------------

export async function saveAssessment(
  assessment: OutcomeAssessment,
): Promise<boolean> {
  try {
    const store = getStore();
    const existing = (await store.get<OutcomeAssessment[]>(ASSESSMENTS_KEY)) ?? [];
    await store.set(ASSESSMENTS_KEY, [...existing, assessment]);
    return true;
  } catch {
    // Refresh-safe fallback: keep the newest assessment in session storage.
    const prior = parseStored<OutcomeAssessment[]>(
      safeGetSession(ASSESSMENTS_KEY),
    );
    safeSetSession(
      ASSESSMENTS_KEY,
      JSON.stringify([...(prior ?? []), assessment]),
    );
    return false;
  }
}

export async function loadAssessments(): Promise<{
  assessments: OutcomeAssessment[];
  persistent: boolean;
}> {
  try {
    const store = getStore();
    const assessments =
      (await store.get<OutcomeAssessment[]>(ASSESSMENTS_KEY)) ?? [];
    return { assessments, persistent: true };
  } catch {
    return {
      assessments:
        parseStored<OutcomeAssessment[]>(safeGetSession(ASSESSMENTS_KEY)) ?? [],
      persistent: false,
    };
  }
}

// ---------------------------------------------------------------------------
// Adaptive training state
// ---------------------------------------------------------------------------

export function emptyAdaptiveStates(): AdaptiveStateMap {
  return {
    memory: emptyAdaptiveState('memory'),
    attention: emptyAdaptiveState('attention'),
    executive: emptyAdaptiveState('executive'),
    aphasia: emptyAdaptiveState('aphasia'),
    neglect: emptyAdaptiveState('neglect'),
  };
}

export async function loadAdaptiveStates(): Promise<AdaptiveStateMap> {
  try {
    const store = getStore();
    const states = await store.get<AdaptiveStateMap>(ADAPTIVE_KEY);
    if (states) return states;
  } catch {
    // Fall through to the session fallback.
  }
  const fallback = parseStored<AdaptiveStateMap>(safeGetSession(ADAPTIVE_KEY));
  return fallback ?? emptyAdaptiveStates();
}

async function saveAdaptiveStates(states: AdaptiveStateMap): Promise<void> {
  try {
    await getStore().set(ADAPTIVE_KEY, states);
  } catch {
    safeSetSession(ADAPTIVE_KEY, JSON.stringify(states));
  }
}

/**
 * Record one observation for a domain and recompute its level. Returns the
 * updated full state map. Skips never count toward accuracy (see engine).
 */
export async function recordAdaptiveAttempt(
  domain: TrainableModuleId,
  observation: Omit<AdaptiveObservation, 'at'>,
  fatigue: number | null,
  updatedAt: string = new Date().toISOString(),
): Promise<AdaptiveStateMap> {
  const states = await loadAdaptiveStates();
  const current = states[domain] ?? emptyAdaptiveState(domain);
  const next: DomainAdaptiveState = applyObservation(
    current,
    observation,
    fatigue,
    updatedAt,
  );
  const merged: AdaptiveStateMap = { ...states, [domain]: next };
  await saveAdaptiveStates(merged);
  return merged;
}

// ---------------------------------------------------------------------------
// Functional practice log
// ---------------------------------------------------------------------------

export async function loadFunctionalLog(): Promise<FunctionalPracticeLog> {
  try {
    const store = getStore();
    const log = await store.get<FunctionalPracticeLog>(FUNCTIONAL_KEY);
    if (log) return log;
  } catch {
    // Fall through to the session fallback.
  }
  return (
    parseStored<FunctionalPracticeLog>(safeGetSession(FUNCTIONAL_KEY)) ?? {
      version: 1,
      attempts: [],
    }
  );
}

export async function saveFunctionalLog(
  log: FunctionalPracticeLog,
): Promise<boolean> {
  try {
    await getStore().set(FUNCTIONAL_KEY, log);
    return true;
  } catch {
    safeSetSession(FUNCTIONAL_KEY, JSON.stringify(log));
    return false;
  }
}

// ---------------------------------------------------------------------------
// Clear All Data support
// ---------------------------------------------------------------------------

/** Remove every Phase 3–4 session-storage fallback key (Clear All Data). */
export function clearOutcomeFallbacks(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      for (const key of [ASSESSMENTS_KEY, ADAPTIVE_KEY, FUNCTIONAL_KEY]) {
        window.sessionStorage.removeItem(sessionKey(key));
      }
    }
  } catch {
    // Browser storage can be unavailable.
  }
}
