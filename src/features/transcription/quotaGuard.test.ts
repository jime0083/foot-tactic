import { vi } from 'vitest';
import {
  clearQuotaBlock,
  getQuotaBlockedAt,
  isQuotaBlocked,
  setQuotaBlocked,
  QUOTA_BLOCK_STORAGE_KEY,
} from './quotaGuard';
import { transcribeAudio } from './transcribe';
import { TranscriptionError } from './errors';

describe('quotaGuard', () => {
  beforeEach(() => {
    localStorage.removeItem(QUOTA_BLOCK_STORAGE_KEY);
  });

  it('初期状態ではブロックされていない', () => {
    expect(isQuotaBlocked()).toBe(false);
    expect(getQuotaBlockedAt()).toBeNull();
  });

  it('ブロックの設定・解除ができ、localStorageに保持される', () => {
    setQuotaBlocked();
    expect(isQuotaBlocked()).toBe(true);
    expect(getQuotaBlockedAt()).toBeGreaterThan(0);
    expect(localStorage.getItem(QUOTA_BLOCK_STORAGE_KEY)).toBeTruthy();

    clearQuotaBlock();
    expect(isQuotaBlocked()).toBe(false);
  });

  it('壊れた保存値はブロックなしとして扱う', () => {
    localStorage.setItem(QUOTA_BLOCK_STORAGE_KEY, '{broken');
    expect(isQuotaBlocked()).toBe(false);
  });
});

describe('transcribeAudio クォータブロック統合', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.removeItem(QUOTA_BLOCK_STORAGE_KEY);
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const settings = { provider: 'gemini' as const, geminiKey: 'k', openaiKey: '' };
  const audio = new Blob(['x'], { type: 'audio/webm' });

  it('クォータ超過(429)を検知するとブロックが記録される', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, text: async () => 'quota' });

    const error = await transcribeAudio(audio, settings).catch((e: unknown) => e);

    expect((error as TranscriptionError).kind).toBe('quota');
    expect(isQuotaBlocked()).toBe(true);
  });

  it('ブロック中はAPIを呼ばずにquotaエラーを返す', async () => {
    setQuotaBlocked();

    const error = await transcribeAudio(audio, settings).catch((e: unknown) => e);

    expect((error as TranscriptionError).kind).toBe('quota');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('quota以外のエラーではブロックしない', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => 'bad key' });

    await transcribeAudio(audio, settings).catch(() => undefined);

    expect(isQuotaBlocked()).toBe(false);
  });
});
