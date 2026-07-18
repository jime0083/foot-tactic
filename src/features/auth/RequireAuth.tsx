import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from './useAuth';

/** 未ログインのユーザーを/loginへリダイレクトする認証ガード */
export function RequireAuth() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return <p role="status">{t('common.loading')}</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
