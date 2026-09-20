/**
 * Always-visible emergency guidance for NEW stroke symptoms.
 * This is static safety information — it is not personalised advice.
 */
export function EmergencyBanner() {
  return (
    <aside className="emergency-banner" aria-label="Emergency information">
      <strong>If you see new stroke signs, act FAST.</strong>
      <ul className="fast-list">
        <li>
          <strong>F</strong>ace — is one side drooping?
        </li>
        <li>
          <strong>A</strong>rms — can they raise both arms?
        </li>
        <li>
          <strong>S</strong>peech — is it slurred or strange?
        </li>
        <li>
          <strong>T</strong>ime — call your emergency number now.
        </li>
      </ul>
      <p className="emergency-call">
        Call emergency services immediately (999, 911 or 112). Do not wait.
      </p>
    </aside>
  );
}
