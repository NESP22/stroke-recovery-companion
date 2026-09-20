import { Link } from 'react-router-dom';
import { Page } from '../components/Page';
import { ModuleCard } from '../components/ModuleCard';
import { MODULES } from '../lib/modules';
import { formatDateLong, greeting } from '../lib/time';

export default function Home() {
  return (
    <Page title={greeting()}>
      <p className="lead">{formatDateLong()}</p>

      <Link className="btn btn-primary btn-lg session-cta" to="/session">
        Start today’s session
      </Link>

      <h2>Practice areas</h2>
      <div className="module-grid">
        {MODULES.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>

      <div className="home-links">
        <Link to="/dashboard">My progress</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/install">Install on iPhone/iPad</Link>
        <Link to="/evidence">Research &amp; evidence</Link>
      </div>
    </Page>
  );
}
