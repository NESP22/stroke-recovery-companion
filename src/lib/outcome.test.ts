import { describe, expect, it } from 'vitest';
import {
  COMPARISON_DELTA,
  POST_SUGGEST_DAYS,
  POST_SUGGEST_SESSIONS,
  buildOutcomeAssessment,
  compareDomains,
  compareGoalRatings,
  daysBetween,
  isPostSuggested,
  nextForm,
  trainingExposure,
  type DomainComparison,
} from './outcome';
import type {
  BaselineResult,
  OutcomeAssessment,
  SessionRecord,
} from '../types';

const PRE_AT = '2026-01-01T10:00:00.000Z';
const POST_AT = '2026-01-15T10:00:00.000Z';

function baseline(fatigue: number | null = null): BaselineResult {
  return {
    version: 1,
    completedAt: PRE_AT,
    domains: [
      { domain: 'orientation', completed: true, correct: 2, total: 3, skipped: false },
      { domain: 'attention', completed: true, correct: 1, total: 4, skipped: false },
      { domain: 'memory', completed: true, correct: 6, total: 6, skipped: false },
      { domain: 'language', completed: true, correct: 3, total: 3, skipped: false },
      { domain: 'visualScanning', completed: true, correct: 1, total: 2, skipped: false },
      { domain: 'executive', completed: true, correct: 0, total: 3, skipped: false },
      { domain: 'fatigueTolerance', completed: fatigue !== null, correct: null, total: null, skipped: false },
    ],
    fatigue,
    stoppedEarly: false,
  };
}

function assessment(
  kind: 'pre' | 'post',
  form: 'A' | 'B',
  opts: {
    completedAt?: string;
    domains?: BaselineResult['domains'];
    goalRatings?: OutcomeAssessment['functionalGoalRatings'];
  } = {},
): OutcomeAssessment {
  return buildOutcomeAssessment({
    kind,
    form,
    id: `${kind}-${form}`,
    completedAt: opts.completedAt ?? (kind === 'pre' ? PRE_AT : POST_AT),
    baseline: {
      ...baseline(),
      completedAt: opts.completedAt ?? PRE_AT,
      domains: opts.domains ?? baseline().domains,
    },
    hints: {},
    goalRatings: opts.goalRatings ?? [],
  });
}

describe('nextForm', () => {
  it('uses Form A for the first ever check', () => {
    expect(nextForm([])).toBe('A');
  });

  it('alternates from the immediately prior assessment', () => {
    expect(nextForm([assessment('pre', 'A')])).toBe('B');
    expect(nextForm([assessment('pre', 'A'), assessment('post', 'B')])).toBe('A');
  });

  it('never repeats the prior form twice in a row', () => {
    const forms: string[] = [];
    let prior: OutcomeAssessment[] = [];
    for (let i = 0; i < 6; i++) {
      const form = nextForm(prior);
      forms.push(form);
      prior = [
        ...prior,
        assessment(i % 2 === 0 ? 'pre' : 'post', form, {
          completedAt: new Date(2026, 0, i + 1).toISOString(),
        }),
      ];
    }
    expect(forms).toEqual(['A', 'B', 'A', 'B', 'A', 'B']);
    for (let i = 1; i < forms.length; i++) {
      expect(forms[i]).not.toBe(forms[i - 1]);
    }
  });
});

