import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi, type Mock } from 'vitest';
import { AppHeader } from './AppHeader';
import { signOutUser } from '@/features/auth/authService';

vi.mock('@/features/auth/authService', () => ({ signOutUser: vi.fn() }));

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={['/projects']}>
      <AppHeader />
    </MemoryRouter>,
  );
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('アプリ名とナビゲーションリンクが表示される', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'foot-tactic' })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: 'プロジェクト一覧' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.getByRole('link', { name: '設定' })).toHaveAttribute('href', '/settings');
  });

  it('ログアウトボタンを押すとログアウト処理が実行される', async () => {
    (signOutUser as Mock).mockResolvedValue(undefined);
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(signOutUser).toHaveBeenCalledTimes(1);
  });

  it('ログアウト失敗時はエラーが通知される', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    (signOutUser as Mock).mockRejectedValue(new Error('network-error'));
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(alertSpy).toHaveBeenCalled();
    consoleError.mockRestore();
    alertSpy.mockRestore();
  });
});
