import { useState } from 'react';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { RatingScale } from '../components/RatingScale';

import { ESCALATION_GUIDANCE } from '../data/tips';
import { useCheckIns } from '../hooks/useRecords';
import { todayISO } from '../lib/time';
import { uid } from '../lib/uid';

export default function Mood() {
  const { addCheckIn } = useCheckIns();
  const [mood, setMood] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (mood === null || fatigue === null) return;
    addCheckIn({
      id: uid(),
      dateISO: todayISO(),
      mood,
      fatigue,
    });
    setSaved(true);
  };

  const lowMood = mood !== null && mood <= 2;

  return (
    <Page
      title="Mood & fatigue"
      backTo="/"
      readAloudText="Mood and fatigue check-in. This is a simple reflection, not a diagnosis."
    >
      <p className="admonition">
        This is a simple reflection to notice how you feel. It is <strong>not a
        diagnosis</strong> and does not replace professional support.
      </p>

      {!saved ? (
        <>
          <h2>How is your mood today?</h2>
          <RatingScale
            id="mood"
            value={mood}
            onChange={setMood}
            lowLabel="Very low"
            highLabel="Very good"
          />

          <h2>How tired do you feel right now?</h2>
          <RatingScale
            id="fatigue"
            value={fatigue}
            onChange={setFatigue}
            lowLabel="Not tired"
            highLabel="Very tired"
          />

          <Button onClick={save} disabled={mood === null || fatigue === null}>
            Save my check-in
          </Button>
        </>
      ) : (
        <div className="saved-note" role="status">
          <p>Saved on this device. Thank you.</p>
          {lowMood && (
            <p className="escalation">
              Your mood score was low. If this lasts, or you have thoughts of
              harming yourself, please reach out to someone you trust or a
              healthcare professional now.
            </p>
          )}
          <Button variant="secondary" onClick={() => setSaved(false)}>
            Check in again
          </Button>
        </div>
      )}

      <section className="escalation-list">
        <h2>When to get help</h2>
        {ESCALATION_GUIDANCE.map((t) => (
          <details key={t.id} className="tip-card">
            <summary>{t.title}</summary>
            <p>{t.body}</p>
          </details>
        ))}
      </section>
      
    </Page>
  );
}
