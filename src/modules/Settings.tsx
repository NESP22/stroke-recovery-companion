import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { Button } from '../components/Button';
import { EvidenceLink } from '../components/EvidenceLink';
import { useProfile } from '../context/ProfileContext';
import { getStore } from '../lib/storage';
import { allowedSessionOptions } from '../lib/sessionPolicy';
import type { Difficulty, FontSize } from '../types';

export default function Settings() {
  const { profile, update } = useProfile();

  const clearAll = async () => {
    const ok = window.confirm(
      'Clear all data on this device? This removes your goals, sessions and check-ins. It cannot be undone.',
    );
    if (!ok) return;
    await getStore().clear();
    sessionStorage.removeItem('session.active.v1');
    window.location.reload();
  };

  return (
    <Page title="Settings" backTo="/">
      <section>
        <h2>Text size</h2>
        <div className="choice-group">
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
              className={`choice-chip ${profile.fontSize === size ? 'is-selected' : ''}`}
              onClick={() => update({ fontSize: size })}
              aria-pressed={profile.fontSize === size}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label className="check-item toggle">
          <input
            type="checkbox"
            checked={profile.highContrast}
            onChange={(e) => update({ highContrast: e.target.checked })}
          />
          <span>High contrast colours</span>
        </label>
        <label className="check-item toggle">
          <input
            type="checkbox"
            checked={profile.reduceMotion}
            onChange={(e) => update({ reduceMotion: e.target.checked })}
          />
          <span>Reduce motion and animations</span>
        </label>
      </section>

      <section>
        <h2>Session defaults</h2>
        <fieldset className="choice-group">
          <legend>Session length</legend>
          {allowedSessionOptions(profile.clinicianConfigured).map((m) => (
            <button
              key={m}
              type="button"
              className={`choice-chip ${profile.sessionMinutes === m ? 'is-selected' : ''}`}
              onClick={() => update({ sessionMinutes: m })}
              aria-pressed={profile.sessionMinutes === m}
            >
              {m} minutes
            </button>
          ))}
        </fieldset>
        <fieldset className="choice-group">
          <legend>Difficulty</legend>
          {(['gentle', 'standard', 'challenging'] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              className={`choice-chip ${profile.difficulty === d ? 'is-selected' : ''}`}
              onClick={() => update({ difficulty: d })}
              aria-pressed={profile.difficulty === d}
            >
              {d === 'gentle' ? 'Gentle' : d === 'standard' ? 'Standard' : 'Challenging'}
            </button>
          ))}
        </fieldset>
      </section>

      <section>
        <h2>iPhone &amp; iPad</h2>
        <p>
          <Link className="settings-link" to="/install">
            Install on the Home Screen
          </Link>
        </p>
      </section>

      <section>
        <h2>Your data</h2>
        <p className="admonition">
          Everything is stored only on this device in your browser (IndexedDB /
          localStorage). No personal data is sent to any server.
        </p>
        <Button variant="danger" onClick={clearAll}>
          Clear all data on this device
        </Button>
      </section>

      <EvidenceLink id="session-policy" />
      <EvidenceLink id="privacy" />
    </Page>
  );
}
