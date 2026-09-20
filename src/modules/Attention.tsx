import { useState } from 'react';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import { generateRound } from '../data/attention';
import { useProfile } from '../context/ProfileContext';
import type { Difficulty } from '../types';

export default function Attention() {
  const { profile } = useProfile();
  const [difficulty, setDifficulty] = useState<Difficulty>(profile.difficulty);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [found, setFound] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const data = generateRound(difficulty, round * 7919 + 13);

  const chooseDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setStarted(false);
    setRound(0);
    setFound(0);
    setMessage(null);
  };

  const handleCell = (index: number) => {
    if (index === data.targetIndex) {
      setFound((f) => f + 1);
      setMessage('Yes! Well done.');
      setRound((r) => r + 1);
    } else {
      setMessage('Not that one — keep looking. There is no rush.');
    }
  };

  return (
    <Page
      title="Attention"
      backTo="/"
      readAloudText="Attention practice. Find the target symbol among the others. Take your time."
    >
      <p className="lead">
        Find the <strong className="attention-target">{data.target}</strong>.
        Take all the time you need — there is no timer.
      </p>

      <fieldset className="choice-group">
        <legend>Difficulty</legend>
        {(['gentle', 'standard', 'challenging'] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            className={`choice-chip ${difficulty === d ? 'is-selected' : ''}`}
            onClick={() => chooseDifficulty(d)}
            aria-pressed={difficulty === d}
          >
            {d === 'gentle' ? 'Gentle' : d === 'standard' ? 'Standard' : 'Challenging'}
          </button>
        ))}
      </fieldset>

      {!started ? (
        <Button onClick={() => setStarted(true)}>Start</Button>
      ) : (
        <div className="attention-area">
          <div
            className={`attention-grid cols-${data.size}`}
            role="grid"
            aria-label="Attention grid"
          >
            {data.grid.map((symbol, i) => (
              <button
                key={`${round}-${i}`}
                type="button"
                className="attention-cell"
                onClick={() => handleCell(i)}
                aria-label={`symbol ${symbol}`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <p className="found-count" aria-live="polite">
            {message ?? `Found so far: ${found}`}
          </p>
          <Button variant="secondary" onClick={() => setStarted(false)}>
            Stop and rest
          </Button>
        </div>
      )}
      <EvidenceLink id="attention" />
    </Page>
  );
}
