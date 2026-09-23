import { vi } from 'vitest';

export function voice(
  name: string,
  lang = 'en-GB',
  localService = true,
  isDefault = false,
): SpeechSynthesisVoice {
  return { name, lang, localService, default: isDefault, voiceURI: `${lang}:${name}` };
}

export function mockSpeech(initialVoices: SpeechSynthesisVoice[] = []) {
  let voices = initialVoices;
  const events = new EventTarget();
  const synth = {
    getVoices: vi.fn(() => voices),
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: vi.fn(events.addEventListener.bind(events)),
    removeEventListener: vi.fn(events.removeEventListener.bind(events)),
  };
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text: string;
    rate = 1;
    lang = '';
    voice: SpeechSynthesisVoice | null = null;
    constructor(text: string) { this.text = text; }
  });
  return {
    ...synth,
    changeVoices(next: SpeechSynthesisVoice[]) {
      voices = next;
      events.dispatchEvent(new Event('voiceschanged'));
    },
  };
}
