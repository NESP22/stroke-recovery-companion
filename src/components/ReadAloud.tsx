import { useState } from 'react';
import { speak, speechSupported, stopSpeaking } from '../lib/speech';

interface Props {
  text: string;
  label?: string;
}

/** Accessible read-aloud toggle. No audio leaves the device. */
export function ReadAloud({ text, label }: Props) {
  const [speaking, setSpeaking] = useState(false);

  if (!speechSupported()) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      speak(text);
      setSpeaking(true);
      // Reset state when the utterance ends.
      window.setTimeout(() => setSpeaking(false), 1000 + text.length * 120);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-secondary btn-md read-aloud"
      onClick={toggle}
      aria-pressed={speaking}
      aria-label={speaking ? 'Stop reading aloud' : (label ?? 'Read this aloud')}
    >
      <span aria-hidden="true">{speaking ? '⏹' : '🔊'}</span>
      <span>{speaking ? 'Stop' : 'Listen'}</span>
    </button>
  );
}
