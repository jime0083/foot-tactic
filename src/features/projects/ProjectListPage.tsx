import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/useAuth';
import { SceneThumbnail } from '@/features/board/scenes/SceneThumbnail';
import { collectTags, filterProjects } from './projectFilter';
import {
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
  updateProjectMeta,
  type ProjectListItem,
} from './projectService';

export function ProjectListPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ProjectListItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');

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
      // 競技種別は11人制固定
      const projectId = await createProject(user.uid, title, 'soccer11');
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

  const handleAddTag = async (item: ProjectListItem, rawTag: string) => {
    const tag = rawTag.trim();
    if (!user || tag === '' || item.tags.includes(tag)) {
      return;
    }
    try {
      await updateProjectMeta(user.uid, item.id, { tags: [...item.tags, tag] });
      refresh();
    } catch (error) {
      console.error('タグの更新に失敗しました', error);
      setErrorMessage(t('projects.tagFailed'));
    }
  };

  const handleRemoveTag = async (item: ProjectListItem, tag: string) => {
    if (!user) {
      return;
    }
    try {
      await updateProjectMeta(user.uid, item.id, {
        tags: item.tags.filter((existing) => existing !== tag),
      });
      refresh();
    } catch (error) {
      console.error('タグの更新に失敗しました', error);
      setErrorMessage(t('projects.tagFailed'));
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
        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleCreate()}
          disabled={busy}
        >
          {t('projects.create')}
        </button>
      </div>
      <div className="project-list__filter">
        <input
          type="search"
          value={searchQuery}
          placeholder={t('projects.search')}
          aria-label={t('projects.search')}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <select
          aria-label={t('projects.tagFilter')}
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
        >
          <option value="">{t('projects.allTags')}</option>
          {collectTags(items ?? []).map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {items === null ? (
        <p role="status">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p>{t('projects.empty')}</p>
      ) : (
        <ul className="project-list__grid">
          {filterProjects(items, searchQuery, tagFilter).map((item) => (
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
              <div className="project-card__tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="project-card__tag">
                    {tag}
                    <button
                      type="button"
                      aria-label={`${t('projects.removeTag')}: ${tag}`}
                      onClick={() => void handleRemoveTag(item, tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  maxLength={20}
                  className="project-card__tag-input"
                  placeholder={t('projects.addTag')}
                  aria-label={`${t('projects.addTag')}: ${item.title}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      const input = event.currentTarget;
                      void handleAddTag(item, input.value).then(() => {
                        input.value = '';
                      });
                    }
                  }}
                />
              </div>
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
