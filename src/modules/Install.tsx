import { useMemo } from 'react';
import { Page } from '../components/Page';
import { EvidenceLink } from '../components/EvidenceLink';
import { getPlatformState } from '../lib/platform';

export default function Install() {
  const state = useMemo(() => getPlatformState(), []);

  return (
    <Page title="Install on iPhone or iPad" backTo="/">
      {state.standalone ? (
        <p className="admonition">
          You are already using the installed Home Screen version.
        </p>
      ) : (
        <>
          <p className="lead">
            For the most reliable offline and local-storage experience, add this app to the Home Screen.
          </p>
          <ol className="install-steps">
            <li>Open this page in <strong>Safari</strong> on the iPhone or iPad.</li>
            <li>Tap the <strong>Share</strong> button.</li>
            <li>Choose <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong>, then open Stroke Recovery from the new Home Screen icon.</li>
          </ol>
        </>
      )}

      {!state.appleTouch && !state.standalone && (
        <p className="muted">
          These steps are specifically for iPhone and iPad. The app still works in other modern browsers.
        </p>
      )}

      <section>
        <h2>Why install it?</h2>
        <p>
          The installed web app can reopen like an app, keeps the interface focused, and is the preferred Apple experience for offline use and durable local data.
        </p>
        <p>
          Installation does not upload your information. This version stores app data only on this device.
        </p>
      </section>

      <section>
        <h2>Apple limitations</h2>
        <p>
          Voice input uses the iPhone/iPad keyboard microphone when available. This app does not use browser speech recognition. Push reminders are not enabled in this version.
        </p>
      </section>

      <EvidenceLink id="apple-platform" />
    </Page>
  );
}
