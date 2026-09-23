import { afterEach, describe, expect, it } from 'vitest';
import { memoryStore, setStore, type KVStore } from './storage';
import {
  ASSESSMENTS_KEY,
  ADAPTIVE_KEY,
  FUNCTIONAL_KEY,
  clearOutcomeFallbacks,
  loadAdaptiveStates,
  loadAssessments,
  loadFunctionalLog,
  recordAdaptiveAttempt,
  saveAssessment,
  saveFunctionalLog,
} from './outcomeStorage';
import type {
  AdaptiveObservation,
  FunctionalPracticeLog,
  OutcomeAssessment,
} from '../types';

const assessment: OutcomeAssessment = {
  version: 1,
  id: 'a1',
  kind: 'pre',
  form: 'A',
  completedAt: '2026-02-01T10:00:00.000Z',
  domains: [],
  functionalGoalRatings: [],
  fatigue: 4,
  stoppedEarly: false,
};

const log: FunctionalPracticeLog = {
  version: 1,
  attempts: [
    {
      taskId: 'morning-routine',
      completedAt: '2026-02-01T10:00:00.000Z',
      assistance: 'independent',
      completion: 'completed',
    },
  ],
};

afterEach(() => {
  setStore(null);
  window.sessionStorage.clear();
});

describe('saveAssessment / loadAssessments', () => {
  it('appends assessments and reads them back in order', async () => {
    setStore(memoryStore());
    await saveAssessment(assessment);
    const second: OutcomeAssessment = {
      ...assessment,
      id: 'a2',
      kind: 'post',
      form: 'B',
    };
    await saveAssessment(second);

    const { assessments, persistent } = await loadAssessments();
    expect(persistent).toBe(true);
    expect(assessments).toHaveLength(2);
    expect(assessments[1].form).toBe('B');
  });

  it('returns an empty list with nothing stored', async () => {
    setStore(memoryStore());
    const { assessments, persistent } = await loadAssessments();
    expect(persistent).toBe(true);
    expect(assessments).toEqual([]);
  });

  it('falls back to session storage when the store throws (refresh-safe)', async () => {
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
    expect(await saveAssessment(assessment)).toBe(false);
    const { assessments, persistent } = await loadAssessments();
    expect(persistent).toBe(false);
    expect(assessments).toHaveLength(1);
    expect(assessments[0].id).toBe('a1');
  });
});

describe('adaptive state', () => {
  it('records attempts and persists state per domain', async () => {
    setStore(memoryStore());
    const states = await recordAdaptiveAttempt(
      'attention',
      { correct: true, assisted: false, skipped: false },
      null,
      '2026-02-01T10:00:00.000Z',
    );
    expect(states.attention.observations).toBe(1);
    expect(states.attention.skipCount).toBe(0);

    const loaded = await loadAdaptiveStates();
    expect(loaded.attention.observations).toBe(1);
  });

  it('never counts a skipped attempt toward observations', async () => {
    setStore(memoryStore());
    const states = await recordAdaptiveAttempt(
      'memory',
      { correct: false, assisted: false, skipped: true },
      null,
      '2026-02-01T10:00:00.000Z',
    );
    expect(states.memory.observations).toBe(0);
    expect(states.memory.skipCount).toBe(1);
    expect(states.memory.level).toBe('standard');
  });

  it('returns a full default map when nothing is stored', async () => {
    setStore(memoryStore());
    const states = await loadAdaptiveStates();
    expect(Object.keys(states).sort()).toEqual(
      ['aphasia', 'attention', 'executive', 'memory', 'neglect'].sort(),
    );
  });
});

describe('functional log', () => {
  it('round-trips the log', async () => {
    setStore(memoryStore());
    await saveFunctionalLog(log);
    const loaded = await loadFunctionalLog();
    expect(loaded).toEqual(log);
  });

  it('returns an empty log with nothing stored', async () => {
    setStore(memoryStore());
    const loaded = await loadFunctionalLog();
    expect(loaded).toEqual({ version: 1, attempts: [] });
  });
});

describe('clearOutcomeFallbacks', () => {
  it('removes all Phase 3–4 session-storage fallback keys', async () => {
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
    await saveAssessment(assessment);
    await saveFunctionalLog(log);
    await recordAdaptiveAttempt(
      'attention',
      { correct: true, assisted: false, skipped: false },
      null,
    );

    expect(window.sessionStorage.getItem(`src-session:${ASSESSMENTS_KEY}`)).not.toBeNull();
    expect(window.sessionStorage.getItem(`src-session:${FUNCTIONAL_KEY}`)).not.toBeNull();
    expect(window.sessionStorage.getItem(`src-session:${ADAPTIVE_KEY}`)).not.toBeNull();

    clearOutcomeFallbacks();

    expect(window.sessionStorage.getItem(`src-session:${ASSESSMENTS_KEY}`)).toBeNull();
    expect(window.sessionStorage.getItem(`src-session:${FUNCTIONAL_KEY}`)).toBeNull();
    expect(window.sessionStorage.getItem(`src-session:${ADAPTIVE_KEY}`)).toBeNull();
  });
});

// Ensure the observation shape exercised above is the shared one.
const _typecheck: Omit<AdaptiveObservation, 'at'> = {
  correct: true,
  assisted: false,
  skipped: false,
};
void _typecheck;
