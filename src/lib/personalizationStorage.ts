import { getStore } from './storage';
import type { BaselineResult, PersonalizedPlan } from '../types';

export const BASELINE_KEY = 'baseline.latest.v1';
export const PLAN_KEY = 'personalized.plan.v1';

const SESSION_PREFIX = 'src-session:';

function sessionKey(key: string): string {
  return SESSION_PREFIX + key;
}

function safeSetSession(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
      return true;
    }
  } catch {
    // Browser storage can be unavailable; the caller keeps the data in memory.
  }
  return false;
}

function safeGetSession(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(key);
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

export async function savePersonalization(
  baseline: BaselineResult,
  plan: PersonalizedPlan,
): Promise<boolean> {
  try {
    const store = getStore();
    await store.set(BASELINE_KEY, baseline);
    await store.set(PLAN_KEY, plan);
    clearPersonalizationFallbacks();
    return true;
  } catch {
    safeSetSession(sessionKey(BASELINE_KEY), JSON.stringify(baseline));
    safeSetSession(sessionKey(PLAN_KEY), JSON.stringify(plan));
    return false;
  }
}

export async function loadPersonalization(): Promise<{
  baseline: BaselineResult | null;
  plan: PersonalizedPlan | null;
  persistent: boolean;
}> {
  let baseline: BaselineResult | null = null;
  let plan: PersonalizedPlan | null = null;
  let storeFailed = false;

  try {
    const store = getStore();
    const storedBaseline = await store.get<BaselineResult>(BASELINE_KEY);
    const storedPlan = await store.get<PersonalizedPlan>(PLAN_KEY);
    baseline = storedBaseline ?? null;
    plan = storedPlan ?? null;
  } catch {
    // The primary store is unavailable. Fall back to the refresh-safe
    // session fallback below (persistent=false).
    storeFailed = true;
  }

  // A functioning store that simply has no saved data still counts as
  // persistent: it returned nulls rather than throwing. persistent=false is
  // reserved for when the primary store threw and the session fallback was
  // used instead.
  if (!storeFailed) {
    return { baseline, plan, persistent: true };
  }

  return {
    baseline: parseStored<BaselineResult>(
      safeGetSession(sessionKey(BASELINE_KEY)),
    ),
    plan: parseStored<PersonalizedPlan>(
      safeGetSession(sessionKey(PLAN_KEY)),
    ),
    persistent: false,
  };
}

export function clearPersonalizationFallbacks(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(sessionKey(BASELINE_KEY));
      window.sessionStorage.removeItem(sessionKey(PLAN_KEY));
    }
  } catch {
    // Browser storage can be unavailable.
  }
}
