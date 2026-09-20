import { useState } from 'react';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import { SCENARIOS } from '../data/scenarios';

const STAGES = ['Goal', 'Plan', 'Do', 'Check'] as const;

export default function Executive() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const scenario = SCENARIOS[scenarioIndex];

  const next = () => {
    if (stage < STAGES.length - 1) {
      setStage((s) => s + 1);
    } else {
      setStage(0);
      setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
    }
  };

  const back = () => {
    if (stage > 0) setStage((s) => s - 1);
  };

  return (
    <Page
      title="Problem-solving"
      backTo="/"
      readAloudText="Problem-solving. We work through four steps: Goal, Plan, Do, Check."
    >
      <p className="lead">
        This is a thinking exercise. There are no wrong answers — the practice is
        the process.
      </p>

      <div className="gpdc-progress" role="status">
        {STAGES.map((s, i) => (
          <span key={s} className={i === stage ? 'gpdc-active' : ''}>
            {s}
          </span>
        ))}
      </div>

      <div className="gpdc-card">
        <h2>{scenario.title}</h2>
        <p className="gpdc-situation">{scenario.situation}</p>

        {stage === 0 && (
          <>
            <h3>Goal</h3>
            <p>{scenario.goalHint}</p>
          </>
        )}

        {stage === 1 && (
          <>
            <h3>Plan</h3>
            <p>Think through the steps you would take:</p>
            <ul className="check-list">
              {scenario.planOptions.map((opt) => (
                <li key={opt}>{opt}</li>
              ))}
            </ul>
          </>
        )}

        {stage === 2 && (
          <>
            <h3>Do</h3>
            <p>Now imagine carrying out each step, one at a time. You can say the steps out loud if it helps.</p>
          </>
        )}

        {stage === 3 && (
          <>
            <h3>Check</h3>
            <p>{scenario.checkPrompt}</p>
          </>
        )}
      </div>

      <div className="button-row">
        <Button variant="secondary" onClick={back} disabled={stage === 0}>
          Back
        </Button>
        <Button onClick={next}>
          {stage === STAGES.length - 1 ? 'Next situation' : 'Next step'}
        </Button>
      </div>
      <EvidenceLink id="executive" />
    </Page>
  );
}
