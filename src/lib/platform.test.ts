import { describe, expect, it } from 'vitest';
import { isAppleTouchDevice, isStandaloneMode } from './platform';

describe('Apple platform helpers', () => {
  it('recognises iPhone and iPad user agents', () => {
    expect(isAppleTouchDevice({ userAgent: 'Mozilla/5.0 (iPhone)', platform: 'iPhone', maxTouchPoints: 5 })).toBe(true);
    expect(isAppleTouchDevice({ userAgent: 'Mozilla/5.0 (iPad)', platform: 'iPad', maxTouchPoints: 5 })).toBe(true);
  });

  it('recognises iPad desktop-mode Safari signals', () => {
    expect(isAppleTouchDevice({ userAgent: 'Mozilla/5.0 Macintosh', platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
  });

  it('does not classify a normal Mac as iPad', () => {
    expect(isAppleTouchDevice({ userAgent: 'Mozilla/5.0 Macintosh', platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false);
  });

  it('accepts either standalone signal', () => {
    expect(isStandaloneMode(true, false)).toBe(true);
    expect(isStandaloneMode(false, true)).toBe(true);
    expect(isStandaloneMode(false, false)).toBe(false);
  });
});
