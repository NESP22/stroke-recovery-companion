import { evidenceFor } from '../lib/evidence';

interface Props {
  /** Evidence entry id (module id or cross-cutting topic). */
  id: string;
}

/**
 * "Why this is here" disclosure, rendered on every exercise/module.
 * Shows (in plain language) the reason, evidence strength, limitations and
 * source links. The full detail lives on the Research & Evidence screen.
 */
export function EvidenceLink({ id }: Props) {
  const entry = evidenceFor(id);
  if (!entry) return null;

  return (
    <details className="evidence-link">
      <summary>Why this is here</summary>
      <div className="evidence-link-body">
        <p>{entry.why}</p>
        <p>
          <strong>Evidence strength:</strong> {entry.strength.toLowerCase()}
        </p>
        <p>
          <strong>What the evidence covers:</strong> {entry.evidenceScope}
        </p>
        <p>
          <strong>Limits to know:</strong> {entry.limitations}
        </p>
        <ul className="evidence-sources">
          {entry.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
