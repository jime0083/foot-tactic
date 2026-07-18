import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import type { User } from 'firebase/auth';
import { SettingsPage } from './SettingsPage';
import { signOutUser } from '@/features/auth/authService';
import { updateUserLanguage } from '@/features/auth/userDocument';
import { AuthContext } from '@/features/auth/auth-context';

vi.mock('@/features/auth/authService', () => ({ signOutUser: vi.fn() }));
vi.mock('@/features/auth/userDocument', () => ({ updateUserLanguage: vi.fn() }));

const mockUser = { uid: 'test-uid' } as User;

function renderSettingsPage() {
  return render(
    <AuthContext.Provider value={{ user: mockUser, loading: false }}>
      <SettingsPage />
    </AuthContext.Provider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ログアウトボタンを押すとログアウト処理が実行される', async () => {
    (signOutUser as Mock).mockResolvedValue(undefined);
    renderSettingsPage();

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(signOutUser).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ログアウト失敗時はエラーメッセージが表示される', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (signOutUser as Mock).mockRejectedValue(new Error('network-error'));
    renderSettingsPage();

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ログアウトに失敗しました');
    consoleError.mockRestore();
  });

  it('言語を英語に切り替えるとUIが英語になりFirestoreに保存される', async () => {
    (updateUserLanguage as Mock).mockResolvedValue(undefined);
    renderSettingsPage();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'en');

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(updateUserLanguage).toHaveBeenCalledWith('test-uid', 'en');
  });

  it('Firestoreへの言語保存に失敗しても画面の言語切替は維持される', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (updateUserLanguage as Mock).mockRejectedValue(new Error('permission-denied'));
    renderSettingsPage();

    await userEvent.selectOptions(screen.getByRole('combobox'), 'en');

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
