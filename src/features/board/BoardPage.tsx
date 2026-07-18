import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

export function BoardPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <main className="app">
      <h1>{t('board.title')}</h1>
      <p>プロジェクトID: {projectId}</p>
      {/* ボードUIはPhase2で実装 */}
    </main>
  );
}
