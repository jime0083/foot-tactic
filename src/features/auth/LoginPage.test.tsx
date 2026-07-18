import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi, type Mock } from 'vitest';
import { AuthContext } from './auth-context';
import { LoginPage } from './LoginPage';
import { signInWithGoogle } from './authService';

vi.mock('./authService', () => ({
  signInWithGoogle: vi.fn(),
  isPopupCancelledError: (error: unknown) =>
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'auth/popup-closed-by-user',
}));

function renderLoginPage() {
  return render(
    <AuthContext.Provider value={{ user: null, loading: false }}>
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Googleログインボタンが表示される', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: 'Googleでログイン' })).toBeInTheDocument();
  });

  it('ボタンを押すとGoogleログインが実行される', async () => {
    (signInWithGoogle as Mock).mockResolvedValue({ uid: 'test-uid' });
    renderLoginPage();

    await userEvent.click(screen.getByRole('button', { name: 'Googleでログイン' }));

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ログイン失敗時はエラーメッセージが表示される', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (signInWithGoogle as Mock).mockRejectedValue(new Error('network-error'));
    renderLoginPage();

    await userEvent.click(screen.getByRole('button', { name: 'Googleでログイン' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ログインに失敗しました');
    consoleError.mockRestore();
  });

  it('ユーザーがポップアップを閉じた場合はエラーを表示しない', async () => {
    (signInWithGoogle as Mock).mockRejectedValue({ code: 'auth/popup-closed-by-user' });
    renderLoginPage();

    await userEvent.click(screen.getByRole('button', { name: 'Googleでログイン' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
