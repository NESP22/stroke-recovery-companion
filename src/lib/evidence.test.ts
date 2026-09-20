import { describe, expect, it } from 'vitest';
import { EVIDENCE, evidenceFor } from './evidence';
import { MODULES } from './modules';

describe('evidence registry', () => {
  it('has an entry for every practice module', () => {
    for (const m of MODULES) {
      expect(evidenceFor(m.id)).toBeDefined();
    }
  });

  it('has the cross-cutting entries', () => {
    for (const id of ['session-policy', 'accessibility', 'privacy', 'emergency']) {
      expect(evidenceFor(id)).toBeDefined();
    }
  });

  it('has unique ids', () => {
    expect(new Set(EVIDENCE.map((e) => e.id)).size).toBe(EVIDENCE.length);
  });

  it('every entry carries plain-language prose, a scope, limitations and sources', () => {
    for (const e of EVIDENCE) {
      expect(e.why.trim().length).toBeGreaterThan(0);
      expect(e.evidenceScope.trim().length).toBeGreaterThan(0);
      expect(e.limitations.trim().length).toBeGreaterThan(0);
      expect(e.appBehavior.trim().length).toBeGreaterThan(0);
      expect(e.sources.length).toBeGreaterThan(0);
      for (const s of e.sources) {
        expect(s.label.trim().length).toBeGreaterThan(0);
        expect(s.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('labels the impairment-only drills as impairment-level (no ADL overclaim)', () => {
    // The drill-based features are exactly where an overclaim is most likely.
    // Their scope must flag that the evidence is impairment-level / trained-item
    // only, never implying proven real-world independence.
    const drillIds = ['memory', 'attention', 'neglect', 'aphasia'];
    for (const id of drillIds) {
      const scope = evidenceFor(id)!.evidenceScope.toLowerCase();
      expect(scope).toMatch(/impairment|trained|unproven|transfer|generalisation|generalization/);
    }
  });
});
