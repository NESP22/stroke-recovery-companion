import { useEffect, useState } from 'react';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import { generateRound } from '../data/attention';
import { useProfile } from '../context/ProfileContext';
import { useAdaptive } from '../hooks/useAdaptive';
import { AdaptiveLevelNote } from '../components/AdaptiveLevelNote';
import type { Difficulty } from '../types';

export default function Attention() {
  const { profile } = useProfile();
  const { level, recordAttempt } = useAdaptive('attention');
  const [difficulty, setDifficulty] = useState<Difficulty>(profile.difficulty);
  const [userChose, setUserChose] = useState(false);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [found, setFound] = useState(0);
  const [missed, setMissed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // The adaptive engine's recommendation is the starting level, unless the
  // user has explicitly chosen one.
  useEffect(() => {
    if (level && !userChose) setDifficulty(level);
  }, [level, userChose]);

  const data = generateRound(difficulty, round * 7919 + 13);

  const chooseDifficulty = (d: Difficulty) => {
    setUserChose(true);
    setDifficulty(d);
    setStarted(false);
    setRound(0);
    setFound(0);
    setMissed(false);
    setMessage(null);
  };

  const handleCell = (index: number) => {
    if (index === data.targetIndex) {
      setFound((f) => f + 1);
      setMessage('Yes! Well done.');
      // First-tap accuracy is the only signal; skips never count as failure.
      recordAttempt({ correct: !missed, assisted: false, skipped: false });
      setMissed(false);
      setRound((r) => r + 1);
    } else {
      setMissed(true);
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

      <AdaptiveLevelNote domain="attention" level={level} />

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
