import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import { BASELINE_DOMAIN_LABELS } from '../data/baseline';
import { goalLabel } from '../data/goals';
import {
  GOAL_RATING_LABELS,
  POST_SUGGEST_DAYS,
  POST_SUGGEST_SESSIONS,
  compareDomains,
  compareGoalRatings,
  daysBetween,
  isPostSuggested,
  trainingExposure,
} from '../lib/outcome';
import { loadAssessments } from '../lib/outcomeStorage';
import { useRecords } from '../hooks/useRecords';
import type { OutcomeAssessment } from '../types';

/**
 * The pre/post change report. Compares app-task performance PER DOMAIN only —
 * there is deliberately no overall cognitive or "recovery" score. Change
 * labels are limited to "higher/…", "about the same/…", "lower/…" on this app
 * task.
 */
export default function OutcomeReport() {
  const navigate = useNavigate();
  const { records } = useRecords();
  const [assessments, setAssessments] = useState<OutcomeAssessment[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadAssessments().then(({ assessments: saved }) => {
      if (!mounted) return;
      setAssessments(saved);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <Page title="Practice check report" backTo="/">
        <p className="loading">Loading…</p>
      </Page>
    );
  }

  const pre = [...assessments].reverse().find((a) => a.kind === 'pre');
  const post =
    pre &&
    [...assessments]
      .reverse()
      .find((a) => a.kind === 'post' && a.completedAt > pre.completedAt);

  if (!pre) {
    return (
      <Page
        title="Practice check report"
        backTo="/"
        readAloudText="You have not taken a first practice check yet."
      >
        <h2>No practice check yet</h2>
        <p className="lead">
          Take the short, gentle first check to set a starting point for your
          practice. You can compare against it later.
        </p>
        <Button onClick={() => navigate('/baseline')}>
          Take the first practice check
        </Button>
      </Page>
    );
  }

  const exposure = trainingExposure(records);
  const daysSincePre = daysBetween(
    pre.completedAt,
    post ? post.completedAt : new Date().toISOString(),
  );
  const suggested = isPostSuggested(exposure.sessions, daysSincePre);

  if (!post) {
    return (
      <Page
        title="Practice check report"
        backTo="/"
        readAloudText="Your starting point is recorded. You can take a follow-up check any time."
      >
        <p className="admonition">
          <strong>This is not a clinical assessment.</strong> These numbers are
          how app tasks feel to you. They do not measure your recovery.
        </p>

        <section>
          <h2>Your starting point</h2>
          <p>
            Recorded on{' '}
            {new Date(pre.completedAt).toLocaleDateString()}. You have completed{' '}
            <strong>{exposure.sessions}</strong> practice session
            {exposure.sessions === 1 ? '' : 's'} ({exposure.minutes} minutes).
          </p>
        </section>

        <section>
          <h2>Take a follow-up check</h2>
          {suggested ? (
            <p role="status">
              You have been practising for {exposure.sessions} session
              {exposure.sessions === 1 ? '' : 's'} or {daysSincePre} days. You
              might like to take a follow-up practice check to see how these
              tasks feel now.
            </p>
          ) : (
            <p>
              You can take a follow-up practice check at any time. We suggest
              waiting until you have done about {POST_SUGGEST_SESSIONS} sessions
              or {POST_SUGGEST_DAYS} days — this is a gentle product milestone,
              not a clinical recommendation.
            </p>
          )}
          <Button onClick={() => navigate('/post-check')}>
            Take the follow-up check
          </Button>
        </section>

        <EvidenceLink id="outcome-measurement" />
      </Page>
    );
  }

  const comparisons = compareDomains(pre, post);
  const goalChanges = compareGoalRatings(pre, post);
  const moduleNames = exposure.modules.length
    ? exposure.modules.join(', ')
    : 'none recorded';

  return (
    <Page
      title="Practice check report"
      backTo="/"
      readAloudText="Your before and after practice-check report. These are app tasks only, not a clinical assessment."
    >
      <p className="admonition">
        <strong>These changes may not mean what you think.</strong> Score
        changes can reflect familiarity or practice effects, day-to-day fatigue,
        natural recovery, other therapy, or other factors — and cannot show that
        this app caused the change. This is for discussion with your
        rehabilitation team, not a measure of recovery.
      </p>

      <section>
        <h2>How each area feels (before → after)</h2>
        <p className="muted">
          Compared per area only. There is no overall score and no percentage
          &ldquo;recovered&rdquo;.
        </p>
        {comparisons.length === 0 ? (
          <p>Not enough completed areas to compare this time.</p>
        ) : (
          <ul className="outcome-list">
            {comparisons.map((c) => (
              <li key={c.domain} className="outcome-card">
                <strong>{BASELINE_DOMAIN_LABELS[c.domain]}</strong>
                <span className="muted">
                  {' '}
                  {c.before.correct}/{c.before.total} → {c.after.correct}/
                  {c.after.total}
                </span>
                <p className="focus-reason">{c.label}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Fatigue</h2>
        <p>
          Before: {pre.fatigue === null ? 'not recorded' : `${pre.fatigue} / 10`}
          {' · '}
          After: {post.fatigue === null ? 'not recorded' : `${post.fatigue} / 10`}
        </p>
      </section>

      <section>
        <h2>Your practice between checks</h2>
        <p>
          <strong>{exposure.sessions}</strong> session
          {exposure.sessions === 1 ? '' : 's'} · <strong>{exposure.minutes}</strong>{' '}
          minutes · modules: {moduleNames}
        </p>
      </section>

      <section>
        <h2>Your goals (before → after)</h2>
        {goalChanges.length === 0 ? (
          <p>No goal ratings to compare.</p>
        ) : (
          <ul className="outcome-list">
            {goalChanges.map((g) => (
              <li key={g.goalId} className="outcome-card">
                <strong>{goalLabel(g.goalId)}</strong>
                <span className="muted">
                  {' '}
                  {GOAL_RATING_LABELS[g.before]} → {GOAL_RATING_LABELS[g.after]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="admonition">
        This on-screen summary contains no personal details and is intended
        <strong> for discussion with your rehabilitation team</strong>.
      </p>

      <EvidenceLink id="outcome-measurement" />
    </Page>
  );
}
