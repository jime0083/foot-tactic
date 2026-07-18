import { useTranslation } from 'react-i18next';

export function ProjectListPage() {
  const { t } = useTranslation();
  return (
    <main className="app">
      <h1>{t('projects.title')}</h1>
      {/* 一覧UIはPhase4.3で実装 */}
    </main>
  );
}