describe('compareDomains', () => {
  it('labels higher/about the same/lower using the documented threshold', () => {
    const pre = assessment('pre', 'A');
    // post: orientation 2/3 -> 3/3 (up), attention 1/4 -> 2/4 (up), memory 6/6 -> 6/6 (same),
    // language 3/3 -> 3/3 (same), visualScanning 1/2 -> 2/2 (up), executive 0/3 -> 0/3 (same)
    const post = assessment('post', 'B', {
      domains: [
        { domain: 'orientation', completed: true, correct: 3, total: 3, skipped: false },
        { domain: 'attention', completed: true, correct: 2, total: 4, skipped: false },
        { domain: 'memory', completed: true, correct: 6, total: 6, skipped: false },
        { domain: 'language', completed: true, correct: 3, total: 3, skipped: false },
        { domain: 'visualScanning', completed: true, correct: 2, total: 2, skipped: false },
        { domain: 'executive', completed: true, correct: 0, total: 3, skipped: false },
        { domain: 'fatigueTolerance', completed: false, correct: null, total: null, skipped: false },
      ],
    });

    const byDomain = new Map(compareDomains(pre, post).map((c) => [c.domain, c]));
    expect(byDomain.get('orientation')!.label).toBe('higher on this app task');
    expect(byDomain.get('attention')!.label).toBe('higher on this app task');
    expect(byDomain.get('memory')!.label).toBe('about the same on this app task');
    expect(byDomain.get('visualScanning')!.label).toBe('higher on this app task');
    expect(byDomain.get('executive')!.label).toBe('about the same on this app task');
  });

  it('labels lower when the post ratio drops past the threshold', () => {
    const pre = assessment('pre', 'A');
    const post = assessment('post', 'B', {
      domains: [
        { domain: 'orientation', completed: true, correct: 0, total: 3, skipped: false },
        { domain: 'attention', completed: true, correct: 1, total: 4, skipped: false },
        { domain: 'memory', completed: true, correct: 6, total: 6, skipped: false },
        { domain: 'language', completed: true, correct: 3, total: 3, skipped: false },
        { domain: 'visualScanning', completed: true, correct: 1, total: 2, skipped: false },
        { domain: 'executive', completed: true, correct: 0, total: 3, skipped: false },
        { domain: 'fatigueTolerance', completed: false, correct: null, total: null, skipped: false },
      ],
    });
    const byDomain = new Map(compareDomains(pre, post).map((c) => [c.domain, c]));
    expect(byDomain.get('orientation')!.label).toBe('lower on this app task');
  });

  it('skips domains not completed in both checks', () => {
    const pre = assessment('pre', 'A');
    const post = assessment('post', 'B', {
      domains: [
        { domain: 'orientation', completed: false, correct: null, total: null, skipped: true },
        { domain: 'attention', completed: true, correct: 1, total: 4, skipped: false },
        { domain: 'memory', completed: true, correct: 6, total: 6, skipped: false },
        { domain: 'language', completed: true, correct: 3, total: 3, skipped: false },
        { domain: 'visualScanning', completed: true, correct: 1, total: 2, skipped: false },
        { domain: 'executive', completed: true, correct: 0, total: 3, skipped: false },
        { domain: 'fatigueTolerance', completed: false, correct: null, total: null, skipped: false },
      ],
    });
    const domains = compareDomains(pre, post).map((c) => c.domain);
    expect(domains).not.toContain('orientation');
  });

  it('never computes a total/aggregate score (no-total-score invariant)', () => {
    const result = compareDomains(assessment('pre', 'A'), assessment('post', 'B'));
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    for (const c of result as DomainComparison[]) {
      expect(Object.keys(c).sort()).toEqual(
        ['after', 'before', 'domain', 'label'].sort(),
      );
      expect(c).not.toHaveProperty('score');
      expect(c).not.toHaveProperty('total');
      expect(c).not.toHaveProperty('percent');
    }
  });

  it('uses the documented comparison delta', () => {
    expect(COMPARISON_DELTA).toBe(0.15);
  });
});

describe('compareGoalRatings', () => {
  it('reports raw before/after and delta, matching only shared goals', () => {
    const pre = assessment('pre', 'A', {
      goalRatings: [
        { goalId: 'meds', rating: 2 },
        { goalId: 'dress', rating: 3 },
      ],
    });
    const post = assessment('post', 'B', {
      goalRatings: [
        { goalId: 'meds', rating: 4 },
        { goalId: 'read', rating: 5 },
      ],
    });
    const changes = compareGoalRatings(pre, post);
    expect(changes).toEqual([{ goalId: 'meds', before: 2, after: 4, delta: 2 }]);
  });
});

describe('post-check suggestion & training exposure', () => {
  it('suggests a post check at 10 sessions OR 14 days', () => {
    expect(isPostSuggested(10, 0)).toBe(true);
    expect(isPostSuggested(9, 14)).toBe(true);
    expect(isPostSuggested(9, 13)).toBe(false);
    expect(POST_SUGGEST_SESSIONS).toBe(10);
    expect(POST_SUGGEST_DAYS).toBe(14);
  });

  it('counts whole days between timestamps', () => {
    expect(daysBetween(PRE_AT, POST_AT)).toBe(14);
  });

  it('summarises training exposure without identifiers', () => {
    const records: SessionRecord[] = [
      {
        id: 'a',
        dateISO: '2026-01-02',
        minutes: 15,
        fatigueBefore: 3,
        fatigueAfter: 5,
        modulesCompleted: ['memory', 'attention'],
        checklistCompleted: 0,
        mood: null,
      },
      {
        id: 'b',
        dateISO: '2026-01-03',
        minutes: 20,
        fatigueBefore: 4,
        fatigueAfter: 6,
        modulesCompleted: ['memory'],
        checklistCompleted: 0,
        mood: null,
      },
    ];
    const exposure = trainingExposure(records);
    expect(exposure.sessions).toBe(2);
    expect(exposure.minutes).toBe(35);
    expect(exposure.modules).toEqual(['attention', 'memory']);
    expect(exposure.moduleCounts.memory).toBe(2);
    expect(exposure.moduleCounts.attention).toBe(1);
  });
});
