import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { RatingScale } from '../components/RatingScale';
import { EvidenceLink } from '../components/EvidenceLink';
import { useProfile } from '../context/ProfileContext';
import { generateRound } from '../data/attention';
import {
  BASELINE_DOMAIN_LABELS,
  BASELINE_NAMING,
  MEMORY_FOIL_DELAYED,
  MEMORY_FOIL_IMMEDIATE,
  MEMORY_WORDS,
  ORIENTATION_QUESTIONS,
  SCAN_TARGET,
  SEQUENCING_QUESTIONS,
  makeScanTrial,
  type NamingQuestion,
  type OrientationQuestion,
  type SequencingQuestion,
} from '../data/baseline';
import {
  buildBaselineResult,
  emptyTallies,
  type DomainTally,
} from '../lib/baselineScoring';
import { createPersonalizedPlan } from '../lib/personalization';
import { savePersonalization } from '../lib/personalizationStorage';
import type { BaselineDomain } from '../types';

/**
 * Baseline Check — the first slice of the personalized recovery plan.
 *
 * SAFETY: this is for PERSONALIZATION ONLY. It is not a validated cognitive or
 * clinical test, does not diagnose, and its answers are never shown as a
 * severity or impairment label. New/worsening symptoms are outside its scope:
 * the persistent FAST banner (see EmergencyBanner) handles emergency routing.
 */

type Step =
  | { kind: 'intro' }
  | { kind: 'orientation'; question: OrientationQuestion; domain: 'orientation' }
  | { kind: 'memory-encode'; domain: 'memory' }
  | { kind: 'attention'; round: number; domain: 'attention' }
  | { kind: 'memory-recall'; phase: 'immediate' | 'delayed'; domain: 'memory' }
  | { kind: 'naming'; item: NamingQuestion; domain: 'language' }
  | { kind: 'scan'; trial: number; domain: 'visualScanning' }
  | { kind: 'sequencing'; question: SequencingQuestion; domain: 'executive' }
  | { kind: 'fatigue'; domain: 'fatigueTolerance' };

function buildSteps(): Step[] {
  const steps: Step[] = [{ kind: 'intro' }];
  for (const question of ORIENTATION_QUESTIONS) {
    steps.push({ kind: 'orientation', question, domain: 'orientation' });
  }
  steps.push({ kind: 'memory-encode', domain: 'memory' });
  for (let round = 0; round < 3; round++) {
    steps.push({ kind: 'attention', round, domain: 'attention' });
  }
  steps.push({ kind: 'memory-recall', phase: 'immediate', domain: 'memory' });
  for (const item of BASELINE_NAMING) {
    steps.push({ kind: 'naming', item, domain: 'language' });
  }
  for (let trial = 0; trial < 2; trial++) {
    steps.push({ kind: 'scan', trial, domain: 'visualScanning' });
  }
  for (const question of SEQUENCING_QUESTIONS) {
    steps.push({ kind: 'sequencing', question, domain: 'executive' });
  }
  steps.push({ kind: 'memory-recall', phase: 'delayed', domain: 'memory' });
  steps.push({ kind: 'fatigue', domain: 'fatigueTolerance' });
  return steps;
}

function domainOf(step: Step): BaselineDomain | null {
  return 'domain' in step ? step.domain : null;
}

function stepReadAloud(step: Step): string {
  switch (step.kind) {
    case 'intro':
      return 'Set up your practice plan. This is a short, gentle check that helps the app choose practice areas for you. It is not a clinical test.';
    case 'orientation':
      return `${step.question.prompt} The options are: ${step.question.options.join(', ')}.`;
    case 'memory-encode':
      return `Please try to remember these three words: ${MEMORY_WORDS.join(', ')}.`;
    case 'attention':
      return 'Attention task. Tap the target symbol in the grid. Take all the time you need.';
    case 'memory-recall':
      return step.phase === 'immediate'
        ? 'Which of these words did you see a moment ago?'
        : 'Which of these words did you see at the very start?';
    case 'naming':
      return 'What is this called?';
    case 'scan':
      return 'Scan the line from left to right and tap the star.';
    case 'sequencing':
      return `What is the first step of ${step.question.activity}?`;
    case 'fatigue':
      return 'How tired do you feel right now?';
  }
}

