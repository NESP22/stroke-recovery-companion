import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import { BASELINE_DOMAIN_LABELS } from '../data/baseline';
import { MODULES } from '../lib/modules';
import { loadPersonalization } from '../lib/personalizationStorage';
import type { PersonalizedPlan } from '../types';

const MODULE_TITLE: Record<string, string> = Object.fromEntries(
  MODULES.map((m) => [m.id, m.title]),
);

function difficultyLabel(d: 'gentle' | 'standard' | 'challenging'): string {
  return d === 'gentle' ? 'Gentle' : d === 'standard' ? 'Standard' : 'Challenging';
}

export default function Plan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadPersonalization().then(({ plan: saved }) => {
      if (!mounted) return;
      setPlan(saved);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <Page title="My practice plan" backTo="/">
        <p className="loading">Loading…</p>
      </Page>
    );
  }

  if (!plan) {
    return (
      <Page title="My practice plan" backTo="/" readAloudText="You have not set up a practice plan yet.">
        <h2>No practice plan yet</h2>
        <p className="lead">
          Take the short, gentle check to create a practice plan that fits your
          goals.
        </p>
        <Button onClick={() => navigate('/baseline')}>Set up my practice plan</Button>
      </Page>
    );
  }

  return (
    <Page
      title="My practice plan"
      backTo="/"
      readAloudText="Your practice plan. This is not a clinical assessment."
    >
      <p className="admonition">
        <strong>This is not a clinical assessment.</strong> Your practice plan is
        a suggestion based on how these tasks felt to you and the goals you
        chose. It is not a medical judgement, a diagnosis, or a measure of your
        recovery, and it does not replace your care team&rsquo;s plan.
      </p>

      <section>
        <h2>Practice focus</h2>
        {plan.focus.length === 0 ? (
          <p>No focus areas were selected this time. Try the check again when you like.</p>
        ) : (
          <ul className="focus-list">
            {plan.focus.map((item, i) => (
              <li key={`${item.domain}-${i}`} className="focus-card">
                <strong>{BASELINE_DOMAIN_LABELS[item.domain]}</strong>
                <span className="muted">
                  {' '}Starting level: {difficultyLabel(item.difficulty)}
                </span>
                <p className="focus-reason">{item.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Suggested session</h2>
        <p>
          About <strong>{plan.sessionMinutes} minutes</strong>, shaped by your
          energy today. You can always stop early.
        </p>
      </section>

      <section>
        <h2>Your daily plan</h2>
        {plan.modules.length === 0 ? (
          <p>No modules were suggested this time.</p>
        ) : (
          <ol className="plan-list">
            {plan.modules.map((moduleId) => (
              <li key={moduleId}>
                <strong>{MODULE_TITLE[moduleId] ?? moduleId}</strong>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="button-row">
        <Button variant="secondary" onClick={() => navigate('/baseline')}>
          Retake the check
        </Button>
        <Link className="btn btn-primary btn-lg" to="/session">
          Start today&rsquo;s session
        </Link>
      </div>

      <EvidenceLink id="personalization" />
    </Page>
  );
}
