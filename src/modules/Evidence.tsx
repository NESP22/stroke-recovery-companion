import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { EVIDENCE, evidenceFor } from '../lib/evidence';
import { MODULES } from '../lib/modules';

const CROSS_CUTTING_IDS = [
  'session-policy',
  'accessibility',
  'privacy',
  'emergency',
];

/**
 * In-app "Research & Evidence" screen — a plain-language account of why each
 * feature exists, what evidence supports it, and what is NOT known. Written so
 * a patient or caregiver can read and understand it.
 */
export default function Evidence() {
  return (
    <Page
      title="Research & evidence"
      backTo="/"
      readAloudText="Research and evidence. Why each part of this app is here, what the evidence says, and what we do not know."
    >
      <p className="lead">
        This app is built from published rehabilitation research and clinical
        guidelines. Here we explain, in plain language, why each part is here —
        and, just as importantly, what the evidence does <strong>not</strong>{' '}
        prove.
      </p>

      <section className="evidence-intro admonition">
        <h2>The one thing to remember</h2>
        <p>
          <strong>
            Improving a test score is not the same as improving everyday life.
          </strong>{' '}
          Much of the research shows that practice can improve the task being
          practised, but there is often little or no proof that it carries over
          to independence in daily activities. We say so wherever that is the
          case.
        </p>
        <p>
          This app is a <strong>companion to your care team’s plan</strong>. It
          is not a diagnosis, not a treatment, and not a replacement for
          physiotherapy, occupational therapy, speech and language therapy, or
          medical care.
        </p>
        <p>
          Evidence changes. These notes reflect our best understanding as of
          September 2026. See the project’s{" "}
          <code>docs/RESEARCH_METHOD.md</code> for how we gathered and rated it.
        </p>
      </section>

      <section>
        <h2>Evidence strength — what the labels mean</h2>
        <ul className="summary-list evidence-key">
          <li>
            <strong>Strong</strong> — high-quality, consistent evidence or a
            firm guideline recommendation.
          </li>
          <li>
            <strong>Moderate</strong> — reasonable evidence, often with
            limitations.
          </li>
          <li>
            <strong>Low / Very low</strong> — limited, inconsistent or very
            uncertain evidence.
          </li>
          <li>
            <strong>Expert consensus</strong> — agreement among clinicians
            without strong trial evidence.
          </li>
        </ul>
      </section>

      <section>
        <h2>Practice areas</h2>
        {MODULES.map((m) => {
          const e = evidenceFor(m.id);
          return (
            <article key={m.id} className="evidence-card">
              <h3>{e?.title ?? m.title}</h3>
              <p>{e?.why}</p>
              <dl className="evidence-meta">
                <div>
                  <dt>Evidence strength</dt>
                  <dd>{e?.strength.toLowerCase()}</dd>
                </div>
                <div>
                  <dt>What it covers</dt>
                  <dd>{e?.evidenceScope}</dd>
                </div>
                <div>
                  <dt>Limits to know</dt>
                  <dd>{e?.limitations}</dd>
                </div>
              </dl>
              <p className="muted">
                <strong>What the app does:</strong> {e?.appBehavior}
              </p>
              <Link className="back-link" to={m.path}>
                Open “{m.title}” →
              </Link>
            </article>
          );
        })}
      </section>

      <section>
        <h2>How the app is built (and why)</h2>
        {CROSS_CUTTING_IDS.map((id) => {
          const e = EVIDENCE.find((x) => x.id === id);
          if (!e) return null;
          return (
            <article key={id} className="evidence-card">
              <h3>{e.title}</h3>
              <p>{e.why}</p>
              <dl className="evidence-meta">
                <div>
                  <dt>Evidence strength</dt>
                  <dd>{e.strength.toLowerCase()}</dd>
                </div>
                <div>
                  <dt>What it covers</dt>
                  <dd>{e.evidenceScope}</dd>
                </div>
              </dl>
              <p className="muted">
                <strong>What the app does:</strong> {e.appBehavior}
              </p>
            </article>
          );
        })}
      </section>

      <section>
        <h2>Sources</h2>
        <p>
          Full source list and the traceability table (feature → source →
          evidence strength → limitations → app behaviour) are in{" "}
          <code>docs/EVIDENCE.md</code>. The source documents themselves are in
          the research directory. Key sources include:
        </p>
        <ul className="evidence-sources">
          {Array.from(
            new Map(
              EVIDENCE.flatMap((e) => e.sources).map((s) => [s.url, s]),
            ).values(),
          ).map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
