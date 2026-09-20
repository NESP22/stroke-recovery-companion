import { useState } from 'react';
import { Page } from '../components/Page';

import {
  CAREGIVER_TIPS,
  COMMUNICATION_TIPS,
  ESCALATION_GUIDANCE,
} from '../data/tips';

type Tab = 'communication' | 'selfcare' | 'help';

export default function Caregiver() {
  const [tab, setTab] = useState<Tab>('communication');

  const content =
    tab === 'communication'
      ? COMMUNICATION_TIPS
      : tab === 'selfcare'
        ? CAREGIVER_TIPS
        : ESCALATION_GUIDANCE;

  const heading =
    tab === 'communication'
      ? 'Talking with the person'
      : tab === 'selfcare'
        ? 'Looking after yourself'
        : 'When to get help';

  return (
    <Page
      title="Caregiver support"
      backTo="/"
      readAloudText="Caregiver support. Practical tips for communicating and for looking after yourself."
    >
      <div className="tab-bar" role="tablist" aria-label="Caregiver topics">
        {(
          [
            ['communication', 'Talking'],
            ['selfcare', 'Self-care'],
            ['help', 'Get help'],
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

      <h2>{heading}</h2>
      {tab === 'help' && (
        <p className="admonition warning">
          If someone is in immediate danger — for example new stroke symptoms,
          a bad fall, or harm to themselves — call emergency services now. Do not
          wait.
        </p>
      )}
      <div className="tip-list">
        {content.map((t) => (
          <article key={t.id} className="tip-card">
            <h3>{t.title}</h3>
            <p>{t.body}</p>
          </article>
        ))}
      </div>
      
    </Page>
  );
}
