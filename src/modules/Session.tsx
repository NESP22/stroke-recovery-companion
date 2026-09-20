import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { RatingScale } from '../components/RatingScale';
import { SESSION_MODULES, type ModuleMeta } from '../lib/modules';
import { useProfile } from '../context/ProfileContext';
import { useAdl } from '../hooks/useAdl';
import { useRecords } from '../hooks/useRecords';
import { todayISO } from '../lib/time';
import { uid } from '../lib/uid';

const ACTIVE_KEY = 'session.active.v1';

interface ActiveSession {
  dateISO: string;
  startAt: number;
  done: string[];
  fatigueBefore: number;
}

function loadActive(): ActiveSession | null {
  const raw = sessionStorage.getItem(ACTIVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActiveSession;
    if (parsed.dateISO !== todayISO()) {
      sessionStorage.removeItem(ACTIVE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveActive(a: ActiveSession): void {
  sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

function buildPlan(minutes: number, d: Date): ModuleMeta[] {
  const start = dayOfYear(d) % SESSION_MODULES.length;
  const ordered = [...SESSION_MODULES.slice(start), ...SESSION_MODULES.slice(0, start)];
  const plan: ModuleMeta[] = [];
  let total = 0;
  for (const m of ordered) {
    if (total + m.estimateMinutes > minutes) break;
    plan.push(m);
    total += m.estimateMinutes;
  }
  return plan;
}

type Stage = 'intro' | 'active' | 'finish' | 'done';

export default function Session() {
  const { profile } = useProfile();
  const { addRecord } = useRecords();
  const { completedTodayCount } = useAdl();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>('intro');
  const [fatigueBefore, setFatigueBefore] = useState<number | null>(null);
  const [active, setActive] = useState<ActiveSession | null>(() => loadActive());
  const [now, setNow] = useState(() => Date.now());
  const [checked, setChecked] = useState<string[]>([]);
  const [fatigueAfter, setFatigueAfter] = useState<number | null>(null);

  const plan = useMemo(
    () => buildPlan(profile.sessionMinutes, new Date()),
    [profile.sessionMinutes],
  );

  // Ticking clock for the gentle "time so far" indicator (not a countdown).
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const elapsedMinutes = active
    ? Math.floor((now - active.startAt) / 60_000)
    : 0;

  const start = () => {
    if (fatigueBefore === null) return;
    const a: ActiveSession = {
      dateISO: todayISO(),
      startAt: Date.now(),
      done: [],
      fatigueBefore,
    };
    saveActive(a);
    setActive(a);
    setNow(Date.now());
    setStage('active');
  };

  const markDone = (id: string) => {
    setActive((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        done: prev.done.includes(id) ? prev.done : [...prev.done, id],
      };
      saveActive(next);
      return next;
    });
  };

  const beginFinish = () => {
    setChecked(active?.done ?? []);
    setFatigueAfter(null);
    setStage('finish');
  };

  const saveRecord = () => {
    if (!active || fatigueAfter === null) return;
    addRecord({
      id: uid(),
      dateISO: todayISO(),
      minutes: Math.max(elapsedMinutes, 1),
      fatigueBefore: active.fatigueBefore,
      fatigueAfter,
      modulesCompleted: checked,
      checklistCompleted: completedTodayCount,
      mood: null,
    });
    sessionStorage.removeItem(ACTIVE_KEY);
    setActive(null);
    setStage('done');
  };

  const showRestNote =
    elapsedMinutes > 0 && elapsedMinutes % profile.restEveryMinutes === 0;
  const reachedCap = elapsedMinutes >= profile.sessionMinutes;

  if (stage === 'intro') {
    return (
      <Page title="Today’s session" backTo="/">
        <h2>Before we start: how is your energy?</h2>
        <RatingScale
          id="fatigue-before"
          value={fatigueBefore}
          onChange={setFatigueBefore}
          lowLabel="Not tired"
          highLabel="Very tired"
        />
        {fatigueBefore !== null && fatigueBefore >= 7 && (
          <p className="admonition warning">
            You sound quite tired today. A shorter session or a rest first is
            fine. It is always OK to do less.
          </p>
        )}
        <h2>Your plan for today (about {plan.reduce((s, m) => s + m.estimateMinutes, 0)} minutes)</h2>
        <ol className="plan-list">
          {plan.map((m) => (
            <li key={m.id}>
              <strong>{m.title}</strong> — about {m.estimateMinutes} minutes
            </li>
          ))}
        </ol>
        <div className="button-row">
          <Button onClick={start} disabled={fatigueBefore === null}>
            Start session
          </Button>
          {fatigueBefore !== null && fatigueBefore >= 7 && (
            <Button variant="secondary" onClick={() => navigate('/orientation')}>
              Rest first (open orientation)
            </Button>
          )}
        </div>
      </Page>
    );
  }

  if (stage === 'active') {
    return (
      <Page title="Today’s session" backTo="/">
        <p className="session-clock" aria-live="off">
          Time so far: <strong>{elapsedMinutes} minutes</strong>
          <span className="muted"> (planned {profile.sessionMinutes})</span>
        </p>
        {showRestNote && (
          <p className="admonition" role="status">
            You have been going for {elapsedMinutes} minutes. A short rest is a
            good idea.
          </p>
        )}
        {reachedCap && (
          <p className="admonition" role="status">
            You have reached your planned time. Well done. You can stop here or
            keep going if you feel good.
          </p>
        )}

        <h2>Choose an activity</h2>
        <ul className="plan-list interactive">
          {plan.map((m) => {
            const done = active?.done.includes(m.id);
            return (
              <li key={m.id}>
                <Link
                  className={`plan-item ${done ? 'is-done' : ''}`}
                  to={m.path}
                  onClick={() => markDone(m.id)}
                >
                  <span>{done ? '✓' : '○'}</span>
                  <span>
                    <strong>{m.title}</strong> — about {m.estimateMinutes} minutes
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Button onClick={beginFinish}>Finish session</Button>
      </Page>
    );
  }

  if (stage === 'finish') {
    return (
      <Page title="Finish session" backTo="/">
        <h2>How is your energy now?</h2>
        <RatingScale
          id="fatigue-after"
          value={fatigueAfter}
          onChange={setFatigueAfter}
          lowLabel="Not tired"
          highLabel="Very tired"
        />
        <h2>Which activities did you do?</h2>
        <ul className="checklist">
          {plan.map((m) => (
            <li key={m.id}>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={checked.includes(m.id)}
                  onChange={() =>
                    setChecked((prev) =>
                      prev.includes(m.id)
                        ? prev.filter((x) => x !== m.id)
                        : [...prev, m.id],
                    )
                  }
                />
                <span>{m.title}</span>
              </label>
            </li>
          ))}
        </ul>
        <Button onClick={saveRecord} disabled={fatigueAfter === null}>
          Save my session
        </Button>
      </Page>
    );
  }

  return (
    <Page title="Session complete" backTo="/">
      <div className="saved-note" role="status">
        <p>Well done — you finished a session.</p>
        <p>This is a record of your effort, not a medical measure of recovery.</p>
      </div>
      <div className="home-links">
        <Link to="/dashboard">See my progress</Link>
        <Link to="/">Back to home</Link>
      </div>
    </Page>
  );
}
