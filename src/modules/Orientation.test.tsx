import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Orientation from './Orientation';

describe('Orientation', () => {
  it('shows the heading and orientation facts', () => {
    const { container } = render(
      <MemoryRouter>
        <Orientation />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Orientation' }),
    ).toBeInTheDocument();
    expect(container.querySelector('.orientation-clock')).not.toBeNull();
    expect(container.querySelector('.orientation-facts')).not.toBeNull();
    expect(container.querySelector('.routine-cue')).not.toBeNull();
  });
});
