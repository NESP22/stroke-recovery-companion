import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
import { ProfileProvider } from '../context/ProfileContext';
import { memoryStore, setStore } from '../lib/storage';
import { clearSpeechSettings, getSpeechSettings, saveSpeechSettings, speak } from '../lib/speech';
import { mockSpeech, voice } from '../test/speech';
import appStyles from '../index.css?raw';

function renderSettings() {
  return render(<MemoryRouter><ProfileProvider><Settings /></ProfileProvider></MemoryRouter>);
}

beforeEach(() => { localStorage.clear(); clearSpeechSettings(); setStore(memoryStore()); });
afterEach(() => { cleanup(); setStore(null); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Settings read-aloud', () => {
  it('gives both native selectors large touch targets and scalable text', async () => {
    mockSpeech([voice('English')]);
    const style = document.createElement('style');
    style.textContent = appStyles;
    document.head.append(style);
    try {
      renderSettings();
      const controls = await screen.findAllByRole('combobox');
      for (const control of controls) {
        const computed = window.getComputedStyle(control);
        expect(Number.parseFloat(computed.minHeight)).toBeGreaterThanOrEqual(44);
        expect(computed.fontSize).toBe('1rem');
        expect(computed.maxWidth).toBe('100%');
      }
    } finally {
      style.remove();
    }
  });

  it('clears speech choices when clear-all is confirmed, before reloading', async () => {
    const user = userEvent.setup();
    const synth = mockSpeech([voice('English')]);
    saveSpeechSettings({ voiceURI: 'chosen', rate: 0.9 });
    // Hold the async data clear so this test does not navigate/reload jsdom.
    const clear = vi.fn(() => new Promise<void>(() => {}));
    setStore({ ...memoryStore(), clear });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderSettings();
    const button = await screen.findByRole('button', { name: 'Clear all data on this device' });
    await user.click(button);
    expect(getSpeechSettings().voiceURI).toBe('chosen');
    expect(clear).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await user.click(button);
    expect(localStorage.getItem('speech.settings.v1')).toBeNull();
    expect(getSpeechSettings()).toEqual({ voiceURI: null, rate: 1 });
    expect(clear).toHaveBeenCalledOnce();
    expect(synth.cancel).toHaveBeenCalled();
  });

  it('waits for local voices without autoplay and removes its listener on leaving', async () => {
    const synth = mockSpeech();
    const view = renderSettings();
    expect(await screen.findByRole('button', { name: 'Preview voice' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/No on-device English voices/);
    const local = voice('English Enhanced');
    act(() => synth.changeVoices([local]));
    expect(screen.getByRole('option', { name: /English Enhanced/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview voice' })).toBeEnabled();
    expect(synth.speak).not.toHaveBeenCalled();
    const listener = synth.addEventListener.mock.calls.find(([name]) => name === 'voiceschanged')![1];
    view.unmount();
    expect(synth.removeEventListener).toHaveBeenCalledWith('voiceschanged', listener);
    expect(synth.cancel).toHaveBeenCalled();
  });

  it('retains a temporarily unavailable choice and explains the local fallback', async () => {
    const saved = voice('Saved basic');
    saveSpeechSettings({ voiceURI: saved.voiceURI, rate: 1.1 });
    const synth = mockSpeech([voice('English Premium')]);
    renderSettings();
    const picker = await screen.findByRole('combobox', { name: 'Read-aloud voice' });
    expect(picker).toHaveValue(saved.voiceURI);
    expect(screen.getByRole('status')).toHaveTextContent(/saved voice is unavailable/i);
    act(() => synth.changeVoices([saved, voice('English Premium')]));
    expect(picker).toHaveValue(saved.voiceURI);
    expect(screen.getByRole('status')).toHaveTextContent(/Saved basic/);
    expect(screen.getByRole('combobox', { name: 'Read-aloud speed' })).toHaveValue('1.1');
  });

  it('explains when persistence is blocked but still previews the chosen speed', async () => {
    const user = userEvent.setup();
    const synth = mockSpeech([voice('English')]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    renderSettings();
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Read-aloud speed' }), '1.1');
    expect(screen.getByText(/only for this visit/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Preview voice' }));
    expect(synth.speak.mock.calls[0][0].rate).toBe(1.1);
  });

  it('explains unsupported speech without active preview controls', async () => {
    vi.stubGlobal('speechSynthesis', undefined);
    renderSettings();
    expect(await screen.findByRole('status')).toHaveTextContent(/not supported/i);
    expect(screen.getByRole('button', { name: 'Preview voice' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Stop preview' })).toBeDisabled();
  });

  it('offers labelled local voices and modest speeds, with preview and stop', async () => {
    const user = userEvent.setup();
    const basic = voice('English basic', 'en-US');
    const premium = voice('English Premium');
    const synth = mockSpeech([premium, basic, voice('Remote', 'en-GB', false), voice('French', 'fr-FR')]);
    renderSettings();
    const picker = await screen.findByRole('combobox', { name: 'Read-aloud voice' });
    const speed = screen.getByRole('combobox', { name: 'Read-aloud speed' });
    expect(picker).toHaveValue('');
    expect(speed).toHaveValue('1');
    expect(within(speed).getAllByRole('option').map((o) => (o as HTMLOptionElement).value)).toEqual(['0.9', '1', '1.1']);
    expect(within(picker).queryByRole('option', { name: /Remote|French/ })).not.toBeInTheDocument();
    expect(synth.speak).not.toHaveBeenCalled();
    await user.selectOptions(picker, basic.voiceURI);
    await user.selectOptions(speed, '0.9');
    expect(getSpeechSettings()).toEqual({ voiceURI: basic.voiceURI, rate: 0.9 });
    await user.click(screen.getByRole('button', { name: 'Preview voice' }));
    expect(synth.speak.mock.calls[0][0]).toMatchObject({ voice: basic, rate: 0.9 });
    const cancels = synth.cancel.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Stop preview' }));
    expect(synth.cancel).toHaveBeenCalledTimes(cancels + 1);
    speak('A phrase from another screen.');
    expect(synth.speak.mock.calls[1][0]).toMatchObject({ voice: basic, rate: 0.9 });
    await user.selectOptions(picker, '');
    await user.click(screen.getByRole('button', { name: 'Preview voice' }));
    expect(synth.speak.mock.calls[2][0].voice).toBe(premium);
  });
});
