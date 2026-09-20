import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE } from '../types';
import {
  DEFAULT_SESSION_MINUTES,
  SESSION_CAP_MINUTES,
  SESSION_CAP_WITH_OVERRIDE_MINUTES,
  allowedSessionOptions,
  clampSessionMinutes,
} from './sessionPolicy';

describe('session policy', () => {
  it('defaults short and caps at 30 minutes without a clinician/carer override', () => {
    expect(DEFAULT_SESSION_MINUTES).toBe(15);
    expect(SESSION_CAP_MINUTES).toBe(30);
    expect(allowedSessionOptions(false)).toEqual([10, 15, 20, 30]);
    expect(allowedSessionOptions(false)).not.toContain(45);
    expect(allowedSessionOptions(false)).not.toContain(60);
  });

  it('extends the ceiling only with a clinician/carer-configured override', () => {
    expect(allowedSessionOptions(true)).toEqual([10, 15, 20, 30, 45, 60]);
    expect(SESSION_CAP_WITH_OVERRIDE_MINUTES).toBe(60);
  });

  it('clamps requested lengths into the allowed range', () => {
    expect(clampSessionMinutes(45, false)).toBe(30);
    expect(clampSessionMinutes(45, true)).toBe(45);
    expect(clampSessionMinutes(99, false)).toBe(30);
    expect(clampSessionMinutes(99, true)).toBe(60);
  });

  it('keeps the profile default consistent with the policy default', () => {
    expect(DEFAULT_PROFILE.sessionMinutes).toBe(DEFAULT_SESSION_MINUTES);
  });
});
