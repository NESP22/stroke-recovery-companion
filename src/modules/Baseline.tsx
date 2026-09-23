import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { RatingScale } from '../components/RatingScale';
import { EvidenceLink } from '../components/EvidenceLink';
import { useProfile } from '../context/ProfileContext';
import { generateRound } from '../data/attention';
import {
  BASELINE_DOMAIN_LABELS,
  type NamingQuestion,
  type OrientationQuestion,
  type SequencingQuestion,
} from '../data/baseline';
import {
  contentForForm,
  makeScanTrial,
  SCAN_TARGET,
  type AssessmentFormContent,
} from '../data/outcomeContent';
import { goalLabel } from '../data/goals';
import {
  buildBaselineResult,
  emptyTallies,
  type DomainTally,
} from '../lib/baselineScoring';
import { createPersonalizedPlan } from '../lib/personalization';
import { savePersonalization } from '../lib/personalizationStorage';
import {
  GOAL_RATING_CHOICES,
  GOAL_RATING_LABELS,
  buildOutcomeAssessment,
  nextForm,
  type ScoredDomain,
} from '../lib/outcome';
import { loadAssessments, saveAssessment } from '../lib/outcomeStorage';
import { uid } from '../lib/uid';
import type {
  AssessmentForm,
  AssessmentKind,
  BaselineDomain,
  FunctionalGoalRating,
} from '../types';

