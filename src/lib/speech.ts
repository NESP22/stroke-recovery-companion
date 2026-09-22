// Optional read-aloud using the browser's built-in speech synthesis.
// Only voices the browser reports as local are eligible; never use its implicit default.

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
    && typeof window.SpeechSynthesisUtterance === 'function';
}

function voiceScore(voice: SpeechSynthesisVoice): number {
  const quality = /\bpremium\b/i.test(voice.name) ? 20 : /\benhanced\b/i.test(voice.name) ? 10 : 0;
  return quality + (voice.default ? 2 : 0) + (voice.lang.toLowerCase() === 'en-gb' ? 1 : 0);
}

export function getLocalEnglishVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  return window.speechSynthesis.getVoices()
    .filter((voice) => voice.localService === true && /^en(?:-|$)/i.test(voice.lang))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

const SETTINGS_KEY = 'speech.settings.v1';
export interface SpeechSettings {
  voiceURI: string | null;
  rate: number;
}

function validateSettings(value: unknown): SpeechSettings {
  const settings = value && typeof value === 'object' ? value as Partial<SpeechSettings> : {};
  return {
    voiceURI: typeof settings.voiceURI === 'string' && settings.voiceURI.length > 0
      ? settings.voiceURI : null,
    rate: settings.rate === 0.9 || settings.rate === 1.1 ? settings.rate : 1,
  };
}

// Retain this session's choices even if private browsing blocks persistence.
let sessionSettings: SpeechSettings | undefined;

export function getSpeechSettings(): SpeechSettings {
  if (sessionSettings) return { ...sessionSettings };
  try {
    return validateSettings(JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? 'null'));
  } catch {
    return validateSettings(null);
  }
}

/** Returns false when choices can only be kept for this app session. */
export function saveSpeechSettings(settings: SpeechSettings): boolean {
  sessionSettings = validateSettings(settings);
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(sessionSettings));
    return true;
  } catch {
    return false;
  }
}

export function clearSpeechSettings(): void {
  sessionSettings = undefined;
  try {
    window.localStorage.removeItem(SETTINGS_KEY);
  } catch {
    // Storage may be blocked; still discard the in-memory preference.
  }
}

export function selectSpeechVoice(
  voices: SpeechSynthesisVoice[],
  voiceURI: string | null,
): SpeechSynthesisVoice | undefined {
  return voices.find((voice) => voice.voiceURI === voiceURI) ?? voices[0];
}

export function speak(text: string): void {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const settings = getSpeechSettings();
  const voice = selectSpeechVoice(getLocalEnglishVoices(), settings.voiceURI);
  // Never leave voice unset: the browser's default could use a remote service.
  // If voices are still loading, the user can tap again once they are available.
  if (!voice) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.rate = settings.rate;
  utterance.lang = voice.lang;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
}
