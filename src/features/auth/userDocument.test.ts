import { vi, type Mock } from 'vitest';
import type { User } from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';
import { ensureUserDocument, DEFAULT_USER_SETTINGS, DEFAULT_USER_PLAN } from './userDocument';

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ path: 'users/test-uid' })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
}));

const mockUser = {
  uid: 'test-uid',
  displayName: 'テストユーザー',
  email: 'test@example.com',
} as User;

describe('ensureUserDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ドキュメントが存在しない場合は初期値で作成する', async () => {
    (getDoc as Mock).mockResolvedValue({ exists: () => false });

    await ensureUserDocument(mockUser);

    expect(setDoc).toHaveBeenCalledWith(
      { path: 'users/test-uid' },
      {
        displayName: 'テストユーザー',
        email: 'test@example.com',
        settings: DEFAULT_USER_SETTINGS,
        plan: DEFAULT_USER_PLAN,
        createdAt: 'server-timestamp',
      },
    );
  });

  it('ドキュメントが既に存在する場合は何もしない', async () => {
    (getDoc as Mock).mockResolvedValue({ exists: () => true });

    await ensureUserDocument(mockUser);

    expect(setDoc).not.toHaveBeenCalled();
  });

  it('displayName/emailがnullの場合は空文字で作成する', async () => {
    (getDoc as Mock).mockResolvedValue({ exists: () => false });
    const anonymousUser = { uid: 'test-uid', displayName: null, email: null } as User;

    await ensureUserDocument(anonymousUser);

    expect(setDoc).toHaveBeenCalledWith(
      { path: 'users/test-uid' },
      expect.objectContaining({ displayName: '', email: '' }),
    );
  });
});
