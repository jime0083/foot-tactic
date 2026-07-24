import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadAiSettings } from '@/features/transcription/aiSettings';
import { TranscriptionError } from '@/features/transcription/errors';
import { transcribeAudio } from '@/features/transcription/transcribe';
import { addMemo, deleteMemo, listMemos, updateMemo } from './memoService';
import { collectMemoTags, filterMemosByTag } from './memoTags';
import { MEMO_TEXT_MAX_LENGTH, type Memo } from './memoTypes';
import { TagEditor } from './TagEditor';
import { VoiceRecorderButton } from './VoiceRecorderButton';

/** 音声メモの文字起こしフロー状態 */
type VoiceState =
  | { status: 'transcribing' }
  | { status: 'preview'; text: string }
  | { status: 'error'; messageKey: string };

interface MemoAreaProps {
  uid: string;
  projectId: string;
}

/** メモ1件の表示・編集・削除 */
function MemoEntry({
  memo,
  tagSuggestions,
  onUpdate,
  onUpdateTags,
  onDelete,
}: {
  memo: Memo;
  tagSuggestions: string[];
  onUpdate: (memoId: string, text: string) => Promise<void>;
  onUpdateTags: (memoId: string, tags: string[]) => Promise<void>;
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
      <TagEditor
        tags={memo.tags}
        suggestions={tagSuggestions}
        label={memo.text.slice(0, 20)}
        onAdd={(tag) => void onUpdateTags(memo.id, [...memo.tags, tag])}
        onRemove={(tag) =>
          void onUpdateTags(
            memo.id,
            memo.tags.filter((existing) => existing !== tag),
          )
        }
      />
    </li>
  );
}

/** ボード下部の常設メモエリア(プロジェクト単位・折りたたみ可能) */
export function MemoArea({ uid, projectId }: MemoAreaProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [memos, setMemos] = useState<Memo[] | null>(null);
  const [newText, setNewText] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState | null>(null);
  const [voiceTags, setVoiceTags] = useState<string[]>([]);
  const tagSuggestions = collectMemoTags(memos ?? []);

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
      const memo = await addMemo(uid, projectId, { text: newText, tags: newTags });
      setMemos((current) => [...(current ?? []), memo]);
      setNewText('');
      setNewTags([]);
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

  const handleUpdateTags = async (memoId: string, tags: string[]) => {
    setErrorMessage(null);
    try {
      await updateMemo(uid, projectId, memoId, { tags });
      setMemos(
        (current) =>
          current?.map((memo) =>
            memo.id === memoId ? { ...memo, tags, updatedAt: Date.now() } : memo,
          ) ?? null,
      );
    } catch (error) {
      console.error('メモのタグ更新に失敗しました', error);
      setErrorMessage(t('memo.saveFailed'));
    }
  };

  /** 録音した音声を文字起こしし、プレビューへ進める */
  const handleAudioReady = async (audio: Blob) => {
    setVoiceState({ status: 'transcribing' });
    try {
      const text = await transcribeAudio(audio, loadAiSettings());
      setVoiceState({ status: 'preview', text });
      setVoiceTags([]);
    } catch (error) {
      console.error('文字起こしに失敗しました', error);
      const kind = error instanceof TranscriptionError ? error.kind : 'other';
      setVoiceState({ status: 'error', messageKey: `memo.voice.${kind}Error` });
    }
  };

  /** プレビュー中の文字起こし結果を音声メモとして採用する */
  const handleAdoptVoice = async () => {
    if (voiceState?.status !== 'preview' || voiceState.text.trim() === '') {
      return;
    }
    setErrorMessage(null);
    try {
      const memo = await addMemo(uid, projectId, {
        text: voiceState.text,
        tags: voiceTags,
        source: 'voice',
      });
      setMemos((current) => [...(current ?? []), memo]);
      setVoiceState(null);
      setVoiceTags([]);
    } catch (error) {
      console.error('音声メモの保存に失敗しました', error);
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
          {tagSuggestions.length > 0 && (
            <label className="memo-area__filter">
              {t('memo.tagFilter')}
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                <option value="">{t('memo.allTags')}</option>
                {tagSuggestions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
          )}
          {memos === null ? (
            <p role="status">{t('common.loading')}</p>
          ) : memos.length === 0 ? (
            <p className="memo-area__empty">{t('memo.empty')}</p>
          ) : (
            <ul className="memo-area__list">
              {filterMemosByTag(memos, tagFilter).map((memo) => (
                <MemoEntry
                  key={memo.id}
                  memo={memo}
                  tagSuggestions={tagSuggestions}
                  onUpdate={handleUpdate}
                  onUpdateTags={handleUpdateTags}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
          <div className="memo-area__form">
            <div className="memo-area__form-main">
              <textarea
                rows={2}
                maxLength={MEMO_TEXT_MAX_LENGTH}
                value={newText}
                placeholder={t('memo.placeholder')}
                aria-label={t('memo.placeholder')}
                onChange={(event) => setNewText(event.target.value)}
              />
              <TagEditor
                tags={newTags}
                suggestions={tagSuggestions}
                label={t('memo.newMemo')}
                onAdd={(tag) => setNewTags((current) => [...current, tag])}
                onRemove={(tag) => setNewTags((current) => current.filter((v) => v !== tag))}
              />
            </div>
            <div className="memo-area__form-buttons">
              <button
                type="button"
                className="btn-primary"
                onClick={() => void handleAdd()}
                disabled={newText.trim() === ''}
              >
                {t('memo.add')}
              </button>
              <VoiceRecorderButton
                onAudioReady={handleAudioReady}
                disabled={voiceState?.status === 'transcribing'}
              />
            </div>
          </div>
          {voiceState?.status === 'transcribing' && (
            <p role="status">{t('memo.voice.transcribing')}</p>
          )}
          {voiceState?.status === 'error' && (
            <p role="alert">
              {t(voiceState.messageKey)}{' '}
              <button type="button" onClick={() => setVoiceState(null)}>
                {t('memo.voice.dismiss')}
              </button>
            </p>
          )}
          {voiceState?.status === 'preview' && (
            <div className="voice-preview">
              <h3>{t('memo.voice.previewTitle')}</h3>
              <textarea
                rows={3}
                maxLength={MEMO_TEXT_MAX_LENGTH}
                value={voiceState.text}
                aria-label={t('memo.voice.previewTitle')}
                onChange={(event) => setVoiceState({ status: 'preview', text: event.target.value })}
              />
              <TagEditor
                tags={voiceTags}
                suggestions={tagSuggestions}
                label={t('memo.voice.previewTitle')}
                onAdd={(tag) => setVoiceTags((current) => [...current, tag])}
                onRemove={(tag) => setVoiceTags((current) => current.filter((v) => v !== tag))}
              />
              <div className="voice-preview__actions">
                <button
                  type="button"
                  onClick={() => void handleAdoptVoice()}
                  disabled={voiceState.text.trim() === ''}
                >
                  {t('memo.voice.adopt')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVoiceState(null);
                    setVoiceTags([]);
                  }}
                >
                  {t('memo.voice.discard')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
