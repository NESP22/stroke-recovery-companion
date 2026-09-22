import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { useProfile } from '../context/ProfileContext';
import { useAdl } from '../hooks/useAdl';
import { useCheckIns, useRecords } from '../hooks/useRecords';
import { goalLabel } from '../data/goals';

function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  const now = new Date();
  // Allow the streak to still count if the most recent session was today or yesterday.
  const offsets = [0, 1];
  for (const offset of offsets) {
    let streak = 0;
    const cursor = new Date(now);
    cursor.setDate(cursor.getDate() - offset);
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // Start from today (or yesterday) and count consecutive days present.
    const startIso = iso(cursor);
    if (!set.has(startIso)) continue;
    for (;;) {
      if (set.has(iso(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
  return 0;
}

export default function Dashboard() {
  const { profile } = useProfile();
  const { records, ready: recordsReady } = useRecords();
  const { checkIns, ready: checkInsReady } = useCheckIns();
  const { completedTodayCount } = useAdl();

  const totalMinutes = records.reduce((s, r) => s + r.minutes, 0);
  const daysPracticed = new Set(records.map((r) => r.dateISO)).size;
  const streak = computeStreak(records.map((r) => r.dateISO));
  const recentCheckIns = checkIns.slice(0, 7);

  return (
    <Page title="My progress" backTo="/" readAloudText="Your progress. This shows your activity and adherence, not a medical measure of recovery.">
      <p className="admonition">
        This dashboard shows your <strong>activity and adherence</strong>. It is
        not a medical measure of recovery and does not replace your care team’s
        assessment.
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-icon" aria-hidden="true">🏁</span>
          <span className="stat-number">{recordsReady ? records.length : '…'}</span>
          <span className="stat-label">Sessions completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden="true">⏱️</span>
          <span className="stat-number">{recordsReady ? totalMinutes : '…'}</span>
          <span className="stat-label">Minutes practised</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden="true">📅</span>
          <span className="stat-number">{recordsReady ? daysPracticed : '…'}</span>
          <span className="stat-label">Days practised</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon" aria-hidden="true">🔥</span>
          <span className="stat-number">{recordsReady ? streak : '…'}</span>
          <span className="stat-label">Day streak</span>
        </div>
      </div>

      <section>
        <h2>Today’s routine</h2>
        <p>
          <strong>{completedTodayCount}</strong> routine steps ticked today.
        </p>
      </section>

      <section>
        <h2>My goals</h2>
        {profile.goals.length === 0 ? (
          <p>No goals chosen yet.</p>
        ) : (
          <ul className="summary-list">
            {profile.goals.map((g) => (
              <li key={g}>{goalLabel(g)}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Personalized practice plan</h2>
        <p className="home-links">
          <Link to="/plan">View my practice plan</Link>
          <Link to="/baseline">Retake the practice check</Link>
        </p>
      </section>

      <section>
        <h2>Recent mood & fatigue</h2>
        {!checkInsReady ? (
          <p>Loading…</p>
        ) : recentCheckIns.length === 0 ? (
          <p>No check-ins yet. Try the “Mood & fatigue” activity.</p>
        ) : (
          <ul className="summary-list">
            {recentCheckIns.map((c) => (
              <li key={c.id}>
                {c.dateISO}: mood {c.mood}/10, fatigue {c.fatigue}/10
              </li>
            ))}
          </ul>
        )}
      </section>
    </Page>
  );
}
