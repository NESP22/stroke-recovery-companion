import { describe, expect, it } from 'vitest';
import { createPersonalizedPlan } from './personalization';
import {
  DEFAULT_PROFILE,
  type BaselineDomain,
  type BaselineDomainResult,
  type BaselineResult,
  type ModuleId,
} from '../types';

const CREATED_AT = '2026-01-01T00:00:00.000Z';

function domainResult(
  domain: BaselineDomain,
  correct: number | null,
  total: number | null,
  options: { completed?: boolean; skipped?: boolean } = {},
): BaselineDomainResult {
  return {
    domain,
    correct,
    total,
    completed: options.completed ?? true,
    skipped: options.skipped ?? false,
  };
}

function baseline(
  domains: BaselineDomainResult[],
  overrides: Partial<Pick<BaselineResult, 'fatigue' | 'stoppedEarly'>> = {},
): BaselineResult {
  return {
    version: 1,
    completedAt: CREATED_AT,
    domains,
    fatigue: overrides.fatigue ?? null,
    stoppedEarly: overrides.stoppedEarly ?? false,
  };
}

function profile(overrides: {
  goals?: string[];
  sessionMinutes?: number;
  clinicianConfigured?: boolean;
} = {}) {
  return {
    goals: overrides.goals ?? [],
    sessionMinutes: overrides.sessionMinutes ?? 30,
    clinicianConfigured: overrides.clinicianConfigured ?? false,
  } satisfies Pick<
    typeof DEFAULT_PROFILE,
    'goals' | 'sessionMinutes' | 'clinicianConfigured'
  >;
}

describe('createPersonalizedPlan', () => {
  it('selects at most three focus domains and prioritizes lower task ratios', () => {
    const plan = createPersonalizedPlan(
      baseline([
        domainResult('memory', 2, 10),
        domainResult('attention', 3, 10),
        domainResult('executive', 1, 10),
        domainResult('language', 5, 10),
      ]),
      profile(),
      CREATED_AT,
    );

    expect(plan.focus).toHaveLength(3);
    expect(plan.focus.map((item) => item.domain)).toEqual([
      'executive',
      'memory',
      'attention',
    ]);
  });

  it('ignores skipped, incomplete, null-score and zero-total results', () => {
    const plan = createPersonalizedPlan(
      baseline([
        domainResult('memory', 0, 10, { skipped: true }),
        domainResult('attention', 0, 10, { completed: false }),
        domainResult('language', null, null),
        domainResult('visualScanning', 0, 0),
        domainResult('executive', 4, 10),
      ]),
      profile(),
      CREATED_AT,
    );

    expect(plan.focus.map((item) => item.domain)).toEqual(['executive']);
    expect(plan.focus[0].difficulty).toBe('gentle');
  });

  it('shortens the session when fatigue is higher', () => {
    const domains = [domainResult('memory', 5, 10)];
    expect(
      createPersonalizedPlan(
        baseline(domains, { fatigue: 7 }),
        profile({ sessionMinutes: 30 }),
        CREATED_AT,
      ).sessionMinutes,
    ).toBe(10);
    expect(
      createPersonalizedPlan(
        baseline(domains, { fatigue: 5 }),
        profile({ sessionMinutes: 30 }),
        CREATED_AT,
      ).sessionMinutes,
    ).toBe(15);
    expect(
      createPersonalizedPlan(
        baseline(domains, { fatigue: 3 }),
        profile({ sessionMinutes: 30 }),
        CREATED_AT,
      ).sessionMinutes,
    ).toBe(30);
  });
  it('enforces the session policy cap', () => {
    const plan = createPersonalizedPlan(
      baseline([domainResult('memory', 5, 10)]),
      profile({ sessionMinutes: 60, clinicianConfigured: false }),
      CREATED_AT,
    );
    expect(plan.sessionMinutes).toBe(30);
  });

  it('uses selected goals to influence otherwise equal task ratios', () => {
    const plan = createPersonalizedPlan(
      baseline([
        domainResult('memory', 5, 10),
        domainResult('attention', 5, 10),
        domainResult('executive', 5, 10),
      ]),
      profile({ goals: ['meds'] }),
      CREATED_AT,
    );

    expect(plan.focus[0].domain).toBe('memory');
    expect(plan.focus[0].reason).toBe(
      'Matches a practice goal you selected.',
    );
  });

  it('falls back to goal domains with standard starting difficulty', () => {
    const plan = createPersonalizedPlan(
      baseline([]),
      profile({ goals: ['find-words', 'meds', 'plan-day', 'dates'] }),
      CREATED_AT,
    );

    expect(plan.focus.map((item) => item.domain)).toEqual([
      'memory',
      'language',
      'executive',
    ]);
    expect(plan.focus.every((item) => item.difficulty === 'standard')).toBe(true);
  });

  it('returns valid module ids in the same order as focus mappings', () => {
    const plan = createPersonalizedPlan(
      baseline([
        domainResult('memory', 2, 10),
        domainResult('language', 3, 10),
        domainResult('visualScanning', 4, 10),
      ]),
      profile(),
      CREATED_AT,
    );
    const valid: ModuleId[] = [
      'orientation',
      'memory',
      'attention',
      'executive',
      'aphasia',
      'neglect',
      'adl',
      'mood',
      'caregiver',
    ];
    expect(plan.modules.every((module) => valid.includes(module))).toBe(true);
    expect(plan.modules).toEqual(['memory', 'aphasia', 'neglect']);
    expect(plan.focus.map((item) => item.domain)).toEqual([
      'memory',
      'language',
      'visualScanning',
    ]);
  });

  it('is deterministic when the createdAt value is fixed', () => {
    const input = baseline([
      domainResult('memory', 2, 10),
      domainResult('attention', 3, 10),
    ]);
    const configured = profile({ goals: ['dates'] });
    const first = createPersonalizedPlan(input, configured, CREATED_AT);
    const second = createPersonalizedPlan(input, configured, CREATED_AT);
    expect(first).toEqual(second);
  });
});
