import { vi, type Mock } from 'vitest';
import { signInWithPopup, signOut } from 'firebase/auth';
import { signInWithGoogle, signOutUser, isPopupCancelledError } from './authService';
import { ensureUserDocument } from './userDocument';

vi.mock('@/lib/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('./userDocument', () => ({ ensureUserDocument: vi.fn() }));

const mockUser = { uid: 'test-uid' };

describe('signInWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ポップアップでログインしユーザードキュメントを作成する', async () => {
    (signInWithPopup as Mock).mockResolvedValue({ user: mockUser });
    (ensureUserDocument as Mock).mockResolvedValue(undefined);

    const user = await signInWithGoogle();

    expect(user).toBe(mockUser);
    expect(ensureUserDocument).toHaveBeenCalledWith(mockUser);
  });

  it('ユーザードキュメント作成に失敗してもログインは成立する', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (signInWithPopup as Mock).mockResolvedValue({ user: mockUser });
    (ensureUserDocument as Mock).mockRejectedValue(new Error('permission-denied'));

    const user = await signInWithGoogle();

    expect(user).toBe(mockUser);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('ポップアップ失敗時はエラーを送出する', async () => {
    (signInWithPopup as Mock).mockRejectedValue(new Error('network-error'));

    await expect(signInWithGoogle()).rejects.toThrow('network-error');
    expect(ensureUserDocument).not.toHaveBeenCalled();
  });
});

describe('signOutUser', () => {
  it('Firebaseのsignoutを呼び出す', async () => {
    (signOut as Mock).mockResolvedValue(undefined);
    await signOutUser();
    expect(signOut).toHaveBeenCalled();
  });
});

describe('isPopupCancelledError', () => {
  it('ユーザーによるポップアップキャンセルを判定できる', () => {
    expect(isPopupCancelledError({ code: 'auth/popup-closed-by-user' })).toBe(true);
    expect(isPopupCancelledError({ code: 'auth/cancelled-popup-request' })).toBe(true);
    expect(isPopupCancelledError({ code: 'auth/network-request-failed' })).toBe(false);
    expect(isPopupCancelledError(new Error('other'))).toBe(false);
    expect(isPopupCancelledError(null)).toBe(false);
  });
});
