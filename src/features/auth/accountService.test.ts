import { vi, type Mock } from 'vitest';
import { reauthenticateWithPopup } from 'firebase/auth';
import { deleteDoc, getDocs } from 'firebase/firestore';
import { AccountError, deleteAccount, deleteUserData } from './accountService';
import { auth } from '@/lib/firebase';

vi.mock('@/lib/firebase', () => ({ db: {}, auth: { currentUser: null } }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, ...segments: string[]) => ({ path: segments.join('/') })),
  doc: vi.fn((_db, ...segments: string[]) => ({ path: segments.join('/') })),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
}));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  reauthenticateWithPopup: vi.fn(),
}));

describe('deleteUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('memos → projects → ユーザードキュメントの順に削除する', async () => {
    (getDocs as Mock)
      .mockResolvedValueOnce({
        docs: [
          { id: 'p1', ref: 'ref-p1' },
          { id: 'p2', ref: 'ref-p2' },
        ],
      }) // projects
      .mockResolvedValueOnce({ docs: [{ ref: 'ref-m1' }, { ref: 'ref-m2' }] }) // p1 memos
      .mockResolvedValueOnce({ docs: [] }); // p2 memos
    (deleteDoc as Mock).mockResolvedValue(undefined);

    await deleteUserData('u1');

    // memos 2件 + projects 2件 + user 1件 = 5回
    expect(deleteDoc).toHaveBeenCalledTimes(5);
    const deletedRefs = (deleteDoc as Mock).mock.calls.map((call) => call[0]);
    expect(deletedRefs).toContain('ref-m1');
    expect(deletedRefs).toContain('ref-p1');
    expect(
      deletedRefs.some((ref: unknown) => (ref as { path?: string })?.path === 'users/u1'),
    ).toBe(true);
  });
});

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('再認証→データ削除→ユーザー削除を順に行う', async () => {
    const deleteUser = vi.fn().mockResolvedValue(undefined);
    (auth as { currentUser: unknown }).currentUser = { uid: 'u1', delete: deleteUser };
    (reauthenticateWithPopup as Mock).mockResolvedValue({});
    (getDocs as Mock).mockResolvedValue({ docs: [] }); // projectsなし
    (deleteDoc as Mock).mockResolvedValue(undefined);

    await deleteAccount();

    expect(reauthenticateWithPopup).toHaveBeenCalled();
    expect(deleteDoc).toHaveBeenCalled(); // ユーザードキュメント削除
    expect(deleteUser).toHaveBeenCalled();
    // 再認証はデータ削除より先
    expect((reauthenticateWithPopup as Mock).mock.invocationCallOrder[0]).toBeLessThan(
      (deleteUser as Mock).mock.invocationCallOrder[0],
    );
  });

  it('未ログインの場合はno-userエラー', async () => {
    (auth as { currentUser: unknown }).currentUser = null;
    const error = await deleteAccount().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AccountError);
    expect((error as AccountError).kind).toBe('no-user');
  });

  it('再認証をキャンセルした場合はcancelledエラーで、削除は行われない', async () => {
    const deleteUser = vi.fn();
    (auth as { currentUser: unknown }).currentUser = { uid: 'u1', delete: deleteUser };
    (reauthenticateWithPopup as Mock).mockRejectedValue({ code: 'auth/popup-closed-by-user' });

    const error = await deleteAccount().catch((e: unknown) => e);

    expect((error as AccountError).kind).toBe('cancelled');
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
