import { vi, type Mock } from 'vitest';
import { saveBoardToGoogleDoc, type SaveDocLabels } from './saveToGoogleDoc';
import { captureAllScenesPng } from './captureScenes';
import { createGoogleDocFromHtml } from './driveUpload';
import { getDriveAccessToken } from './googleAuth';
import { listMemos } from '@/features/memo/memoService';

vi.mock('./googleAuth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./googleAuth')>()),
  getDriveAccessToken: vi.fn(),
}));
vi.mock('./captureScenes', () => ({ captureAllScenesPng: vi.fn() }));
vi.mock('./driveUpload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./driveUpload')>()),
  createGoogleDocFromHtml: vi.fn(),
}));
vi.mock('@/features/memo/memoService', () => ({ listMemos: vi.fn() }));

const labels: SaveDocLabels = {
  sceneHeading: (n) => `シーン ${n}`,
  memoSectionHeading: 'メモ',
  untaggedLabel: 'メモ',
  noMemosLabel: 'メモはありません',
};

describe('saveBoardToGoogleDoc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDriveAccessToken as Mock).mockResolvedValue('token-1');
    (captureAllScenesPng as Mock).mockResolvedValue(['data:image/png;base64,img1']);
    (listMemos as Mock).mockResolvedValue([
      {
        id: 'm1',
        text: '前半15分、決定機',
        tags: ['決定機シーン'],
        source: 'manual',
        createdAt: 1750000000000,
        updatedAt: 1750000000000,
      },
    ]);
    (createGoogleDocFromHtml as Mock).mockResolvedValue({
      id: 'doc-1',
      url: 'https://docs.google.com/document/d/doc-1/edit',
    });
  });

  it('認可→画像生成→メモ取得→アップロードの順で実行し、URLを返す', async () => {
    const result = await saveBoardToGoogleDoc('u1', 'p1', 'vs FC東京', labels, 'ja');

    expect(result.url).toBe('https://docs.google.com/document/d/doc-1/edit');
    // 認可ポップアップはユーザー操作直後に出すため最初に呼ぶ
    const tokenOrder = (getDriveAccessToken as Mock).mock.invocationCallOrder[0];
    const captureOrder = (captureAllScenesPng as Mock).mock.invocationCallOrder[0];
    expect(tokenOrder).toBeLessThan(captureOrder);

    const [token, docName, html] = (createGoogleDocFromHtml as Mock).mock.calls[0];
    expect(token).toBe('token-1');
    expect(docName).toContain('vs FC東京'); // プロジェクト名+保存日時
    expect(html).toContain('data:image/png;base64,img1');
    expect(html).toContain('前半15分、決定機');
    expect(html).toContain('決定機シーン');
  });

  it('認可に失敗した場合は後続処理を行わない', async () => {
    (getDriveAccessToken as Mock).mockRejectedValue(new Error('auth failed'));

    await expect(saveBoardToGoogleDoc('u1', 'p1', 't', labels, 'ja')).rejects.toThrow();

    expect(captureAllScenesPng).not.toHaveBeenCalled();
    expect(createGoogleDocFromHtml).not.toHaveBeenCalled();
  });
});
