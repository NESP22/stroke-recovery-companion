import { useEffect, useState } from 'react';
import { Button } from './Button';
import {
  getLocalEnglishVoices, getSpeechSettings, saveSpeechSettings,
  selectSpeechVoice, speak, speechSupported, stopSpeaking, type SpeechSettings,
} from '../lib/speech';

export function ReadAloudSettings() {
  const [settings, setSettings] = useState(getSpeechSettings);
  const [voices, setVoices] = useState(getLocalEnglishVoices);
  const [saved, setSaved] = useState(true);
  const supported = speechSupported();
  const selected = selectSpeechVoice(voices, settings.voiceURI);
  const missing = settings.voiceURI !== null && !voices.some((voice) => voice.voiceURI === settings.voiceURI);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const refresh = () => setVoices(getLocalEnglishVoices());
    synth.addEventListener('voiceschanged', refresh);
    refresh();
    return () => {
      synth.removeEventListener('voiceschanged', refresh);
      synth.cancel();
    };
  }, [supported]);

  const change = (next: SpeechSettings) => {
    setSaved(saveSpeechSettings(next));
    setSettings(next);
  };

  return (
    <section aria-labelledby="read-aloud-heading">
      <h2 id="read-aloud-heading">Read-aloud</h2>
      <p id="voice-help">
        Only on-device English voices are used. Automatic prefers voices labelled
        Premium or Enhanced when available. Try a preview to find one you like.
      </p>
      <label className="settings-field" htmlFor="read-aloud-voice">Read-aloud voice</label>
      <select
        id="read-aloud-voice"
        className="settings-select"
        aria-describedby="voice-help voice-status"
        disabled={!supported}
        value={settings.voiceURI ?? ''}
        onChange={(e) => change({ ...settings, voiceURI: e.target.value || null })}
      >
        <option value="">Automatic (on-device English)</option>
        {missing && <option value={settings.voiceURI!} disabled>Saved voice (unavailable)</option>}
        {voices.map((voice) => (
          <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} — {voice.lang}</option>
        ))}
      </select>
      <label className="settings-field" htmlFor="read-aloud-speed">Read-aloud speed</label>
      <select
        id="read-aloud-speed"
        className="settings-select"
        disabled={!supported}
        value={settings.rate}
        onChange={(e) => change({ ...settings, rate: Number(e.target.value) })}
      >
        <option value="0.9">A little slower (0.9×)</option>
        <option value="1">Natural (1.0×)</option>
        <option value="1.1">A little faster (1.1×)</option>
      </select>
      <p id="voice-status" role="status">
        {!supported ? 'Read-aloud is not supported in this browser.'
          : !selected ? 'No on-device English voices are ready. Wait a moment or check your device voice settings, then try again.'
          : `${missing ? 'Your saved voice is unavailable. Using an on-device fallback: ' : 'Using: '}${selected.name} — ${selected.lang}.`}
      </p>
      {!saved && <p role="status">Your voice choices work only for this visit because browser storage is unavailable.</p>}
      <div className="button-row">
        <Button disabled={!selected} onClick={() => speak('Take your time. We can practise one step at a time.')}>
          Preview voice
        </Button>
        <Button variant="secondary" disabled={!supported} onClick={stopSpeaking}>Stop preview</Button>
      </div>
      <p className="muted">
        On iPad, voice quality depends on the voices Safari makes available.
        Downloaded voices may not all appear here.
      </p>
    </section>
  );
}
