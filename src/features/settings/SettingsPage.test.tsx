import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import { SettingsPage } from './SettingsPage';
import { signOutUser } from '@/features/auth/authService';

vi.mock('@/features/auth/authService', () => ({ signOutUser: vi.fn() }));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ログアウトボタンを押すとログアウト処理が実行される', async () => {
    (signOutUser as Mock).mockResolvedValue(undefined);
    render(<SettingsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(signOutUser).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ログアウト失敗時はエラーメッセージが表示される', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (signOutUser as Mock).mockRejectedValue(new Error('network-error'));
    render(<SettingsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ログアウトに失敗しました');
    consoleError.mockRestore();
  });
});
