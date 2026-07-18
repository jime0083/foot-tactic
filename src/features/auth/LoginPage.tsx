import { Navigate } from 'react-router';
import { useAuth } from './useAuth';

export function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p role="status">読み込み中...</p>;
  }
  if (user) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <main className="app">
      <h1>foot-tactic</h1>
      <p>サッカー戦術ボード + メモアプリ</p>
      {/* GoogleログインボタンはPhase1.4で実装 */}
      <p>ログイン機能は準備中です</p>
    </main>
  );
}
