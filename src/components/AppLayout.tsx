import { Outlet } from 'react-router';
import { AppHeader } from './AppHeader';

/** ログイン後の画面共通レイアウト(ヘッダー+コンテンツ) */
export function AppLayout() {
  return (
    <div className="app-layout">
      <AppHeader />
      <Outlet />
    </div>
  );
}
