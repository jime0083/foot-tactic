import { Navigate, Outlet } from 'react-router';
import { useAuth } from './useAuth';

/** 未ログインのユーザーを/loginへリダイレクトする認証ガード */
export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p role="status">読み込み中...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
