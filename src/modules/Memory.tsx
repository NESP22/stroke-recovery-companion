import { useMemo, useState } from 'react';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import {
  ERRORLESS_ITEMS,
  REMINDER_PRESETS,
  SPACED_ITEMS,
} from '../data/memoryFacts';
import { useStored } from '../hooks/useStored';

type Mode = 'spaced' | 'errorless' | 'reminders';

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Memory() {
  const [mode, setMode] = useState<Mode>('spaced');

  // Spaced retrieval state
  const items = useMemo(() => shuffled(SPACED_ITEMS).slice(0, 3), []);
  const [phase, setPhase] = useState<'learn' | 'recall' | 'done'>('learn');
  const [learnIndex, setLearnIndex] = useState(0);
  const [schedIndex, setSchedIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [remembered, setRemembered] = useState(0);

  // Errorless state
  const [eIndex, setEIndex] = useState(0);
  const [eStep, setEStep] = useState(0);

  // Reminders (external memory aid — preset only, no free text)
  const [activeReminders, setActiveReminders] = useStored<string[]>(
    'reminders.v1',
    ['morning-meds', 'drink-water'],
  );

  // Spaced retrieval schedule: repeat each item at increasing intervals.
  const schedule = useMemo(
    () => [
      ...items.map((_, i) => ({ i })),
      ...items.map((_, i) => ({ i })),
      ...items.map((_, i) => ({ i })),
    ],
    [items],
  );

  const startSpaced = () => {
    setPhase('learn');
    setLearnIndex(0);
    setSchedIndex(0);
    setRevealed(false);
    setRemembered(0);
  };

  const nextLearn = () => {
    if (learnIndex + 1 < items.length) setLearnIndex((i) => i + 1);
    else {
      setPhase('recall');
      setSchedIndex(0);
      setRevealed(false);
    }
  };

  const nextRecall = (gotIt: boolean) => {
    if (gotIt) setRemembered((r) => r + 1);
    if (schedIndex + 1 < schedule.length) {
      setSchedIndex((i) => i + 1);
      setRevealed(false);
    } else {
      setPhase('done');
    }
  };

  const errorlessItem = ERRORLESS_ITEMS[eIndex % ERRORLESS_ITEMS.length];
  const faded = `${errorlessItem.target.charAt(0)}…`;

  const nextErrorless = () => {
    if (eStep < 2) {
      setEStep((s) => s + 1);
    } else {
      setEStep(0);
      setEIndex((i) => i + 1);
    }
  };

  return (
    <Page
      title="Memory"
      backTo="/"
      readAloudText="Memory practice. We use techniques that are designed to support memory, such as spaced retrieval and errorless learning."
    >
      <p className="admonition">
        These are practice techniques to help you compensate for memory
        difficulties. They do not guarantee memory improvement.
      </p>

      <div className="tab-bar" role="tablist" aria-label="Memory practice">
        {(
          [
            ['spaced', 'Spaced retrieval'],
            ['errorless', 'Errorless'],
            ['reminders', 'Reminders'],
          ] as [Mode, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={`tab ${mode === id ? 'is-active' : ''}`}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'spaced' && (
        <div className="memory-card">
          {phase === 'learn' && (
            <>
              <h2>Learn these three things</h2>
              <p>Read each one slowly. You can say it out loud.</p>
              <div className="memory-fact">
                <p className="memory-prompt">{items[learnIndex].prompt}</p>
                <p className="memory-answer">{items[learnIndex].answer}</p>
              </div>
              <Button onClick={nextLearn}>
                {learnIndex + 1 < items.length ? 'Next thing' : 'Start recall'}
              </Button>
            </>
          )}

          {phase === 'recall' && (
            <>
              <h2>Now try to remember</h2>
              <p className="memory-gap-note">
                A little time has passed. Try to recall without help first.
              </p>
              <div className="memory-fact">
                <p className="memory-prompt">
                  {items[schedule[schedIndex].i].prompt}
                </p>
                {revealed && (
                  <p className="memory-answer">
                    {items[schedule[schedIndex].i].answer}
                  </p>
                )}
              </div>
              {!revealed ? (
                <Button variant="secondary" onClick={() => setRevealed(true)}>
                  Show the answer
                </Button>
              ) : (
                <div className="button-row">
                  <Button onClick={() => nextRecall(true)}>I remembered</Button>
                  <Button variant="secondary" onClick={() => nextRecall(false)}>
                    I needed help
                  </Button>
                </div>
              )}
            </>
          )}

          {phase === 'done' && (
            <>
              <h2>Well done</h2>
              <p>
                You remembered {remembered} of {schedule.length} without help.
              </p>
              <p>
                This is practice, not a test. Doing it regularly is what helps.
              </p>
              <Button onClick={startSpaced}>Practise again</Button>
            </>
          )}
        </div>
      )}

      {mode === 'errorless' && (
        <div className="memory-card">
          <h2>Errorless practice</h2>
          <p>
            We show the answer first, so you do not have to guess. Then the help
            slowly fades.
          </p>
          <div className="memory-fact">
            <p className="memory-prompt">{errorlessItem.cue}</p>
            <p className="memory-answer">
              {eStep === 0
                ? errorlessItem.target
                : eStep === 1
                  ? faded
                  : '…'}
            </p>
          </div>
          <p className="memory-step-hint">
            {eStep === 0
              ? 'Say the answer out loud.'
              : eStep === 1
                ? 'Say the answer using just the first sound.'
                : 'Say the answer from the cue alone.'}
          </p>
          <Button onClick={nextErrorless}>
            {eStep < 2 ? 'Next step' : 'Next item'}
          </Button>
        </div>
      )}

      {mode === 'reminders' && (
        <div className="memory-card">
          <h2>My reminders</h2>
          <p>
            Choose the prompts that are useful to you. They stay on this device.
          </p>
          <ul className="checklist">
            {REMINDER_PRESETS.map((r) => {
              const on = activeReminders.includes(r.id);
              return (
                <li key={r.id}>
                  <label className={`check-item ${on ? 'is-done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setActiveReminders((prev) =>
                          on
                            ? prev.filter((x) => x !== r.id)
                            : [...prev, r.id],
                        )
                      }
                    />
                    <span>
                      {r.label} <em className="muted">({r.timeHint})</em>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="admonition">
            For a real alarm, use your phone or clock. These are written prompts
            to support your memory.
          </p>
        </div>
      )}
      <EvidenceLink id="memory" />
    </Page>
  );
}
