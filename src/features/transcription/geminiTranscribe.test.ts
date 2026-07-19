import { vi } from 'vitest';
import { blobToBase64, transcribeWithGemini } from './geminiTranscribe';
import { TranscriptionError } from './errors';
import { transcribeAudio } from './transcribe';

const fetchMock = vi.fn();

describe('blobToBase64', () => {
  it('Blobをdata:プレフィックスなしのBase64へ変換する', async () => {
    const base64 = await blobToBase64(new Blob(['hello'], { type: 'audio/webm' }));
    expect(base64).toBe(btoa('hello'));
  });
});

describe('transcribeWithGemini', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const audio = new Blob(['audio-data'], { type: 'audio/webm' });

  it('音声をinline_dataとして送信し、文字起こし結果を返す', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '前半15分、決定機。' }] } }],
      }),
    });

    const text = await transcribeWithGemini(audio, 'test-key');

    expect(text).toBe('前半15分、決定機。');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('generativelanguage.googleapis.com');
    expect(url).toContain('key=test-key');
    const body = JSON.parse(options.body as string);
    expect(body.contents[0].parts[1].inline_data.mime_type).toBe('audio/webm');
    expect(body.contents[0].parts[1].inline_data.data).toBe(btoa('audio-data'));
  });

  it('429はquotaエラーとして分類される', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429, text: async () => 'quota exceeded' });

    const error = await transcribeWithGemini(audio, 'k').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(TranscriptionError);
    expect((error as TranscriptionError).kind).toBe('quota');
  });

  it('401/403はauthエラーとして分類される', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403, text: async () => 'invalid key' });
    const error = await transcribeWithGemini(audio, 'k').catch((e: unknown) => e);
    expect((error as TranscriptionError).kind).toBe('auth');
  });

  it('接続失敗はnetworkエラーとして分類される', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await transcribeWithGemini(audio, 'k').catch((e: unknown) => e);
    expect((error as TranscriptionError).kind).toBe('network');
  });

  it('結果が空の場合はotherエラーになる', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ candidates: [] }) });
    const error = await transcribeWithGemini(audio, 'k').catch((e: unknown) => e);
    expect((error as TranscriptionError).kind).toBe('other');
  });
});

describe('transcribeAudio(ディスパッチャ)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('APIキー未登録の場合はauthエラーを投げる', async () => {
    const error = await transcribeAudio(new Blob(['x']), {
      provider: 'gemini',
      geminiKey: '',
      openaiKey: '',
    }).catch((e: unknown) => e);
    expect((error as TranscriptionError).kind).toBe('auth');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('geminiプロバイダの場合はGemini APIを呼ぶ', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }),
    });

    const text = await transcribeAudio(new Blob(['x'], { type: 'audio/webm' }), {
      provider: 'gemini',
      geminiKey: 'gk',
      openaiKey: '',
    });

    expect(text).toBe('ok');
    expect(fetchMock.mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
  });
});
