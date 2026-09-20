import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ReadAloud } from './ReadAloud';

interface Props {
  title: string;
  /** Optional back navigation path. */
  backTo?: string;
  /** Read-aloud target text (defaults to the title). */
  readAloudText?: string;
  /** Extra header controls. */
  headerActions?: ReactNode;
  children: ReactNode;
}

/** One screen = one primary task. Large, plain, low cognitive load. */
export function Page({
  title,
  backTo,
  readAloudText,
  headerActions,
  children,
}: Props) {
  return (
    <section className="page">
      <header className="page-header">
        {backTo ? (
          <Link className="back-link" to={backTo}>
            ← Back
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
        <h1>{title}</h1>
        <div className="page-actions">
          <ReadAloud text={readAloudText ?? title} />
          {headerActions}
        </div>
      </header>
      <div className="page-body">{children}</div>
    </section>
  );
}
