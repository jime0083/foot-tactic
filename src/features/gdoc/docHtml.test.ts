import { vi } from 'vitest';
import { buildDocHtml, escapeHtml } from './docHtml';
import { createGoogleDocFromHtml, DriveUploadError } from './driveUpload';

describe('escapeHtml', () => {
  it('HTML特殊文字をエスケープする', () => {
    expect(escapeHtml('<b>"A&B"</b>')).toBe('&lt;b&gt;&quot;A&amp;B&quot;&lt;/b&gt;');
  });
});

describe('buildDocHtml', () => {
  const baseParams = {
    title: 'vs FC東京',
    sceneHeading: (n: number) => `シーン ${n}`,
    memoSectionHeading: 'メモ',
    untaggedLabel: 'メモ',
    noMemosLabel: 'メモはありません',
  };

  it('タイトル→シーン画像→メモ一覧の順で組み立てる', () => {
    const html = buildDocHtml({
      ...baseParams,
      sceneImages: ['data:image/png;base64,img1', 'data:image/png;base64,img2'],
      memos: [
        { text: '前半15分、決定機', tags: ['決定機シーン'], createdAtLabel: '2026/7/20 12:00' },
      ],
    });

    expect(html).toContain('<h1>vs FC東京</h1>');
    expect(html.indexOf('<h1>')).toBeLessThan(html.indexOf('シーン 1'));
    expect(html).toContain('<h2>シーン 1</h2>');
    expect(html).toContain('<h2>シーン 2</h2>');
    expect(html).toContain('src="data:image/png;base64,img1"');
    expect(html).toContain('<h3>決定機シーン</h3>');
    expect(html).toContain('<p>前半15分、決定機</p>');
    expect(html).toContain('2026/7/20 12:00');
    // メモ一覧はシーン画像の後
    expect(html.indexOf('シーン 2')).toBeLessThan(html.indexOf('決定機シーン'));
  });

  it('複数タグは見出しに連結され、タグなしは既定見出しになる', () => {
    const html = buildDocHtml({
      ...baseParams,
      sceneImages: [],
      memos: [
        { text: 'a', tags: ['前半', 'フォーメーション'], createdAtLabel: 'd1' },
        { text: 'b', tags: [], createdAtLabel: 'd2' },
      ],
    });
    expect(html).toContain('<h3>前半 / フォーメーション</h3>');
    expect(html).toContain('<h3>メモ</h3>');
  });

  it('メモ本文はエスケープされ、改行は<br>になる', () => {
    const html = buildDocHtml({
      ...baseParams,
      sceneImages: [],
      memos: [{ text: '<script>1行目\n2行目', tags: [], createdAtLabel: 'd' }],
    });
    expect(html).toContain('&lt;script&gt;1行目<br>2行目');
    expect(html).not.toContain('<script>');
  });

  it('メモがない場合は案内文を出す', () => {
    const html = buildDocHtml({ ...baseParams, sceneImages: [], memos: [] });
    expect(html).toContain('メモはありません');
  });
});

describe('createGoogleDocFromHtml', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('multipartでアップロードしドキュメントURLを返す', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: 'doc-123' }) });

    const result = await createGoogleDocFromHtml(
      'token-1',
      'vs FC東京 2026-07-20',
      '<html></html>',
    );

    expect(result.id).toBe('doc-123');
    expect(result.url).toBe('https://docs.google.com/document/d/doc-123/edit');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('uploadType=multipart');
    expect(options.headers.Authorization).toBe('Bearer token-1');
    expect(options.headers['Content-Type']).toContain('multipart/related');
    expect(options.body).toContain('application/vnd.google-apps.document');
    expect(options.body).toContain('vs FC東京 2026-07-20');
  });

  it('401はauthエラーとして分類される', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => 'unauthorized' });
    const error = await createGoogleDocFromHtml('t', 'n', 'h').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DriveUploadError);
    expect((error as DriveUploadError).kind).toBe('auth');
  });

  it('接続失敗はnetworkエラーとして分類される', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await createGoogleDocFromHtml('t', 'n', 'h').catch((e: unknown) => e);
    expect((error as DriveUploadError).kind).toBe('network');
  });
});
