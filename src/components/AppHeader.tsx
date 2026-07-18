import { useTranslation } from 'react-i18next';
import { Link, NavLink, useNavigate } from 'react-router';
import { signOutUser } from '@/features/auth/authService';

export function AppHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      void navigate('/login', { replace: true });
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
      window.alert(t('settings.logoutFailed'));
    }
  };

  return (
    <header className="app-header">
      <Link to="/projects" className="app-header__brand">
        {t('common.appName')}
      </Link>
      <nav className="app-header__nav">
        <NavLink to="/projects">{t('projects.title')}</NavLink>
        <NavLink to="/settings">{t('settings.title')}</NavLink>
      </nav>
      <button type="button" className="app-header__logout" onClick={handleLogout}>
        {t('settings.logout')}
      </button>
    </header>
  );
}
