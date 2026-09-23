import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { ModuleCard } from '../components/ModuleCard';
import { MODULES } from '../lib/modules';
import { formatDateLong, greeting } from '../lib/time';

export default function Home() {
  return (
    <Page title={greeting()}>
      <div className="home-hero">
        <p className="home-date">{formatDateLong()}</p>
        <h2 className="home-hero-title">What would you like to do today?</h2>
        <Link className="btn btn-primary btn-lg session-cta" to="/session">
          <span className="cta-icon" aria-hidden="true">
            ▶
          </span>
          Start today’s session
        </Link>
      </div>

      <h2>Practice areas</h2>
      <div className="module-grid">
        {MODULES.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>

      <div className="home-links">
        <Link to="/plan">My practice plan</Link>
        <Link to="/functional">Real-life practice</Link>
        <Link to="/outcome-report">Practice check report</Link>
        <Link to="/dashboard">My progress</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/install">Install on iPhone/iPad</Link>
        <Link to="/evidence">Research &amp; evidence</Link>
      </div>
    </Page>
  );
}
