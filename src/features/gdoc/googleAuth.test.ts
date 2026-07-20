import { vi, type Mock } from 'vitest';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import {
  clearCachedDriveToken,
  getDriveAccessToken,
  GoogleDocsAuthError,
  DRIVE_FILE_SCOPE,
} from './googleAuth';
import { auth } from '@/lib/firebase';

vi.mock('@/lib/firebase', () => ({ auth: { currentUser: { uid: 'u1' } } }));
vi.mock('firebase/auth', () => {
  class MockGoogleAuthProvider {
    static credentialFromResult = vi.fn();
    scopes: string[] = [];
    addScope(scope: string) {
      this.scopes.push(scope);
    }
  }
  return {
    GoogleAuthProvider: MockGoogleAuthProvider,
    reauthenticateWithPopup: vi.fn(),
  };
});

const credentialFromResult = GoogleAuthProvider.credentialFromResult as Mock;

describe('getDriveAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCachedDriveToken();
    (auth as { currentUser: unknown }).currentUser = { uid: 'u1' };
  });

  it('再認証ポップアップでdrive.fileスコープのトークンを取得する', async () => {
    (reauthenticateWithPopup as Mock).mockResolvedValue({ user: { uid: 'u1' } });
    credentialFromResult.mockReturnValue({ accessToken: 'token-1' });

    const token = await getDriveAccessToken(1000);

    expect(token).toBe('token-1');
    const provider = (reauthenticateWithPopup as Mock).mock.calls[0][1] as {
      scopes: string[];
    };
    expect(provider.scopes).toEqual([DRIVE_FILE_SCOPE]);
  });

  it('有効期限内はキャッシュを返し、ポップアップを再表示しない', async () => {
    (reauthenticateWithPopup as Mock).mockResolvedValue({});
    credentialFromResult.mockReturnValue({ accessToken: 'token-1' });

    await getDriveAccessToken(1000);
    const token = await getDriveAccessToken(2000);

    expect(token).toBe('token-1');
    expect(reauthenticateWithPopup).toHaveBeenCalledTimes(1);
  });

  it('期限切れの場合は再度認可を要求する', async () => {
    (reauthenticateWithPopup as Mock).mockResolvedValue({});
    credentialFromResult
      .mockReturnValueOnce({ accessToken: 'token-1' })
      .mockReturnValueOnce({ accessToken: 'token-2' });

    await getDriveAccessToken(0);
    const token = await getDriveAccessToken(51 * 60 * 1000);

    expect(token).toBe('token-2');
    expect(reauthenticateWithPopup).toHaveBeenCalledTimes(2);
  });

  it('未ログインの場合はno-userエラーを投げる', async () => {
    (auth as { currentUser: unknown }).currentUser = null;

    const error = await getDriveAccessToken().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(GoogleDocsAuthError);
    expect((error as GoogleDocsAuthError).kind).toBe('no-user');
  });

  it('ポップアップを閉じた場合はcancelledエラーになる', async () => {
    (reauthenticateWithPopup as Mock).mockRejectedValue({ code: 'auth/popup-closed-by-user' });

    const error = await getDriveAccessToken().catch((e: unknown) => e);

    expect((error as GoogleDocsAuthError).kind).toBe('cancelled');
  });

  it('トークンが取得できない場合はfailedエラーになる', async () => {
    (reauthenticateWithPopup as Mock).mockResolvedValue({});
    credentialFromResult.mockReturnValue(null);

    const error = await getDriveAccessToken().catch((e: unknown) => e);

    expect((error as GoogleDocsAuthError).kind).toBe('failed');
  });
});
