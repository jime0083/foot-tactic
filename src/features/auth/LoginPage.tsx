import { useState } from 'react';
import { Navigate } from 'react-router';
import { isPopupCancelledError, signInWithGoogle } from './authService';
import { useAuth } from './useAuth';

export function LoginPage() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (loading) {
    return <p role="status">読み込み中...</p>;
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
        setErrorMessage('ログインに失敗しました。時間をおいて再度お試しください。');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app">
      <h1>foot-tactic</h1>
      <p>サッカー戦術ボード + メモアプリ</p>
      <p>利用にはGoogleアカウントでのログインが必要です</p>
      <button type="button" onClick={handleLogin} disabled={busy}>
        {busy ? 'ログイン中...' : 'Googleでログイン'}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </main>
  );
}
