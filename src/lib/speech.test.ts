import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockSpeech, voice } from '../test/speech';

let speech: typeof import('./speech');
beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  speech = await import('./speech');
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('read-aloud', () => {
  it.each([
    '{broken', 'null', '[]', '42', '"text"', '{}',
    '{"voiceURI":42,"rate":99}',
    '{"voiceURI":"","rate":"0.9"}',
    '{"voiceURI":false,"rate":-1}',
  ])('uses safe defaults for invalid stored settings: %s', (saved) => {
    localStorage.setItem('speech.settings.v1', saved);
    const local = voice('English');
    const synth = mockSpeech([local]);
    expect(speech.getSpeechSettings()).toEqual({ voiceURI: null, rate: 1 });
    speech.speak('Hello.');
    expect(synth.speak.mock.calls[0][0]).toMatchObject({ voice: local, rate: 1 });
  });

  it('can read aloud when access to localStorage is denied', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('Blocked'); });
    const synth = mockSpeech([voice('English')]);
    expect(() => speech.speak('Hello.')).not.toThrow();
    expect(synth.speak.mock.calls[0][0].rate).toBe(1);
  });
  it('persists only voice and speed locally for a later app load', async () => {
    const settings = { voiceURI: 'en-US:US basic', rate: 1.1 };
    expect(speech.saveSpeechSettings(settings)).toBe(true);
    expect(JSON.parse(localStorage.getItem('speech.settings.v1')!)).toEqual(settings);
    vi.resetModules();
    const reloaded = await import('./speech');
    expect(reloaded.getSpeechSettings()).toEqual(settings);
  });

  it.each(['blocked', 'quota'])('keeps choices in memory when storage is %s', (reason) => {
    if (reason === 'blocked') {
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('Blocked'); });
    } else {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    }
    const selected = voice('Basic');
    const synth = mockSpeech([voice('Premium'), selected]);
    expect(speech.saveSpeechSettings({ voiceURI: selected.voiceURI, rate: 0.9 })).toBe(false);
    speech.speak('Hello.');
    expect(synth.speak.mock.calls[0][0]).toMatchObject({ voice: selected, rate: 0.9 });
  });

  it('validates values before saving and does not persist extra fields', () => {
    speech.saveSpeechSettings({ voiceURI: null, rate: Number.NaN, extra: 'not saved' } as unknown as import('./speech').SpeechSettings);
    expect(JSON.parse(localStorage.getItem('speech.settings.v1')!)).toEqual({ voiceURI: null, rate: 1 });
  });

  it('clears persisted and in-memory speech choices without touching other keys', () => {
    localStorage.setItem('unrelated', 'keep');
    speech.saveSpeechSettings({ voiceURI: 'chosen', rate: 0.9 });
    speech.clearSpeechSettings();
    expect(localStorage.getItem('speech.settings.v1')).toBeNull();
    expect(speech.getSpeechSettings()).toEqual({ voiceURI: null, rate: 1 });
    expect(localStorage.getItem('unrelated')).toBe('keep');
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('Blocked'); });
    speech.saveSpeechSettings({ voiceURI: 'chosen', rate: 0.9 });
    expect(() => speech.clearSpeechSettings()).not.toThrow();
    expect(speech.getSpeechSettings()).toEqual({ voiceURI: null, rate: 1 });
  });

  const enhanced = voice('English Enhanced');
  const premium = voice('English Premium', 'en-AU');
  const uk = voice('UK basic');
  const us = voice('US basic', 'en-US');
  const defaultEnglish = voice('Default English', 'en-CA', true, true);
  it.each([
    { voices: [enhanced, premium, uk], expected: premium },
    { voices: [us, uk, defaultEnglish], expected: defaultEnglish },
    { voices: [us, uk], expected: uk },
    { voices: [voice('French', 'fr-FR'), us], expected: us },
  ])('chooses the best safe English fallback: $expected.name', ({ voices, expected }) => {
    const synth = mockSpeech(voices);
    speech.speak('Hello.');
    expect(synth.speak.mock.calls[0][0].voice).toBe(expected);
  });

  it.each([
    { voices: [] },
    { voices: [voice('Remote English Premium', 'en-GB', false, true)] },
    { voices: [voice('French', 'fr-FR')] },
  ])('does not delegate to an unknown default when no local English voice exists: $voices', ({ voices }) => {
    const synth = mockSpeech(voices);
    speech.speak('Hello.');
    expect(synth.speak).not.toHaveBeenCalled();
  });
  it.each([0.9, 1.1])('honours the saved local voice and speed %s in all speak calls', (rate) => {
    localStorage.setItem('speech.settings.v1', JSON.stringify({ voiceURI: us.voiceURI, rate }));
    const synth = mockSpeech([premium, us]);
    speech.speak('First.');
    speech.speak('Next.');
    for (const [utterance] of synth.speak.mock.calls) {
      expect(utterance).toMatchObject({ voice: us, lang: us.lang, rate });
    }
    expect(synth.speak).toHaveBeenCalledTimes(2);
  });

  it('falls back without losing a saved voice that becomes available later', () => {
    localStorage.setItem('speech.settings.v1', JSON.stringify({ voiceURI: us.voiceURI, rate: 0.9 }));
    const synth = mockSpeech([premium]);
    speech.speak('First.');
    expect(synth.speak.mock.calls[0][0]).toMatchObject({ voice: premium, rate: 0.9 });
    synth.changeVoices([premium, us]);
    speech.speak('Next.');
    expect(synth.speak.mock.calls[1][0].voice).toBe(us);
  });

  it('never uses a saved remote voice', () => {
    const remote = voice('Remote Premium', 'en-GB', false);
    localStorage.setItem('speech.settings.v1', JSON.stringify({ voiceURI: remote.voiceURI, rate: 1.1 }));
    const synth = mockSpeech([remote, us]);
    speech.speak('Hello.');
    expect(synth.speak.mock.calls[0][0]).toMatchObject({ voice: us, rate: 1.1 });
  });

  it.each(['Enhanced', 'Premium'])('prefers a local English %s voice at natural speed', (quality) => {
    const preferred = voice(`English (${quality})`, 'en-US');
    const synth = mockSpeech([
      voice('Remote Premium', 'en-GB', false, true),
      voice('French Premium', 'fr-FR'),
      voice('English standard', 'en-GB', true, true),
      preferred,
    ]);
    speech.speak('Take your time.');
    expect(synth.speak).toHaveBeenCalledOnce();
    expect(synth.speak.mock.calls[0][0]).toMatchObject({
      text: 'Take your time.', voice: preferred, lang: 'en-US', rate: 1,
    });
    expect(synth.cancel.mock.invocationCallOrder[0]).toBeLessThan(synth.speak.mock.invocationCallOrder[0]);
  });
});
