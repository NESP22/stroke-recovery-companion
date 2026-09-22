import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { memoryStore, setStore } from '../lib/storage';
import FunctionalPractice from './FunctionalPractice';

afterEach(() => {
  setStore(null);
  window.sessionStorage.clear();
});

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/functional']}>
      <FunctionalPractice />
    </MemoryRouter>,
  );
}

describe('FunctionalPractice', () => {
  it('renders the Goal stage of the first task', async () => {
    setStore(memoryStore());
    renderScreen();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Functional practice' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/morning routine/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plan' })).toBeInTheDocument();
  });

  it('walks Goal → Plan → Do → Check, then records structured enums only', async () => {
    setStore(memoryStore());
    const user = userEvent.setup();
    renderScreen();

    await screen.findByRole('heading', { level: 1, name: 'Functional practice' });

    await user.click(screen.getByRole('button', { name: 'Plan' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Plan' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Do' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Do' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Check' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'How did it go?' }));

    // Structured-only: the preset assistance + completion choices, no free text.
    expect(
      screen.getByRole('button', { name: 'I did it on my own' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'I needed a prompt or reminder' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'I needed help from someone' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Partly done' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Not done this time' })).toBeInTheDocument();

    // The record button is disabled until both choices are made.
    expect(screen.getByRole('button', { name: 'Record and next task' })).toBeDisabled();
  });

  it('never renders a free-text input', async () => {
    setStore(memoryStore());
    const { container } = renderScreen();
    await screen.findByRole('heading', { level: 1, name: 'Functional practice' });
    expect(container.querySelector('textarea')).toBeNull();
    expect(container.querySelector('input[type="text"]')).toBeNull();
  });
});
