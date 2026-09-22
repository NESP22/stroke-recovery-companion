import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { GOALS } from '../data/goals';
import { useProfile } from '../context/ProfileContext';
import { todayISO } from '../lib/time';
import { allowedSessionOptions } from '../lib/sessionPolicy';
import type { Difficulty, FontSize } from '../types';

const STEP_COUNT = 6;

export default function Onboarding() {
  const { update } = useProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [sessionMinutes, setSessionMinutes] = useState(15);
  const [restEveryMinutes, setRestEveryMinutes] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [caregiverMode, setCaregiverMode] = useState(false);
  const [clinicianConfigured, setClinicianConfigured] = useState(false);
  const [caregiverRole, setCaregiverRole] = useState('No one');
  const [fontSize, setFontSize] = useState<FontSize>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const domains = Array.from(new Set(GOALS.map((g) => g.domain)));

  const toggleGoal = (id: string) =>
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const finish = (nextPath: string = '/') => {
    update({
      goals,
      sessionMinutes,
      restEveryMinutes,
      difficulty,
      caregiverMode,
      clinicianConfigured,
      caregiverRole,
      fontSize,
      highContrast,
      reduceMotion,
      createdAt: todayISO(),
    });
    navigate(nextPath);
  };

  const next = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Page title="Welcome" readAloudText="Welcome. We will set up your companion in a few short steps.">
      <p className="onboarding-progress" role="status">
        Step {step + 1} of {STEP_COUNT}
      </p>

      {step === 0 && (
        <>
          <h2>This is your recovery companion</h2>
          <p>
            It supports the rehabilitation plan from your care team. It is
            <strong> not a medical device and not medical advice</strong>.
          </p>
          <p>Everything you do stays on this device. Nothing is sent to a server.</p>
          <p>
            If you ever see new stroke signs — Face, Arms, Speech, Time — call
            your emergency number (999, 911 or 112) right away.
          </p>
          <Button onClick={next}>Get started</Button>
        </>
      )}

      {step === 1 && (
        <>
          <h2>What would you like to work on?</h2>
          <p>Choose as many as you like. You can change these later.</p>
          {domains.map((domain) => (
            <section key={domain} className="goal-group">
              <h3>{domain}</h3>
              <div className="goal-grid">
                {GOALS.filter((g) => g.domain === domain).map((g) => {
                  const on = goals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`choice-chip ${on ? 'is-selected' : ''}`}
                      onClick={() => toggleGoal(g.id)}
                      aria-pressed={on}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="button-row">
            <Button variant="secondary" onClick={back}>
              Back
            </Button>
            <Button onClick={next}>Next</Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2>How long should a session be?</h2>
          <p>
            Short sessions fit post-stroke fatigue better than long ones. The
            usual maximum is 30 minutes — a sensible, fatigue-based default,
            not an evidence-based “best” length. Longer sessions can be set
            later, in Settings, only with a clinician or carer’s help.
          </p>
          <fieldset className="choice-group">
            <legend>Session length</legend>
            {allowedSessionOptions(clinicianConfigured).map((m) => (
              <button
                key={m}
                type="button"
                className={`choice-chip ${sessionMinutes === m ? 'is-selected' : ''}`}
                onClick={() => setSessionMinutes(m)}
                aria-pressed={sessionMinutes === m}
              >
                {m} minutes
              </button>
            ))}
          </fieldset>

          <fieldset className="choice-group">
            <legend>Remind me to rest every</legend>
            {[5, 10, 15].map((m) => (
              <button
                key={m}
                type="button"
                className={`choice-chip ${restEveryMinutes === m ? 'is-selected' : ''}`}
                onClick={() => setRestEveryMinutes(m)}
                aria-pressed={restEveryMinutes === m}
              >
                {m} minutes
              </button>
            ))}
          </fieldset>

          <fieldset className="choice-group">
            <legend>Starting difficulty</legend>
            {(['gentle', 'standard', 'challenging'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`choice-chip ${difficulty === d ? 'is-selected' : ''}`}
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
              >
                {d === 'gentle' ? 'Gentle' : d === 'standard' ? 'Standard' : 'Challenging'}
              </button>
            ))}
          </fieldset>

          <div className="button-row">
            <Button variant="secondary" onClick={back}>
              Back
            </Button>
            <Button onClick={next}>Next</Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Who is this for?</h2>
          <p>
            We never ask for or store names, dates of birth or other personal
            details. These choices only change how the app behaves.
          </p>

          <fieldset className="choice-group">
            <legend>I am using this…</legend>
            {[
              ['self', 'For myself'],
              ['support', 'To support someone else'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`choice-chip ${caregiverMode === (id === 'support') ? 'is-selected' : ''}`}
                onClick={() => setCaregiverMode(id === 'support')}
                aria-pressed={caregiverMode === (id === 'support')}
              >
                {label}
              </button>
            ))}
          </fieldset>

          <fieldset className="choice-group">
            <legend>Did a clinician or carer help set this up?</legend>
            {[
              ['yes', 'Yes'],
              ['no', 'No'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`choice-chip ${clinicianConfigured === (id === 'yes') ? 'is-selected' : ''}`}
                onClick={() => setClinicianConfigured(id === 'yes')}
                aria-pressed={clinicianConfigured === (id === 'yes')}
              >
                {label}
              </button>
            ))}
          </fieldset>

          <fieldset className="choice-group">
            <legend>Who helps you most day-to-day?</legend>
            {['No one', 'Family member', 'Friend', 'Carer', 'Clinician'].map((r) => (
              <button
                key={r}
                type="button"
                className={`choice-chip ${caregiverRole === r ? 'is-selected' : ''}`}
                onClick={() => setCaregiverRole(r)}
                aria-pressed={caregiverRole === r}
              >
                {r}
              </button>
            ))}
          </fieldset>

          <div className="button-row">
            <Button variant="secondary" onClick={back}>
              Back
            </Button>
            <Button onClick={next}>Next</Button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Make it comfortable to read and use</h2>
          <fieldset className="choice-group">
            <legend>Text size</legend>
            {(
              [
                ['standard', 'Standard'],
                ['large', 'Large'],
                ['xl', 'Extra large'],
              ] as [FontSize, string][]
            ).map(([size, label]) => (
              <button
                key={size}
                type="button"
                className={`choice-chip ${fontSize === size ? 'is-selected' : ''}`}
                onClick={() => setFontSize(size)}
                aria-pressed={fontSize === size}
              >
                {label}
              </button>
            ))}
          </fieldset>

          <label className="check-item toggle">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            <span>High contrast colours</span>
          </label>

          <label className="check-item toggle">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
            />
            <span>Reduce motion and animations</span>
          </label>

          <div className="button-row">
            <Button variant="secondary" onClick={back}>
              Back
            </Button>
            <Button onClick={next}>Next</Button>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <h2>You’re all set</h2>
          <ul className="summary-list">
            <li>
              Goals chosen: <strong>{goals.length}</strong>
            </li>
            <li>
              Session length: <strong>{sessionMinutes} minutes</strong>
            </li>
            <li>
              Difficulty: <strong>{difficulty}</strong>
            </li>
          </ul>
          <p>
            Remember: this app supports your rehabilitation. It does not replace
            your care team.
          </p>
          <Button onClick={() => finish('/baseline')}>Set up my practice plan</Button>
          <div className="button-row">
            <Button variant="secondary" onClick={() => finish('/')}>
              Do this later
            </Button>
            <Button variant="quiet" onClick={back}>
              Back
            </Button>
          </div>
        </>
      )}
    </Page>
  );
}
