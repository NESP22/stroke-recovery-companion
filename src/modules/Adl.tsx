import { useState } from 'react';
import { Page } from '../components/Page';
import { EvidenceLink } from '../components/EvidenceLink';
import { CHECKLISTS } from '../data/checklists';
import { useAdl } from '../hooks/useAdl';

export default function Adl() {
  const { doneToday, toggle, ready } = useAdl();
  const [active, setActive] = useState(0);
  const checklist = CHECKLISTS[active];

  return (
    <Page
      title="Daily routines"
      backTo="/"
      readAloudText="Daily routines. Tick each step as you finish it."
    >
      <div className="tab-bar" role="tablist" aria-label="Routine">
        {CHECKLISTS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`tab ${active === i ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {c.timeOfDay}
          </button>
        ))}
      </div>

      <h2>{checklist.title}</h2>
      {!ready ? (
        <p>Loading…</p>
      ) : (
        <ul className="checklist">
          {checklist.items.map((item, i) => {
            const key = `${checklist.id}:${i}`;
            const done = doneToday.includes(key);
            return (
              <li key={key}>
                <label className={`check-item ${done ? 'is-done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggle(key)}
                  />
                  <span>{item}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
      <p className="admonition">
        Your checklist ticks are saved on this device only. They are a record of
        activity, not a measure of ability.
      </p>
      <EvidenceLink id="adl" />
    </Page>
  );
}
