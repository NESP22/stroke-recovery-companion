import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from '../context/ProfileContext';
import { memoryStore, setStore } from '../lib/storage';
import { loadPersonalization } from '../lib/personalizationStorage';
import { generateRound } from '../data/attention';
import { MEMORY_WORDS, SCAN_TARGET } from '../data/baseline';
import Baseline from './Baseline';

afterEach(() => {
  setStore(null);
  window.sessionStorage.clear();
});

function renderBaseline() {
  return render(
    <ProfileProvider>
      <MemoryRouter initialEntries={['/baseline']}>
        <Routes>
          <Route path="/baseline" element={<Baseline />} />
          <Route path="/plan" element={<div>PLAN_MARKER</div>} />
          <Route path="/" element={<div>HOME_MARKER</div>} />
        </Routes>
      </MemoryRouter>
    </ProfileProvider>,
  );
}

describe('Baseline', () => {
  it('renders the intro with a not-a-clinical-test note and begin/later options', () => {
    setStore(memoryStore());
    renderBaseline();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your practice plan' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/this is not a clinical assessment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Begin' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Do this later' })).toBeInTheDocument();
  });

  it('navigates home without saving when the user chooses "Do this later"', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderBaseline();

    await user.click(screen.getByRole('button', { name: 'Do this later' }));
    expect(await screen.findByText('HOME_MARKER')).toBeInTheDocument();

    const loaded = await loadPersonalization();
    expect(loaded.baseline).toBeNull();
  });

  it('skipping a domain marks it skipped and moves to the next domain', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderBaseline();

    await user.click(screen.getByRole('button', { name: 'Begin' }));
    // First step is orientation question 1.
    expect(screen.getByRole('status')).toHaveTextContent(/orientation/i);

    await user.click(screen.getByRole('button', { name: 'Skip this part' }));
    // Skipping orientation should jump to the memory-encoding step.
    expect(
      screen.getByText(/please try to remember these three words/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Stop and finish' }));
    expect(await screen.findByText('PLAN_MARKER')).toBeInTheDocument();

    const loaded = await loadPersonalization();
    const orientation = loaded.baseline!.domains.find(
      (d) => d.domain === 'orientation',
    )!;
    expect(orientation.skipped).toBe(true);
    expect(orientation.completed).toBe(false);
    expect(loaded.baseline!.stoppedEarly).toBe(true);
  });

  it('completes the full flow, saves a complete baseline, and lands on the plan', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderBaseline();

    await user.click(screen.getByRole('button', { name: 'Begin' }));

    // Orientation (3 questions).
    await user.click(screen.getByRole('button', { name: 'Monday' }));
    await user.click(screen.getByRole('button', { name: 'Autumn' }));
    await user.click(screen.getByRole('button', { name: 'Morning' }));

    // Memory encoding.
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Attention (3 rounds) — tap the target symbol in each.
    for (let round = 0; round < 3; round++) {
      const { target } = generateRound('gentle', round * 7919 + 13);
      await user.click(screen.getByRole('button', { name: `symbol ${target}` }));
    }

    // Immediate recall.
    for (const word of MEMORY_WORDS) {
      await user.click(screen.getByRole('button', { name: word }));
    }
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Naming (3 items, correct options).
    await user.click(screen.getByRole('button', { name: 'cup' }));
    await user.click(screen.getByRole('button', { name: 'banana' }));
    await user.click(screen.getByRole('button', { name: 'cat' }));

    // Scanning (2 trials) — tap the star.
    await user.click(screen.getByRole('button', { name: `symbol ${SCAN_TARGET}` }));
    await user.click(screen.getByRole('button', { name: `symbol ${SCAN_TARGET}` }));

    // Sequencing (3 questions, correct first-step options).
    await user.click(screen.getByRole('button', { name: 'Fill the kettle with water' }));
    await user.click(screen.getByRole('button', { name: 'Choose your clothes' }));
    await user.click(screen.getByRole('button', { name: 'Find the phone' }));

    // Delayed recall.
    for (const word of MEMORY_WORDS) {
      await user.click(screen.getByRole('button', { name: word }));
    }
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Fatigue.
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: 'Finish and see my plan' }));

    expect(await screen.findByText('PLAN_MARKER')).toBeInTheDocument();

    const loaded = await loadPersonalization();
    expect(loaded.persistent).toBe(true);
    expect(loaded.plan).not.toBeNull();

    const baseline = loaded.baseline!;
    expect(baseline.stoppedEarly).toBe(false);
    expect(baseline.fatigue).toBe(4);

    const memory = baseline.domains.find((d) => d.domain === 'memory')!;
    expect(memory.completed).toBe(true);
    expect(memory.total).toBe(6);
    expect(memory.correct).toBe(6);

    const executive = baseline.domains.find((d) => d.domain === 'executive')!;
    expect(executive.total).toBe(3);
    expect(executive.correct).toBe(3);
  });

  it('exposes progress, options and controls with accessible semantics', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderBaseline();

    await user.click(screen.getByRole('button', { name: 'Begin' }));

    // Progress is announced as a status region.
    expect(screen.getByRole('status')).toHaveTextContent(/Step 2 of/i);

    // Every option is a native button with a readable name.
    const options = screen.getAllByRole('button', {
      name: /Monday|Table|Winter/,
    });
    expect(options).toHaveLength(3);

    // Skip / stop controls are always available on a task step.
    expect(screen.getByRole('button', { name: 'Skip this part' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop and finish' })).toBeInTheDocument();
  });
});
