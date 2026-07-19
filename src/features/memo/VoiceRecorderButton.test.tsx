import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { VoiceRecorderButton } from './VoiceRecorderButton';
import { AI_SETTINGS_STORAGE_KEY, saveAiSettings } from '@/features/transcription/aiSettings';

/** テスト用のMediaRecorderモック */
class FakeMediaRecorder {
  static isTypeSupported = () => true;
  mimeType = 'audio/webm';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  start() {}

  stop() {
    this.ondataavailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
}

const getUserMedia = vi.fn();

function renderButton(onAudioReady = vi.fn()) {
  render(
    <MemoryRouter>
      <VoiceRecorderButton onAudioReady={onAudioReady} />
    </MemoryRouter>,
  );
  return onAudioReady;
}

describe('VoiceRecorderButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia },
      configurable: true,
    });
    getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('APIキー未登録で押すと設定画面への誘導が表示される', async () => {
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: /音声メモ/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('APIキーが未登録');
    expect(screen.getByRole('link', { name: '設定を開く' })).toHaveAttribute('href', '/settings');
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('キー登録済みなら録音を開始し、停止で音声がコールバックされる', async () => {
    saveAiSettings({ provider: 'gemini', geminiKey: 'test-key' });
    const onAudioReady = renderButton();

    await userEvent.click(screen.getByRole('button', { name: /音声メモ/ }));
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(screen.getByRole('status')).toHaveTextContent('録音中');

    await userEvent.click(screen.getByRole('button', { name: /録音停止/ }));
    expect(onAudioReady).toHaveBeenCalledTimes(1);
    expect(onAudioReady.mock.calls[0][0]).toBeInstanceOf(Blob);
  });

  it('マイク権限が拒否された場合はエラーメッセージを表示する', async () => {
    saveAiSettings({ provider: 'gemini', geminiKey: 'test-key' });
    const error = new DOMException('denied', 'NotAllowedError');
    getUserMedia.mockRejectedValue(error);
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: /音声メモ/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('マイクの使用が許可されていません');
  });

  it('録音非対応ブラウザではその旨を表示する', async () => {
    saveAiSettings({ provider: 'gemini', geminiKey: 'test-key' });
    vi.stubGlobal('MediaRecorder', undefined);
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: /音声メモ/ }));

    expect(screen.getByRole('alert')).toHaveTextContent('録音がサポートされていません');
  });
});
