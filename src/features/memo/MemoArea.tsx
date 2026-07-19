import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addMemo, deleteMemo, listMemos, updateMemo } from './memoService';
import { MEMO_TEXT_MAX_LENGTH, type Memo } from './memoTypes';

interface MemoAreaProps {
  uid: string;
  projectId: string;
}

/** メモ1件の表示・編集・削除 */
function MemoEntry({
  memo,
  onUpdate,
  onDelete,
}: {
  memo: Memo;
  onUpdate: (memoId: string, text: string) => Promise<void>;
  onDelete: (memoId: string) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(memo.text);

  const handleSave = async () => {
    await onUpdate(memo.id, draftText);
    setEditing(false);
  };

  return (
    <li className="memo-entry">
      <div className="memo-entry__header">
        <time className="memo-entry__time">
          {new Date(memo.createdAt).toLocaleString(i18n.language)}
        </time>
        <div className="memo-entry__actions">
          {editing ? (
            <>
              <button type="button" onClick={() => void handleSave()}>
                {t('memo.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftText(memo.text);
                  setEditing(false);
                }}
              >
                {t('memo.cancel')}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setEditing(true)}>
                {t('memo.edit')}
              </button>
              <button type="button" onClick={() => void onDelete(memo.id)}>
                {t('memo.delete')}
              </button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <textarea
          rows={2}
          maxLength={MEMO_TEXT_MAX_LENGTH}
          value={draftText}
          aria-label={t('memo.editLabel')}
          onChange={(event) => setDraftText(event.target.value)}
        />
      ) : (
        <p className="memo-entry__text">{memo.text}</p>
      )}
    </li>
  );
}

/** ボード下部の常設メモエリア(プロジェクト単位・折りたたみ可能) */
export function MemoArea({ uid, projectId }: MemoAreaProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [memos, setMemos] = useState<Memo[] | null>(null);
  const [newText, setNewText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMemos(uid, projectId)
      .then((loaded) => {
        if (!cancelled) {
          setMemos(loaded);
        }
      })
      .catch((error: unknown) => {
        console.error('メモの読み込みに失敗しました', error);
        if (!cancelled) {
          setErrorMessage(t('memo.loadFailed'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [uid, projectId, t]);

  const handleAdd = async () => {
    if (newText.trim() === '') {
      return;
    }
    setErrorMessage(null);
    try {
      const memo = await addMemo(uid, projectId, { text: newText });
      setMemos((current) => [...(current ?? []), memo]);
      setNewText('');
    } catch (error) {
      console.error('メモの追加に失敗しました', error);
      setErrorMessage(t('memo.saveFailed'));
    }
  };

  const handleUpdate = async (memoId: string, text: string) => {
    setErrorMessage(null);
    try {
      await updateMemo(uid, projectId, memoId, { text });
      setMemos(
        (current) =>
          current?.map((memo) =>
            memo.id === memoId ? { ...memo, text: text.trim(), updatedAt: Date.now() } : memo,
          ) ?? null,
      );
    } catch (error) {
      console.error('メモの更新に失敗しました', error);
      setErrorMessage(t('memo.saveFailed'));
    }
  };

  const handleDelete = async (memoId: string) => {
    setErrorMessage(null);
    try {
      await deleteMemo(uid, projectId, memoId);
      setMemos((current) => current?.filter((memo) => memo.id !== memoId) ?? null);
    } catch (error) {
      console.error('メモの削除に失敗しました', error);
      setErrorMessage(t('memo.deleteFailed'));
    }
  };

  return (
    <section className="memo-area" aria-label={t('memo.title')}>
      <div className="memo-area__header">
        <h2>{t('memo.title')}</h2>
        <button type="button" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? t('memo.expand') : t('memo.collapse')}
        </button>
      </div>
      {!collapsed && (
        <div className="memo-area__body">
          {errorMessage && <p role="alert">{errorMessage}</p>}
          {memos === null ? (
            <p role="status">{t('common.loading')}</p>
          ) : memos.length === 0 ? (
            <p className="memo-area__empty">{t('memo.empty')}</p>
          ) : (
            <ul className="memo-area__list">
              {memos.map((memo) => (
                <MemoEntry
                  key={memo.id}
                  memo={memo}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
          <div className="memo-area__form">
            <textarea
              rows={2}
              maxLength={MEMO_TEXT_MAX_LENGTH}
              value={newText}
              placeholder={t('memo.placeholder')}
              aria-label={t('memo.placeholder')}
              onChange={(event) => setNewText(event.target.value)}
            />
            <button type="button" onClick={() => void handleAdd()} disabled={newText.trim() === ''}>
              {t('memo.add')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
