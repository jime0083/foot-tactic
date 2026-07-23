import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import type { User } from 'firebase/auth';
import { SettingsPage } from './SettingsPage';
import { updateUserAiProvider, updateUserLanguage } from '@/features/auth/userDocument';
import { AccountError, deleteAccount } from '@/features/auth/accountService';
import { AuthContext } from '@/features/auth/auth-context';
import { AI_SETTINGS_STORAGE_KEY, loadAiSettings } from '@/features/transcription/aiSettings';

vi.mock('@/features/auth/userDocument', () => ({
  updateUserLanguage: vi.fn(),
  updateUserAiProvider: vi.fn(),
}));
vi.mock('@/features/auth/accountService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/auth/accountService')>()),
  deleteAccount: vi.fn(),
}));

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
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
  });

  it('言語切替とアカウント削除ボタンが表示される', () => {
    renderSettingsPage();
    expect(screen.getByLabelText('言語')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'アカウントを削除' })).toBeEnabled();
  });

  it('確認後にアカウント削除が実行される', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    (deleteAccount as Mock).mockResolvedValue(undefined);
    renderSettingsPage();

    await userEvent.click(screen.getByRole('button', { name: 'アカウントを削除' }));

    expect(deleteAccount).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it('確認をキャンセルすると削除されない', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderSettingsPage();

    await userEvent.click(screen.getByRole('button', { name: 'アカウントを削除' }));

    expect(deleteAccount).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('削除失敗時はエラーメッセージが表示される', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (deleteAccount as Mock).mockRejectedValue(new AccountError('failed', 'boom'));
    renderSettingsPage();

    await userEvent.click(screen.getByRole('button', { name: 'アカウントを削除' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('アカウントの削除に失敗しました');
    confirmSpy.mockRestore();
    consoleError.mockRestore();
  });

  it('再認証キャンセル時はエラーを表示しない', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    (deleteAccount as Mock).mockRejectedValue(new AccountError('cancelled', 'cancelled'));
    renderSettingsPage();

    await userEvent.click(screen.getByRole('button', { name: 'アカウントを削除' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it('AIプロバイダを切り替えるとlocalStorageとFirestoreに保存される', async () => {
    (updateUserAiProvider as Mock).mockResolvedValue(undefined);
    renderSettingsPage();

    await userEvent.selectOptions(screen.getByLabelText('AIプロバイダ'), 'openai');

    expect(loadAiSettings().provider).toBe('openai');
    expect(updateUserAiProvider).toHaveBeenCalledWith('test-uid', 'openai');
  });

  it('APIキーはlocalStorageにのみ保存され、マスク表示される', async () => {
    renderSettingsPage();
    const keyInput = screen.getByLabelText('Gemini APIキー');
    expect(keyInput).toHaveAttribute('type', 'password');

    fireEvent.change(keyInput, { target: { value: 'my-gemini-key' } });

    expect(loadAiSettings().geminiKey).toBe('my-gemini-key');
    // Firestoreへのキー送信は行われない
    expect(updateUserAiProvider).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('checkbox', { name: 'キーを表示' }));
    expect(screen.getByLabelText('Gemini APIキー')).toHaveAttribute('type', 'text');
  });

  it('キーがサーバーに送信されない旨と課金の注意が表示される', () => {
    renderSettingsPage();
    expect(screen.getByText(/サーバーには一切送信・保存されません/)).toBeInTheDocument();
    expect(screen.getByText(/ご自身のAIアカウントに課金されます/)).toBeInTheDocument();
  });

  it('言語を英語に切り替えるとUIが英語になりFirestoreに保存される', async () => {
    (updateUserLanguage as Mock).mockResolvedValue(undefined);
    renderSettingsPage();

    await userEvent.selectOptions(screen.getByLabelText('言語'), 'en');

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(updateUserLanguage).toHaveBeenCalledWith('test-uid', 'en');
  });

  it('Firestoreへの言語保存に失敗しても画面の言語切替は維持される', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (updateUserLanguage as Mock).mockRejectedValue(new Error('permission-denied'));
    renderSettingsPage();

    await userEvent.selectOptions(screen.getByLabelText('言語'), 'en');

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
