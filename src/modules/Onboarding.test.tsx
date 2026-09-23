import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from '../context/ProfileContext';
import { memoryStore, setStore } from '../lib/storage';
import Onboarding from './Onboarding';
import Session from './Session';

afterEach(() => {
  setStore(null);
  window.sessionStorage.clear();
});

function renderApp(initial = '/onboarding') {
  return render(
    <ProfileProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/baseline" element={<div>BASELINE_MARKER</div>} />
          <Route path="/session" element={<Session />} />
          <Route path="/" element={<div>HOME_MARKER</div>} />
        </Routes>
      </MemoryRouter>
    </ProfileProvider>,
  );
}

async function advanceToFinalStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Get started' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
}

describe('Onboarding', () => {
  it('offers both "Set up my practice plan" and "Do this later" at the end', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderApp();
    await advanceToFinalStep(user);

    expect(
      screen.getByRole('button', { name: 'Set up my practice plan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Do this later' }),
    ).toBeInTheDocument();
  });

  it('lets the user defer the plan and still completes onboarding', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderApp();
    await advanceToFinalStep(user);

    await user.click(screen.getByRole('button', { name: 'Do this later' }));
    expect(await screen.findByText('HOME_MARKER')).toBeInTheDocument();
  });

  it('routes into the baseline check from the final step', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderApp();
    await advanceToFinalStep(user);

    await user.click(screen.getByRole('button', { name: 'Set up my practice plan' }));
    expect(await screen.findByText('BASELINE_MARKER')).toBeInTheDocument();
  });

  it('still renders the session route without regression', async () => {
    setStore(memoryStore());
    renderApp('/session');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Today’s session' }),
    ).toBeInTheDocument();
  });
});