/** A single-choice question (orientation / naming / sequencing). */
function ChoiceStep({
  prompt,
  options,
  correctIndex,
  emoji,
  onAnswer,
}: {
  prompt: string;
  options: string[];
  correctIndex: number;
  emoji?: string;
  onAnswer: (correct: boolean) => void;
}) {
  return (
    <>
      {emoji && (
        <div className="baseline-emoji" aria-hidden="true">
          {emoji}
        </div>
      )}
      <h2>{prompt}</h2>
      <div className="baseline-options">
        {options.map((opt, i) => (
          <button
            key={`${i}-${opt}`}
            type="button"
            className="baseline-option"
            onClick={() => onAnswer(i === correctIndex)}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}

/** Find-the-target grid; first-tap accuracy is the only signal recorded. */
function AttentionStep({
  round,
  onAnswer,
}: {
  round: number;
  onAnswer: (correct: boolean) => void;
}) {
  const data = generateRound('gentle', round * 7919 + 13);
  const [missed, setMissed] = useState(false);

  const handleCell = (index: number) => {
    if (index === data.targetIndex) {
      onAnswer(!missed);
    } else {
      setMissed(true);
    }
  };

  return (
    <>
      <h2>Tap the {data.target}</h2>
      <p className="lead">Take all the time you need — there is no timer.</p>
      <div
        className={`attention-grid cols-${data.size}`}
        role="grid"
        aria-label="Attention grid"
      >
        {data.grid.map((symbol, i) => (
          <button
            key={`${round}-${i}`}
            type="button"
            className="attention-cell"
            onClick={() => handleCell(i)}
            aria-label={`symbol ${symbol}`}
          >
            {symbol}
          </button>
        ))}
      </div>
      <p className="found-count" aria-live="polite">
        {missed ? 'Not that one — keep looking. There is no rush.' : ' '}
      </p>
    </>
  );
}

/** Left-to-right scanning line; first-tap accuracy is the only signal. */
function ScanStep({
  trial,
  onAnswer,
}: {
  trial: number;
  onAnswer: (correct: boolean) => void;
}) {
  const { row, targetIndex } = makeScanTrial(trial);
  const [missed, setMissed] = useState(false);

  const pick = (index: number) => {
    if (index === targetIndex) {
      onAnswer(!missed);
    } else {
      setMissed(true);
    }
  };

  return (
    <>
      <h2>Find the {SCAN_TARGET}</h2>
      <p className="lead">Look from left to right along the whole line.</p>
      <div className="neglect-row" role="group" aria-label="Scanning line">
        {row.map((symbol, i) => (
          <button
            key={`${trial}-${i}`}
            type="button"
            className="neglect-cell"
            onClick={() => pick(i)}
            aria-label={`symbol ${symbol}`}
          >
            {symbol}
          </button>
        ))}
      </div>
      <p className="found-count" aria-live="polite">
        {missed ? 'Keep scanning to the very end of the line. No rush.' : ' '}
      </p>
    </>
  );
}

/** Multi-select recognition recall (gentle: pick the words you remember). */
function MemoryRecallStep({
  phase,
  onSubmit,
}: {
  phase: 'immediate' | 'delayed';
  onSubmit: (correct: number, total: number) => void;
}) {
  const foil = phase === 'immediate' ? MEMORY_FOIL_IMMEDIATE : MEMORY_FOIL_DELAYED;
  const options = useMemo(() => [...MEMORY_WORDS, foil], [foil]);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (word: string) =>
    setSelected((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );

  const submit = () => {
    const correct = MEMORY_WORDS.filter((w) => selected.includes(w)).length;
    onSubmit(correct, MEMORY_WORDS.length);
  };

  return (
    <>
      <h2>
        {phase === 'immediate'
          ? 'Which words did you see a moment ago?'
          : 'Which words did you see at the very start?'}
      </h2>
      <p className="lead">Tap the words you remember. It is fine to miss one.</p>
      <div className="baseline-options">
        {options.map((word) => (
          <button
            key={word}
            type="button"
            className={`baseline-option ${selected.includes(word) ? 'is-selected' : ''}`}
            onClick={() => toggle(word)}
            aria-pressed={selected.includes(word)}
          >
            {word}
          </button>
        ))}
      </div>
      <Button onClick={submit}>Next</Button>
    </>
  );
}

export default function Baseline() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const steps = useMemo(buildSteps, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [tallies, setTallies] = useState<Record<BaselineDomain, DomainTally>>(emptyTallies);
  const [fatigue, setFatigue] = useState<number | null>(null);

  const step = steps[stepIndex];
  const stepCount = steps.length;

  const recordChoice = (domain: BaselineDomain, correct: boolean) => {
    setTallies((prev) => {
      const t = prev[domain];
      return {
        ...prev,
        [domain]: {
          ...t,
          correct: t.correct + (correct ? 1 : 0),
          total: t.total + 1,
          attempted: true,
        },
      };
    });
    setStepIndex((i) => i + 1);
  };

  const recordMemory = (correct: number, total: number) => {
    setTallies((prev) => {
      const t = prev.memory;
      return {
        ...prev,
        memory: { ...t, correct: t.correct + correct, total: t.total + total, attempted: true },
      };
    });
    setStepIndex((i) => i + 1);
  };

  const skipDomain = (domain: BaselineDomain) => {
    setTallies((prev) => ({ ...prev, [domain]: { ...prev[domain], skipped: true } }));
    setStepIndex((i) => {
      for (let next = i + 1; next < steps.length; next++) {
        const d = domainOf(steps[next]);
        if (d !== null && d !== domain) return next;
      }
      return steps.length - 1;
    });
  };

  const finish = async (stoppedEarly: boolean) => {
    const baseline = buildBaselineResult(
      tallies,
      fatigue,
      stoppedEarly,
      new Date().toISOString(),
    );
    const plan = createPersonalizedPlan(baseline, profile);
    await savePersonalization(baseline, plan);
    navigate('/plan');
  };

  if (step.kind === 'intro') {
    return (
      <Page
        title="Your practice plan"
        backTo="/"
        readAloudText={stepReadAloud(step)}
      >
        <h2>Set up your practice plan</h2>
        <p className="lead">
          A short, gentle check that helps this app suggest practice areas and a
          starting level for you.
        </p>
        <p className="admonition">
          <strong>This is not a clinical assessment.</strong> It is not a test
          of how your recovery is going, and it does not label or diagnose
          anything. Its only job is to personalise your practice. You can skip
          any part or stop at any time.
        </p>
        <div className="button-row">
          <Button onClick={() => setStepIndex(1)}>Begin</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Do this later
          </Button>
        </div>
        <EvidenceLink id="personalization" />
      </Page>
    );
  }

  if (step.kind === 'fatigue') {
    return (
      <Page
        title="Your practice plan"
        backTo="/"
        readAloudText={stepReadAloud(step)}
      >
        <h2>How tired do you feel right now?</h2>
        <RatingScale
          id="baseline-fatigue"
          value={fatigue}
          onChange={setFatigue}
          lowLabel="Not tired"
          highLabel="Very tired"
        />
        <div className="button-row">
          <Button onClick={() => void finish(false)}>Finish and see my plan</Button>
          <Button variant="quiet" onClick={() => void finish(false)}>
            Skip this part
          </Button>
        </div>
      </Page>
    );
  }

  const domain = domainOf(step)!;
  const domainLabel = BASELINE_DOMAIN_LABELS[domain];

  return (
    <Page
      title="Your practice plan"
      backTo="/"
      readAloudText={stepReadAloud(step)}
    >
      <p className="onboarding-progress" role="status">
        Step {stepIndex + 1} of {stepCount} · {domainLabel}
      </p>

      {step.kind === 'orientation' && (
        <ChoiceStep
          prompt={step.question.prompt}
          options={step.question.options}
          correctIndex={step.question.correctIndex}
          onAnswer={(correct) => recordChoice('orientation', correct)}
        />
      )}

      {step.kind === 'memory-encode' && (
        <>
          <h2>Please try to remember these three words</h2>
          <ul className="baseline-words">
            {MEMORY_WORDS.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="lead">We will ask about them again later.</p>
          <Button onClick={() => setStepIndex((i) => i + 1)}>Next</Button>
        </>
      )}

      {step.kind === 'attention' && (
        <AttentionStep
          round={step.round}
          onAnswer={(correct) => recordChoice('attention', correct)}
        />
      )}

      {step.kind === 'memory-recall' && (
        <MemoryRecallStep phase={step.phase} onSubmit={recordMemory} />
      )}

      {step.kind === 'naming' && (
        <ChoiceStep
          prompt="What is this called?"
          options={step.item.options}
          correctIndex={step.item.correctIndex}
          emoji={step.item.emoji}
          onAnswer={(correct) => recordChoice('language', correct)}
        />
      )}

      {step.kind === 'scan' && (
        <ScanStep trial={step.trial} onAnswer={(correct) => recordChoice('visualScanning', correct)} />
      )}

      {step.kind === 'sequencing' && (
        <ChoiceStep
          prompt={`${step.question.activity} — what is the first step?`}
          options={step.question.options}
          correctIndex={step.question.correctIndex}
          onAnswer={(correct) => recordChoice('executive', correct)}
        />
      )}

      <div className="button-row">
        <Button variant="quiet" onClick={() => skipDomain(domain)}>
          Skip this part
        </Button>
        <Button variant="quiet" onClick={() => void finish(true)}>
          Stop and finish
        </Button>
      </div>
    </Page>
  );
}
