import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/useAuth';
import { SceneThumbnail } from '@/features/board/scenes/SceneThumbnail';
import type { SportType } from '@/features/board/field/fieldSpec';
import {
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  type ProjectListItem,
} from './projectService';

const SPORT_TYPES: SportType[] = ['soccer11', 'soccer8', 'futsal'];

export function ProjectListPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ProjectListItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSportType, setNewSportType] = useState<SportType>('soccer11');
  const [busy, setBusy] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    listProjects(user.uid)
      .then((loaded) => {
        if (!cancelled) {
          setItems(loaded);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        console.error('プロジェクト一覧の取得に失敗しました', error);
        if (!cancelled) {
          setErrorMessage(t('projects.loadFailed'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, t, reloadKey]);

  const handleCreate = async () => {
    if (!user) {
      return;
    }
    setBusy(true);
    try {
      const title = newTitle.trim() || t('projects.defaultTitle');
      const projectId = await createProject(user.uid, title, newSportType);
      void navigate(`/board/${projectId}`);
    } catch (error) {
      console.error('プロジェクトの作成に失敗しました', error);
      setErrorMessage(t('projects.createFailed'));
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async (projectId: string) => {
    if (!user) {
      return;
    }
    try {
      await duplicateProject(user.uid, projectId);
      refresh();
    } catch (error) {
      console.error('プロジェクトの複製に失敗しました', error);
      setErrorMessage(t('projects.duplicateFailed'));
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!user || !window.confirm(t('projects.confirmDelete'))) {
      return;
    }
    try {
      await deleteProject(user.uid, projectId);
      refresh();
    } catch (error) {
      console.error('プロジェクトの削除に失敗しました', error);
      setErrorMessage(t('projects.deleteFailed'));
    }
  };

  return (
    <main className="project-list">
      <h1>{t('projects.title')}</h1>
      <div className="project-list__create">
        <input
          type="text"
          maxLength={100}
          value={newTitle}
          placeholder={t('projects.titlePlaceholder')}
          aria-label={t('projects.titlePlaceholder')}
          onChange={(event) => setNewTitle(event.target.value)}
        />
        <select
          aria-label={t('board.sportLabel')}
          value={newSportType}
          onChange={(event) => setNewSportType(event.target.value as SportType)}
        >
          {SPORT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`board.sport.${type}`)}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => void handleCreate()} disabled={busy}>
          {t('projects.create')}
        </button>
      </div>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {items === null ? (
        <p role="status">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p>{t('projects.empty')}</p>
      ) : (
        <ul className="project-list__grid">
          {items.map((item) => (
            <li key={item.id} className="project-card">
              <button
                type="button"
                className="project-card__main"
                onClick={() => void navigate(`/board/${item.id}`)}
              >
                <SceneThumbnail objects={item.previewObjects} sportType={item.sportType} />
                <span className="project-card__title">{item.title}</span>
                <span className="project-card__meta">
                  {t(`board.sport.${item.sportType}`)}
                  {item.updatedAt !== null &&
                    ` ・ ${new Date(item.updatedAt).toLocaleString(i18n.language)}`}
                </span>
              </button>
              <div className="project-card__actions">
                <button type="button" onClick={() => void handleDuplicate(item.id)}>
                  {t('projects.duplicate')}
                </button>
                <button type="button" onClick={() => void handleDelete(item.id)}>
                  {t('projects.delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
