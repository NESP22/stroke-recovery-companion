import { Link } from 'react-router-dom';
import type { ModuleMeta } from '../lib/modules';

interface Props {
  module: ModuleMeta;
}

export function ModuleCard({ module }: Props) {
  return (
    <Link className="module-card" to={module.path}>
      <span className="module-card-title">{module.title}</span>
      <span className="module-card-desc">{module.description}</span>
      <span className="module-card-meta">About {module.estimateMinutes} minutes</span>
    </Link>
  );
}
