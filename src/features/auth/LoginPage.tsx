import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { isPopupCancelledError, signInWithGoogle } from './authService';
import { useAuth } from './useAuth';

export function LoginPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (loading) {
    return <p role="status">{t('common.loading')}</p>;
  }
  if (user) {
    return <Navigate to="/projects" replace />;
  }

  const handleLogin = async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      // ログイン成功後はAuthProviderの状態更新により自動的に/projectsへ遷移する
    } catch (error) {
      if (!isPopupCancelledError(error)) {
        console.error('Googleログインに失敗しました', error);
        setErrorMessage(t('login.failed'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app">
      <h1>{t('common.appName')}</h1>
      <p>{t('common.appDescription')}</p>
      <p>{t('login.requiresGoogle')}</p>
      <button type="button" onClick={handleLogin} disabled={busy}>
        {busy ? t('login.busy') : t('login.button')}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </main>
  );
}
