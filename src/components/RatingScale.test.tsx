import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingScale } from './RatingScale';

describe('RatingScale', () => {
  it('renders eleven buttons (0–10)', () => {
    render(
      <RatingScale id="t" value={null} onChange={() => {}} lowLabel="Low" highLabel="High" />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(11);
  });

  it('reports the selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RatingScale id="t" value={null} onChange={onChange} lowLabel="Low" highLabel="High" />,
    );
    await user.click(screen.getByRole('button', { name: '7' }));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it('marks the current value as selected', () => {
    render(
      <RatingScale id="t" value={4} onChange={() => {}} lowLabel="Low" highLabel="High" />,
    );
    expect(screen.getByRole('button', { name: '4' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
