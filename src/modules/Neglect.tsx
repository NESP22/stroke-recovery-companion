import { useState } from 'react';
import { Page } from '../components/Page';
import { Button } from '../components/Button';


type Side = 'left' | 'right' | 'both';

const ROW_SYMBOLS = ['●', '○', '◆', '◇', '▲', '△', '■', '□', '★', '☆'];
const TARGET = '★';

function makeRow(side: Side, seed: number): { row: string[]; targetIndex: number } {
  const row = Array.from({ length: 8 }, (_, i) => ROW_SYMBOLS[(i + seed) % ROW_SYMBOLS.length]);
  const index =
    side === 'left' ? 0 + (seed % 2) : side === 'right' ? 7 - (seed % 2) : seed % 8;
  row[index] = TARGET;
  return { row, targetIndex: index };
}

export default function Neglect() {
  const [side, setSide] = useState<Side>('left');
  const [seed, setSeed] = useState(0);
  const [started, setStarted] = useState(false);
  const [found, setFound] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const { row, targetIndex } = makeRow(side, seed);

  const pick = (i: number) => {
    if (i === targetIndex) {
      setFound((f) => f + 1);
      setMessage('Well done — you scanned the whole line.');
      setSeed((s) => s + 1);
    } else {
      setMessage('Keep scanning to the very end of the line. No rush.');
    }
  };

  const changeSide = (s: Side) => {
    setSide(s);
    setStarted(false);
    setSeed(0);
    setFound(0);
    setMessage(null);
  };

  const sideLabel =
    side === 'left' ? 'the left side' : side === 'right' ? 'the right side' : 'both sides';

  return (
    <Page
      title="Visual scanning"
      backTo="/"
      readAloudText="Visual scanning practice. Look carefully to the side you are practising. Only do this while sitting safely."
    >
      <p className="admonition warning">
        Only practise while sitting safely. Never do this exercise while walking,
        driving or doing anything else.
      </p>

      <fieldset className="choice-group">
        <legend>Which side should I practise looking toward?</legend>
        {(['left', 'both', 'right'] as Side[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`choice-chip ${side === s ? 'is-selected' : ''}`}
            onClick={() => changeSide(s)}
            aria-pressed={side === s}
          >
            {s === 'left' ? 'Left' : s === 'right' ? 'Right' : 'Both sides'}
          </button>
        ))}
      </fieldset>

      {!started ? (
        <Button onClick={() => setStarted(true)}>Start scanning</Button>
      ) : (
        <div className="neglect-area">
          <p className="lead">
            Find the <strong>{TARGET}</strong>. Remember to look toward {sideLabel}.
          </p>
          <div className="neglect-row" role="group" aria-label="Scanning line">
            {row.map((symbol, i) => (
              <button
                key={`${seed}-${i}`}
                type="button"
                className="neglect-cell"
                onClick={() => pick(i)}
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
            Stop
          </Button>
        </div>
      )}
      
    </Page>
  );
}
