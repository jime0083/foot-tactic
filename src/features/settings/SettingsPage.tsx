import { useState } from 'react';
import { signOutUser } from '@/features/auth/authService';

export function SettingsPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    setErrorMessage(null);
    try {
      await signOutUser();
      // ログアウト後は認証ガードにより/loginへリダイレクトされる
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
      setErrorMessage('ログアウトに失敗しました。再度お試しください。');
    }
  };

  return (
    <main className="app">
      <h1>設定</h1>
      {/* 言語切替・AIプロバイダ設定はPhase1.5/Phase6.1で実装 */}
      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </main>
  );
}
