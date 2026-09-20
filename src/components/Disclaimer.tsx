/** Global disclaimer — shown on every screen. */
export function Disclaimer() {
  return (
    <footer className="disclaimer">
      <p>
        <strong>Not a medical device and not medical advice.</strong> This app is a
        companion to clinician-directed stroke rehabilitation. It does not diagnose,
        treat or replace professional care. Always follow your care team’s plan.
      </p>
      <p className="disclaimer-privacy">
        Privacy: everything you do stays on this device. Nothing is sent to a server.
      </p>
    </footer>
  );
}