/**
 * The "practice check" (also called the app performance check) — Phase 2 and
 * the pre/post outcome flow. Runs as a PRE check (sets up the personalized
 * plan) or a POST check (alternate form, feeds the change report).
 *
 * SAFETY: this is for PERSONALIZATION and CHANGE-TRACKING ONLY. It is not a
 * validated cognitive or clinical test, does not diagnose, and its answers are
 * never shown as a severity or impairment label. New/worsening symptoms are
 * outside its scope: the persistent FAST banner handles emergency routing.
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
  | { kind: 'fatigue'; domain: 'fatigueTolerance' }
  | { kind: 'goal-rating'; goalId: string };

function buildSteps(
  content: AssessmentFormContent,
  goalIds: string[],
): Step[] {
  const steps: Step[] = [{ kind: 'intro' }];
  for (const question of content.orientation) {
    steps.push({ kind: 'orientation', question, domain: 'orientation' });
  }
  steps.push({ kind: 'memory-encode', domain: 'memory' });
  for (let round = 0; round < 3; round++) {
    steps.push({ kind: 'attention', round, domain: 'attention' });
  }
  steps.push({ kind: 'memory-recall', phase: 'immediate', domain: 'memory' });
  for (const item of content.naming) {
    steps.push({ kind: 'naming', item, domain: 'language' });
  }
  for (let trial = 0; trial < 2; trial++) {
    steps.push({ kind: 'scan', trial, domain: 'visualScanning' });
  }
  for (const question of content.sequencing) {
    steps.push({ kind: 'sequencing', question, domain: 'executive' });
  }
  steps.push({ kind: 'memory-recall', phase: 'delayed', domain: 'memory' });
  steps.push({ kind: 'fatigue', domain: 'fatigueTolerance' });
  for (const goalId of goalIds) {
    steps.push({ kind: 'goal-rating', goalId });
  }
  return steps;
}

function domainOf(step: Step): BaselineDomain | null {
  return 'domain' in step ? step.domain : null;
}

function stepReadAloud(step: Step): string {
  switch (step.kind) {
    case 'intro':
      return 'This is a short, gentle check that helps the app choose practice areas for you. It is not a clinical test.';
    case 'orientation':
      return `${step.question.prompt} The options are: ${step.question.options.join(', ')}.`;
    case 'memory-encode':
      return 'Please try to remember these three words.';
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
    case 'goal-rating':
      return `How much help do you need with ${goalLabel(step.goalId)} right now?`;
  }
}

/** A single-choice question (orientation / naming / sequencing). */
function ChoiceStep({
  prompt,
  options,
  correctIndex,
  emoji,
  hint,
  onHint,
  onAnswer,
}: {
  prompt: string;
  options: string[];
  correctIndex: number;
  emoji?: string;
  hint?: string;
  onHint?: () => void;
  onAnswer: (correct: boolean) => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const revealHint = () => {
    if (!showHint) {
      setShowHint(true);
      onHint?.();
    }
  };
  return (
    <>
      {emoji && (
        <div className="baseline-emoji" aria-hidden="true">
          {emoji}
        </div>
      )}
      <h2>{prompt}</h2>
      {hint && showHint && (
        <p className="baseline-hint" role="status">
          Hint: {hint}
        </p>
      )}
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
      {hint && !showHint && (
        <Button variant="quiet" onClick={revealHint}>
          Show a hint
        </Button>
      )}
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
  words,
  foil,
  onSubmit,
}: {
  phase: 'immediate' | 'delayed';
  words: readonly string[];
  foil: string;
  onSubmit: (correct: number, total: number) => void;
}) {
  const options = useMemo(() => [...words, foil], [words, foil]);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (word: string) =>
    setSelected((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );

  const submit = () => {
    const correct = words.filter((w) => selected.includes(w)).length;
    onSubmit(correct, words.length);
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

export default function Baseline({ kind = 'pre' }: { kind?: AssessmentKind }) {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [form, setForm] = useState<AssessmentForm | null>(null);

  useEffect(() => {
    let mounted = true;
    loadAssessments().then(({ assessments }) => {
      if (mounted) setForm(nextForm(assessments));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const content = form ? contentForForm(form) : null;
  const steps = useMemo(
    () => (content ? buildSteps(content, profile.goals) : []),
    [content, profile.goals],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [tallies, setTallies] = useState<Record<BaselineDomain, DomainTally>>(emptyTallies);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [hints, setHints] = useState<Partial<Record<ScoredDomain, number>>>({});
  const [goalRatings, setGoalRatings] = useState<Record<string, number>>({});

  const step = steps[stepIndex];
  const stepCount = steps.length;
  const title =
    kind === 'pre' ? 'Your practice plan' : 'Follow-up practice check';

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

  const recordHint = (domain: ScoredDomain) => {
    setHints((prev) => ({ ...prev, [domain]: (prev[domain] ?? 0) + 1 }));
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
    const ratings: FunctionalGoalRating[] = profile.goals
      .filter((id) => goalRatings[id] !== undefined)
      .map((id) => ({ goalId: id, rating: goalRatings[id] }));
    const assessment = buildOutcomeAssessment({
      kind,
      form: form ?? 'A',
      id: uid(),
      completedAt: new Date().toISOString(),
      baseline,
      hints,
      goalRatings: ratings,
    });
    await saveAssessment(assessment);

    if (kind === 'pre') {
      const plan = createPersonalizedPlan(baseline, profile);
      await savePersonalization(baseline, plan);
      navigate('/plan');
    } else {
      navigate('/outcome-report');
    }
  };

  if (!form || !content || !step) {
    return (
      <Page title={title} backTo="/">
        <p className="loading">Loading…</p>
      </Page>
    );
  }

  if (step.kind === 'intro') {
    return (
      <Page
        title={title}
        backTo="/"
        readAloudText={stepReadAloud(step)}
      >
        <h2>
          {kind === 'pre'
            ? 'Set up your practice plan'
            : 'Follow-up practice check'}
        </h2>
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
        title={title}
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
          <Button onClick={() => void finish(false)}>
            {kind === 'pre' ? 'Finish and see my plan' : 'Finish and see my report'}
          </Button>
          <Button variant="quiet" onClick={() => void finish(false)}>
            Skip this part
          </Button>
        </div>
      </Page>
    );
  }

  if (step.kind === 'goal-rating') {
    const goalId = step.goalId;
    return (
      <Page
        title={title}
        backTo="/"
        readAloudText={stepReadAloud(step)}
      >
        <p className="onboarding-progress" role="status">
          Step {stepIndex + 1} of {stepCount} · Your goals
        </p>
        <h2>How much help do you need with this right now?</h2>
        <p className="lead">{goalLabel(goalId)}</p>
        <div className="baseline-options">
          {GOAL_RATING_CHOICES.map((rating) => (
            <button
              key={rating}
              type="button"
              className={`baseline-option ${goalRatings[goalId] === rating ? 'is-selected' : ''}`}
              onClick={() => {
                setGoalRatings((prev) => ({ ...prev, [goalId]: rating }));
                setStepIndex((i) => i + 1);
              }}
              aria-pressed={goalRatings[goalId] === rating}
            >
              {GOAL_RATING_LABELS[rating]}
            </button>
          ))}
        </div>
        <div className="button-row">
          <Button variant="quiet" onClick={() => setStepIndex((i) => i + 1)}>
            Skip this goal
          </Button>
          <Button variant="quiet" onClick={() => void finish(true)}>
            Stop and finish
          </Button>
        </div>
      </Page>
    );
  }

  const domain = domainOf(step)!;
  const domainLabel = BASELINE_DOMAIN_LABELS[domain];

  return (
    <Page
      title={title}
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
            {content.memoryWords.map((w) => (
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
        <MemoryRecallStep
          phase={step.phase}
          words={content.memoryWords}
          foil={step.phase === 'immediate' ? content.memoryFoilImmediate : content.memoryFoilDelayed}
          onSubmit={recordMemory}
        />
      )}

      {step.kind === 'naming' && (
        <ChoiceStep
          prompt="What is this called?"
          options={step.item.options}
          correctIndex={step.item.correctIndex}
          emoji={step.item.emoji}
          hint={step.item.hint}
          onHint={() => recordHint('language')}
          onAnswer={(correct) => recordChoice('language', correct)}
        />
      )}

      {step.kind === 'scan' && (
        <ScanStep
          trial={step.trial + content.scanSeedOffset}
          onAnswer={(correct) => recordChoice('visualScanning', correct)}
        />
      )}

      {step.kind === 'sequencing' && (
        <ChoiceStep
          prompt={`${step.question.activity} — what is the first step?`}
          options={step.question.options}
          correctIndex={step.question.correctIndex}
          hint={step.question.hint}
          onHint={() => recordHint('executive')}
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
