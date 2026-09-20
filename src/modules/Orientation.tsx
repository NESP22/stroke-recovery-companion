import { useEffect, useState } from 'react';
import { Page } from '../components/Page';
import { EvidenceLink } from '../components/EvidenceLink';
import {
  dayOfWeek,
  formatDateLong,
  formatTime,
  partOfDay,
  season,
} from '../lib/time';

const ROUTINE_CUES: Record<string, string> = {
  morning:
    'It is morning. A good time for your morning routine: wash, get dressed and have breakfast.',
  afternoon:
    'It is afternoon. A gentle activity or a short rest can fit well now.',
  evening:
    'It is evening. Start winding down: dinner, then a calming activity.',
  night:
    'It is night. Time to rest. Check the door is locked and get ready for bed.',
};

export default function Orientation() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const readAloudText = `The time is ${formatTime(now)}. ${formatDateLong(now)}. It is the ${season(now)} season. ${ROUTINE_CUES[partOfDay(now)]}`;

  return (
    <Page title="Orientation" backTo="/" readAloudText={readAloudText}>
      <p className="lead">Here is where you are in your day.</p>
      <div className="orientation-clock">{formatTime(now)}</div>
      <p className="orientation-date">{formatDateLong(now)}</p>
      <ul className="orientation-facts">
        <li>
          Day of the week: <strong>{dayOfWeek(now)}</strong>
        </li>
        <li>
          Season: <strong>{season(now)}</strong>
        </li>
        <li>
          Time of day: <strong>{partOfDay(now)}</strong>
        </li>
      </ul>
      <div className="routine-cue" role="note">
        {ROUTINE_CUES[partOfDay(now)]}
      </div>
      <EvidenceLink id="orientation" />
    </Page>
  );
}
