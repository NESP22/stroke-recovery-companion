import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { memoryStore, setStore } from '../lib/storage';
import { saveAssessment } from '../lib/outcomeStorage';
import type { OutcomeAssessment } from '../types';
import OutcomeReport from './OutcomeReport';

afterEach(() => {
  setStore(null);
  window.sessionStorage.clear();
});

function makeAssessment(
  kind: 'pre' | 'post',
  form: 'A' | 'B',
  completedAt: string,
): OutcomeAssessment {
  return {
    version: 1,
    id: `${kind}-${form}`,
    kind,
    form,
    completedAt,
    domains: [
      { domain: 'orientation', correct: kind === 'pre' ? 1 : 3, total: 3, hints: 0, skipped: false },
      { domain: 'attention', correct: 1, total: 4, hints: 0, skipped: false },
      { domain: 'memory', correct: 6, total: 6, hints: 0, skipped: false },
      { domain: 'language', correct: 3, total: 3, hints: 0, skipped: false },
      { domain: 'visualScanning', correct: kind === 'pre' ? 1 : 2, total: 2, hints: 0, skipped: false },
      { domain: 'executive', correct: 0, total: 3, hints: 0, skipped: false },
    ],
    functionalGoalRatings: [{ goalId: 'meds', rating: kind === 'pre' ? 2 : 4 }],
    fatigue: kind === 'pre' ? 5 : 4,
    stoppedEarly: false,
  };
}

function renderReport() {
  return render(
    <MemoryRouter initialEntries={['/outcome-report']}>
      <Routes>
        <Route path="/outcome-report" element={<OutcomeReport />} />
        <Route path="/baseline" element={<div>BASELINE_MARKER</div>} />
        <Route path="/post-check" element={<div>POST_MARKER</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OutcomeReport', () => {
  it('prompts to take a first check when no pre exists', async () => {
    setStore(memoryStore());
    renderReport();

    expect(
      await screen.findByRole('heading', { level: 2, name: 'No practice check yet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Take the first practice check' }),
    ).toBeInTheDocument();
  });

  it('shows a neutral post-check suggestion when only a pre exists', async () => {
    setStore(memoryStore());
    // A pre recorded today: fewer than 10 sessions and 0 days elapsed, so the
    // "gentle product milestone, not a clinical recommendation" wording shows.
    await saveAssessment(makeAssessment('pre', 'A', new Date().toISOString()));
    renderReport();

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Take a follow-up check' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Take the follow-up check' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/product milestone, not a clinical recommendation/i),
    ).toBeInTheDocument();
  });

  it('shows a per-domain comparison with no total score when both exist', async () => {
    setStore(memoryStore());
    await saveAssessment(makeAssessment('pre', 'A', '2026-01-01T10:00:00.000Z'));
    await saveAssessment(makeAssessment('post', 'B', '2026-01-15T10:00:00.000Z'));
    renderReport();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Practice check report' }),
    ).toBeInTheDocument();

    // Confounding wording is prominent.
    expect(screen.getByText(/familiarity or practice effects/i)).toBeInTheDocument();

    // No overall score.
    expect(screen.getByText(/no overall score/i)).toBeInTheDocument();

    // Per-domain labels use the three permitted phrases (possibly more than once).
    expect(screen.getAllByText('higher on this app task').length).toBeGreaterThan(0);
    expect(screen.getAllByText('about the same on this app task').length).toBeGreaterThan(0);

    // Functional-goal change is reported separately.
    expect(screen.getByText('Remember to take my medication on time')).toBeInTheDocument();
  });
});
