import { afterEach, describe, expect, it } from 'vitest';
import { memoryStore, setStore, type KVStore } from './storage';
import {
  BASELINE_KEY,
  PLAN_KEY,
  clearPersonalizationFallbacks,
  loadPersonalization,
  savePersonalization,
} from './personalizationStorage';
import type { BaselineResult, PersonalizedPlan } from '../types';

const baseline: BaselineResult = {
  version: 1,
  completedAt: '2026-02-01T10:00:00.000Z',
  domains: [],
  fatigue: 4,
  stoppedEarly: false,
};

const plan: PersonalizedPlan = {
  version: 1,
  createdAt: '2026-02-01T10:00:01.000Z',
  focus: [],
  sessionMinutes: 15,
  modules: ['memory'],
};

afterEach(() => {
  setStore(null);
  window.sessionStorage.clear();
});

describe('savePersonalization / loadPersonalization', () => {
  it('persists baseline and plan through the store and reads them back', async () => {
    setStore(memoryStore());
    expect(await savePersonalization(baseline, plan)).toBe(true);

    const loaded = await loadPersonalization();
    expect(loaded.persistent).toBe(true);
    expect(loaded.baseline).toEqual(baseline);
    expect(loaded.plan).toEqual(plan);
  });

  it('returns nulls when nothing is stored', async () => {
    setStore(memoryStore());
    const loaded = await loadPersonalization();
    expect(loaded.persistent).toBe(true);
    expect(loaded.baseline).toBeNull();
    expect(loaded.plan).toBeNull();
  });

  it('falls back to session storage when the store throws, surviving refresh', async () => {
    const throwing: KVStore = {
      get: async () => {
        throw new Error('storage unavailable');
      },
      set: async () => {
        throw new Error('storage unavailable');
      },
      remove: async () => {},
      clear: async () => {},
    };
    setStore(throwing);

    expect(await savePersonalization(baseline, plan)).toBe(false);

    // A throwing store's get also fails, so load must fall back to session.
    const loaded = await loadPersonalization();
    expect(loaded.persistent).toBe(false);
    expect(loaded.baseline).toEqual(baseline);
    expect(loaded.plan).toEqual(plan);
  });
});

describe('clearPersonalizationFallbacks', () => {
  it('removes the session-storage fallback keys', async () => {
    setStore(memoryStore());
    const throwing: KVStore = {
      get: async () => {
        throw new Error('unavailable');
      },
      set: async () => {
        throw new Error('unavailable');
      },
      remove: async () => {},
      clear: async () => {},
    };
    setStore(throwing);
    await savePersonalization(baseline, plan);

    // Sanity: fallbacks exist.
    expect(window.sessionStorage.getItem(`src-session:${BASELINE_KEY}`)).not.toBeNull();

    clearPersonalizationFallbacks();
    expect(window.sessionStorage.getItem(`src-session:${BASELINE_KEY}`)).toBeNull();
    expect(window.sessionStorage.getItem(`src-session:${PLAN_KEY}`)).toBeNull();
  });
});
