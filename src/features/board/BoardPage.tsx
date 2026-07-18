import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { BoardCanvas } from './BoardCanvas';

export function BoardPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <main className="board-page" data-project-id={projectId}>
      <h1 className="visually-hidden">{t('board.title')}</h1>
      <BoardCanvas />
      {/* ツールメニューはPhase2.5、メモエリアはPhase5.1で実装 */}
    </main>
  );
}
