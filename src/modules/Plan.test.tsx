import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { memoryStore, setStore } from '../lib/storage';
import { savePersonalization } from '../lib/personalizationStorage';
import type { BaselineResult, PersonalizedPlan } from '../types';
import Plan from './Plan';

const baseline: BaselineResult = {
  version: 1,
  completedAt: '2026-02-01T10:00:00.000Z',
  domains: [],
  fatigue: null,
  stoppedEarly: false,
};

const plan: PersonalizedPlan = {
  version: 1,
  createdAt: '2026-02-01T10:00:01.000Z',
  focus: [
    {
      domain: 'memory',
      difficulty: 'gentle',
      reason: 'Matches a practice goal you selected.',
    },
    {
      domain: 'language',
      difficulty: 'standard',
      reason: 'This task felt harder during setup, so it is a useful practice focus.',
    },
  ],
  sessionMinutes: 15,
  modules: ['memory', 'aphasia'],
};

afterEach(() => {
  setStore(null);
  window.sessionStorage.clear();
});

function renderPlan() {
  return render(
    <MemoryRouter initialEntries={['/plan']}>
      <Routes>
        <Route path="/plan" element={<Plan />} />
        <Route path="/baseline" element={<div>BASELINE_MARKER</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Plan', () => {
  it('shows a prompt when no plan exists and links to the baseline check', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderPlan();

    expect(await screen.findByText(/no practice plan yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Set up my practice plan' }));
    expect(await screen.findByText('BASELINE_MARKER')).toBeInTheDocument();
  });

  it('shows focus areas, starting levels, session length and the non-clinical note', async () => {
    setStore(memoryStore());
    await savePersonalization(baseline, plan);
    renderPlan();

    expect(
      await screen.findByText(/this is not a clinical assessment/i),
    ).toBeInTheDocument();

    // Focus areas with plain-language reasons and starting levels.
    expect(screen.getByText(/starting level: gentle/i)).toBeInTheDocument();
    expect(screen.getByText(/starting level: standard/i)).toBeInTheDocument();
    expect(
      screen.getByText('Matches a practice goal you selected.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/felt harder during setup/i),
    ).toBeInTheDocument();

    // Session length (text is split across JSX nodes, so match by content).
    const sessionSection = screen
      .getByRole('heading', { name: 'Suggested session' })
      .closest('section')!;
    expect(sessionSection).toHaveTextContent('15 minutes');

    // Daily module plan uses existing module titles (scoped to the section).
    const dailySection = screen
      .getByRole('heading', { name: 'Your daily plan' })
      .closest('section')!;
    expect(dailySection).toHaveTextContent('Memory');
    expect(dailySection).toHaveTextContent('Language & words');

    // Retake control.
    expect(screen.getByRole('button', { name: 'Retake the check' })).toBeInTheDocument();
  });
});
