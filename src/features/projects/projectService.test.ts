import { vi, type Mock } from 'vitest';
import { addDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  createProject,
  deleteProject,
  loadProject,
  saveProjectSnapshot,
  updateProjectMeta,
} from './projectService';
import { createInitialSnapshot } from './projectTypes';

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ path: 'users/u1/projects' })),
  doc: vi.fn(() => ({ path: 'users/u1/projects/p1' })),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  Timestamp: class MockTimestamp {},
}));

describe('projectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createProject: 初期スナップショット付きでドキュメントを作成しIDを返す', async () => {
    (addDoc as Mock).mockResolvedValue({ id: 'new-project-id' });

    const id = await createProject('u1', '練習試合', 'futsal');

    expect(id).toBe('new-project-id');
    const payload = (addDoc as Mock).mock.calls[0][1];
    expect(payload.title).toBe('練習試合');
    expect(payload.sportType).toBe('futsal');
    expect(payload.tags).toEqual([]);
    expect(payload.scenes).toHaveLength(1);
    expect(payload.createdAt).toBe('server-timestamp');
  });

  it('loadProject: 存在しない場合はnullを返す', async () => {
    (getDoc as Mock).mockResolvedValue({ exists: () => false });
    expect(await loadProject('u1', 'missing')).toBeNull();
  });

  it('loadProject: メタ情報と正規化済みスナップショットを返す', async () => {
    (getDoc as Mock).mockResolvedValue({
      exists: () => true,
      id: 'p1',
      data: () => ({
        title: 'vs FC東京',
        tags: ['リーグ戦'],
        sportType: 'soccer11',
        scenes: [{ id: 's1', objects: [] }],
      }),
    });

    const project = await loadProject('u1', 'p1');

    expect(project?.meta).toMatchObject({ id: 'p1', title: 'vs FC東京', tags: ['リーグ戦'] });
    expect(project?.snapshot.scenes).toHaveLength(1);
  });

  it('saveProjectSnapshot: merge付きで保存しupdatedAtを更新する', async () => {
    (setDoc as Mock).mockResolvedValue(undefined);
    const snapshot = createInitialSnapshot('soccer11');

    await saveProjectSnapshot('u1', 'p1', snapshot);

    const [, payload, options] = (setDoc as Mock).mock.calls[0];
    expect(payload.updatedAt).toBe('server-timestamp');
    expect(payload.scenes).toEqual(snapshot.scenes);
    expect(options).toEqual({ merge: true });
  });

  it('updateProjectMeta: タイトル・タグを更新できる', async () => {
    (setDoc as Mock).mockResolvedValue(undefined);
    await updateProjectMeta('u1', 'p1', { title: '新タイトル', tags: ['分析'] });
    const [, payload] = (setDoc as Mock).mock.calls[0];
    expect(payload.title).toBe('新タイトル');
    expect(payload.tags).toEqual(['分析']);
  });

  it('deleteProject: ドキュメントを削除する', async () => {
    (deleteDoc as Mock).mockResolvedValue(undefined);
    await deleteProject('u1', 'p1');
    expect(deleteDoc).toHaveBeenCalled();
  });
});
