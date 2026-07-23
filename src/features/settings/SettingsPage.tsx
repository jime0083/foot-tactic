import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelect } from '@/components/LanguageSelect';
import { AccountError, deleteAccount } from '@/features/auth/accountService';
import { AiSettingsSection } from './AiSettingsSection';

export function SettingsPage() {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('settings.confirmDeleteAccount'))) {
      return;
    }
    setErrorMessage(null);
    setDeleting(true);
    try {
      await deleteAccount();
      // 削除成功後は認証状態が失われ、ガードにより/loginへリダイレクトされる
    } catch (error) {
      if (error instanceof AccountError && error.kind === 'cancelled') {
        // ユーザーが再認証をキャンセルした場合はエラー表示しない
        return;
      }
      console.error('アカウント削除に失敗しました', error);
      setErrorMessage(t('settings.deleteAccountFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="app">
      <h1>{t('settings.title')}</h1>
      <section>
        <LanguageSelect />
      </section>
      <AiSettingsSection />
      <section className="settings-danger">
        <button type="button" onClick={() => void handleDeleteAccount()} disabled={deleting}>
          {deleting ? t('settings.deletingAccount') : t('settings.deleteAccount')}
        </button>
        <p className="settings-danger__note">{t('settings.deleteAccountNote')}</p>
        {errorMessage && <p role="alert">{errorMessage}</p>}
      </section>
    </main>
  );
}
