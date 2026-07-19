import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { useAuth } from '@/features/auth/useAuth';
import { loadBoardSnapshot } from '@/features/projects/boardSnapshot';
import { loadProject } from '@/features/projects/projectService';
import { BoardCanvas } from './BoardCanvas';
import {
  downloadDataUrl,
  sanitizeFileName,
  stageToPngDataUrl,
  waitForNextFrame,
} from './export/exportPng';
import { getRegisteredStage } from './export/stageRegistry';
import { FieldSettingsBar } from './FieldSettingsBar';
import { FormationPanel } from './formation/FormationPanel';
import { PlayerPanel } from './PlayerPanel';
import { SceneStrip } from './scenes/SceneStrip';
import { ToolMenu } from './ToolMenu';
import { useAutosave } from './useAutosave';
import { useBoardStore } from '@/stores/boardStore';

type LoadStatus = 'loading' | 'ready' | 'notFound' | 'error';

export function BoardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [title, setTitle] = useState('');
  const { saveState, saveNow } = useAutosave(user?.uid, projectId, status === 'ready');
  const [exportError, setExportError] = useState(false);

  /** 表示中シーンを高解像度PNGとしてダウンロードする */
  const handleExportPng = async () => {
    setExportError(false);
    try {
      // 選択ハイライトやハンドルが写り込まないよう選択を解除してから描画を待つ
      useBoardStore.getState().clearSelection();
      await waitForNextFrame();
      const stage = getRegisteredStage();
      if (!stage) {
        setExportError(true);
        return;
      }
      const sceneNumber = useBoardStore.getState().currentSceneIndex + 1;
      const fileName = `${sanitizeFileName(title || 'board')}-scene${sceneNumber}.png`;
      downloadDataUrl(stageToPngDataUrl(stage), fileName);
    } catch (error) {
      console.error('PNG書き出しに失敗しました', error);
      setExportError(true);
    }
  };

  // プロジェクトIDが変わったら読み込み中に戻す(レンダー中の状態調整パターン)
  const [requestedProjectId, setRequestedProjectId] = useState(projectId);
  if (requestedProjectId !== projectId) {
    setRequestedProjectId(projectId);
    setStatus('loading');
  }

  useEffect(() => {
    if (!user || !projectId) {
      return;
    }
    let cancelled = false;
    loadProject(user.uid, projectId)
      .then((project) => {
        if (cancelled) {
          return;
        }
        if (!project) {
          setStatus('notFound');
          return;
        }
        loadBoardSnapshot(project.snapshot);
        setTitle(project.meta.title);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        console.error('プロジェクトの読み込みに失敗しました', error);
        if (!cancelled) {
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, projectId]);

  if (status === 'loading') {
    return <p role="status">{t('common.loading')}</p>;
  }
  if (status === 'notFound' || status === 'error') {
    return (
      <main className="app">
        <p role="alert">{status === 'notFound' ? t('board.notFound') : t('board.loadFailed')}</p>
        <Link to="/projects">{t('projects.title')}</Link>
      </main>
    );
  }

  return (
    <main className="board-page" data-project-id={projectId}>
      <h1 className="visually-hidden">{title || t('board.title')}</h1>
      <div className="save-bar">
        {exportError && <span role="alert">{t('board.export.failed')}</span>}
        <button type="button" onClick={() => void handleExportPng()}>
          {t('board.export.png')}
        </button>
        <span role="status">{t(`board.save.${saveState}`)}</span>
        <button type="button" onClick={() => void saveNow()} disabled={saveState === 'saving'}>
          {t('board.save.button')}
        </button>
      </div>
      <FieldSettingsBar />
      <ToolMenu />
      <FormationPanel />
      <PlayerPanel />
      <BoardCanvas />
      <SceneStrip />
      {/* メモエリアはPhase5.1で実装 */}
    </main>
  );
}
