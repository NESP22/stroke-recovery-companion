import { useState } from 'react';
import { Page } from '../components/Page';
import { Button } from '../components/Button';

import { NAMING_ITEMS } from '../data/naming';
import { PHRASES } from '../data/phrases';
import { COMMUNICATION_TIPS } from '../data/tips';
import { speak } from '../lib/speech';

type Tab = 'naming' | 'phrases' | 'tips';

export default function Aphasia() {
  const [tab, setTab] = useState<Tab>('naming');
  const [index, setIndex] = useState(0);
  const [showCue, setShowCue] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const item = NAMING_ITEMS[index % NAMING_ITEMS.length];

  const nextItem = () => {
    setIndex((i) => i + 1);
    setShowCue(false);
    setShowSound(false);
    setShowWord(false);
  };

  const phraseGroups = Array.from(new Set(PHRASES.map((p) => p.category)));

  return (
    <Page
      title="Language & words"
      backTo="/"
      readAloudText="Language and words practice. This supports, but does not replace, speech and language therapy."
    >
      <p className="admonition">
        This is a practice aid to support your speech-language therapy. It is not a
        substitute for a speech-language pathologist.
      </p>

      <div className="tab-bar" role="tablist" aria-label="Language practice areas">
        {(
          [
            ['naming', 'Naming'],
            ['phrases', 'Phrase board'],
            ['tips', 'Talking tips'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'naming' && (
        <div className="naming-card">
          <div className="naming-emoji" aria-hidden="true">
            {item.emoji}
          </div>
          <p className="naming-prompt">What is this called? Say the word out loud.</p>

          {showCue && <p className="naming-hint">Hint: {item.cue}</p>}
          {showSound && <p className="naming-hint">It starts with: {item.firstSound}</p>}
          {showWord && <p className="naming-answer">{item.target}</p>}

          <div className="button-row wrap">
            <Button variant="secondary" onClick={() => setShowCue(true)}>
              Give me a hint
            </Button>
            <Button variant="secondary" onClick={() => setShowSound(true)}>
              First sound
            </Button>
            <Button variant="quiet" onClick={() => setShowWord(true)}>
              Show the word
            </Button>
          </div>
          <Button onClick={nextItem}>Next word</Button>
        </div>
      )}

      {tab === 'phrases' && (
        <div className="phrase-board">
          <p className="lead">Tap a phrase to hear it (if your device supports sound).</p>
          {phraseGroups.map((group) => (
            <section key={group}>
              <h2>{group}</h2>
              <div className="phrase-grid">
                {PHRASES.filter((p) => p.category === group).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="phrase-button"
                    onClick={() => speak(p.text)}
                  >
                    {p.text}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'tips' && (
        <div className="tip-list">
          <p className="lead">For the person supporting the conversation:</p>
          {COMMUNICATION_TIPS.map((t) => (
            <article key={t.id} className="tip-card">
              <h2>{t.title}</h2>
              <p>{t.body}</p>
            </article>
          ))}
        </div>
      )}
      
    </Page>
  );
}
