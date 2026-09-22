import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import { FUNCTIONAL_TASKS, tasksForFocus } from '../data/functionalTasks';
import {
  ASSISTANCE_LEVELS,
  COMPLETION_STATUSES,
  emptyLog,
  recordAttempt,
  summarizeLog,
} from '../lib/functionalPractice';
import { loadFunctionalLog, saveFunctionalLog } from '../lib/outcomeStorage';
import { loadPersonalization } from '../lib/personalizationStorage';
import type {
  AssistanceLevel,
  CompletionStatus,
  FunctionalPracticeLog,
} from '../types';

const STAGES = ['Goal', 'Plan', 'Do', 'Check'] as const;

/**
 * Real-life functional practice — Goal–Plan–Do–Check with preset choices only.
 * Completion/assistance are structured enums, never a clinical independence
 * score.
 */
export default function FunctionalPractice() {
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState(FUNCTIONAL_TASKS);
  const [taskIndex, setTaskIndex] = useState(0);
  const [stage, setStage] = useState(0); // 0..3 = GPDC, 4 = record
  const [assistance, setAssistance] = useState<AssistanceLevel | null>(null);
  const [completion, setCompletion] = useState<CompletionStatus | null>(null);
  const [log, setLog] = useState<FunctionalPracticeLog>(emptyLog());
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadPersonalization(), loadFunctionalLog()])
      .then(([personalization, savedLog]) => {
        if (!mounted) return;
        const focusDomains =
          personalization.plan?.focus.map((f) => f.domain) ?? [];
        setTasks(tasksForFocus(focusDomains));
        setLog(savedLog);
        setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <Page title="Functional practice" backTo="/">
        <p className="loading">Loading…</p>
      </Page>
    );
  }

  if (done) {
    const summary = summarizeLog(log);
    return (
      <Page title="Functional practice" backTo="/">
        <div className="saved-note" role="status">
          <p>Well done — you practised a real-life task.</p>
          <p>
            {summary.total} task{summary.total === 1 ? '' : 's'} tried ·{' '}
            {summary.completed} completed · {summary.independent} done on your
            own.
          </p>
          <p>This is a record of your effort, not a measure of your recovery.</p>
        </div>
        <div className="home-links">
          <Link to="/dashboard">See my progress</Link>
          <Link to="/">Back to home</Link>
        </div>
      </Page>
    );
  }

  const task = tasks[taskIndex % tasks.length];

  const nextStage = () => {
    if (stage < 3) setStage((s) => s + 1);
  };

  const record = () => {
    if (assistance === null || completion === null) return;
    const updated = recordAttempt(log, {
      taskId: task.id,
      completedAt: new Date().toISOString(),
      assistance,
      completion,
    });
    setLog(updated);
    void saveFunctionalLog(updated);
    setAssistance(null);
    setCompletion(null);
    setStage(0);
    if (taskIndex + 1 >= tasks.length) {
      setDone(true);
    } else {
      setTaskIndex((i) => i + 1);
    }
  };

  return (
    <Page
      title="Functional practice"
      backTo="/"
      readAloudText="Functional practice. We work through Goal, Plan, Do, Check for an everyday task."
    >
      <p className="admonition">
        This is a practice aid for everyday tasks. It is not a test and does not
        measure your independence.
      </p>

      <div className="gpdc-progress" role="status">
        {STAGES.map((s, i) => (
          <span key={s} className={i === stage ? 'gpdc-active' : ''}>
            {s}
          </span>
        ))}
      </div>

      <div className="gpdc-card">
        <h2>
          {task.emoji} {task.title}
        </h2>
        <p className="gpdc-situation">{task.situation}</p>

        {stage === 0 && (
          <>
            <h3>Goal</h3>
            <p>{task.goal}</p>
          </>
        )}

        {stage === 1 && (
          <>
            <h3>Plan</h3>
            <p>Think through the steps you would take:</p>
            <ul className="check-list">
              {task.planSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </>
        )}

        {stage === 2 && (
          <>
            <h3>Do</h3>
            <p>{task.doHint}</p>
          </>
        )}

        {stage === 3 && (
          <>
            <h3>Check</h3>
            <p>{task.checkPrompt}</p>
          </>
        )}

        {stage === 4 && (
          <>
            <h3>How did it go?</h3>
            <p className="lead">How much help did you need?</p>
            <div className="baseline-options">
              {ASSISTANCE_LEVELS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  className={`baseline-option ${assistance === l.value ? 'is-selected' : ''}`}
                  onClick={() => setAssistance(l.value)}
                  aria-pressed={assistance === l.value}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <p className="lead">Did you finish the task?</p>
            <div className="baseline-options">
              {COMPLETION_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`baseline-option ${completion === s.value ? 'is-selected' : ''}`}
                  onClick={() => setCompletion(s.value)}
                  aria-pressed={completion === s.value}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="button-row">
        {stage > 0 && stage <= 3 && (
          <Button variant="secondary" onClick={() => setStage((s) => s - 1)}>
            Back
          </Button>
        )}
        {stage < 3 && (
          <Button onClick={nextStage}>
            {stage === 0 ? 'Plan' : stage === 1 ? 'Do' : 'Check'}
          </Button>
        )}
        {stage === 3 && (
          <Button onClick={() => setStage(4)}>How did it go?</Button>
        )}
        {stage === 4 && (
          <Button onClick={record} disabled={assistance === null || completion === null}>
            Record and next task
          </Button>
        )}
      </div>
      <EvidenceLink id="functional-practice" />
    </Page>
  );
}
