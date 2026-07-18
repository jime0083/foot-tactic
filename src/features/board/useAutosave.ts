import { useCallback, useEffect, useRef, useState } from 'react';
import { captureBoardSnapshot } from '@/features/projects/boardSnapshot';
import { saveProjectSnapshot } from '@/features/projects/projectService';
import { useBoardStore } from '@/stores/boardStore';

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

/** 自動保存のデバウンス時間(ミリ秒) */
export const AUTOSAVE_DEBOUNCE_MS = 2500;

/**
 * ボードの変更をデバウンスしてFirestoreへ自動保存するフック。
 * enabledがtrueになった後の変更のみを対象とする(読込直後の保存を防ぐ)。
 */
export function useAutosave(
  uid: string | undefined,
  projectId: string | undefined,
  enabled: boolean,
) {
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  const saveNow = useCallback(async () => {
    if (!uid || !projectId || savingRef.current) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    savingRef.current = true;
    setSaveState('saving');
    try {
      await saveProjectSnapshot(uid, projectId, captureBoardSnapshot());
      setSaveState('saved');
    } catch (error) {
      console.error('プロジェクトの保存に失敗しました', error);
      setSaveState('error');
    } finally {
      savingRef.current = false;
    }
  }, [uid, projectId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const unsubscribe = useBoardStore.subscribe((state, previous) => {
      const changed =
        state.objects !== previous.objects ||
        state.scenes !== previous.scenes ||
        state.sportType !== previous.sportType ||
        state.layoutId !== previous.layoutId ||
        state.aspect !== previous.aspect ||
        state.fieldColors !== previous.fieldColors ||
        state.playerDisplay !== previous.playerDisplay;
      if (!changed) {
        return;
      }
      setSaveState((current) => (current === 'saving' ? current : 'dirty'));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        void saveNow();
      }, AUTOSAVE_DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, saveNow]);

  return { saveState, saveNow };
}
