interface Props {
  id: string;
  value: number | null;
  onChange: (value: number) => void;
  lowLabel: string;
  highLabel: string;
  /** 0–10 inclusive. */
  max?: number;
}

const SCALE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Large, labelled 0–10 scale. No time pressure. */
export function RatingScale({ id, value, onChange, lowLabel, highLabel }: Props) {
  return (
    <div role="group" aria-labelledby={`${id}-label`} className="rating-scale">
      <p id={`${id}-label`} className="rating-scale-labels">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </p>
      <div className="rating-scale-buttons">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            className={`rating-button ${value === n ? 'is-selected' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`${n}`}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
