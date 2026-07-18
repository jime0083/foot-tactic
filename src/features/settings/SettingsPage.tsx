import { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { signOutUser } from '@/features/auth/authService';
import { updateUserLanguage } from '@/features/auth/userDocument';
import { useAuth } from '@/features/auth/useAuth';
import { storeLanguage, type AppLanguage } from '@/i18n';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLanguageChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value === 'en' ? 'en' : ('ja' satisfies AppLanguage);
    await i18n.changeLanguage(language);
    storeLanguage(language);
    if (user) {
      try {
        await updateUserLanguage(user.uid, language);
      } catch (error) {
        // Firestoreへの保存に失敗しても画面上の言語切替は維持する
        console.error('言語設定の保存に失敗しました', error);
      }
    }
  };

  const handleLogout = async () => {
    setErrorMessage(null);
    try {
      await signOutUser();
      // ログアウト後は認証ガードにより/loginへリダイレクトされる
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
      setErrorMessage(t('settings.logoutFailed'));
    }
  };

  return (
    <main className="app">
      <h1>{t('settings.title')}</h1>
      <label>
        {t('settings.language')}
        <select value={i18n.language} onChange={handleLanguageChange}>
          <option value="ja">日本語</option>
          <option value="en">English</option>
        </select>
      </label>
      {/* AIプロバイダ設定はPhase6.1で実装 */}
      <div>
        <button type="button" onClick={handleLogout}>
          {t('settings.logout')}
        </button>
      </div>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </main>
  );
}
