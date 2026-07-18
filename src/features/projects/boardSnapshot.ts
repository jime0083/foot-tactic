import { ZERO_PAN } from '@/features/board/boardView';
import { useBoardStore } from '@/stores/boardStore';
import type { BoardSnapshot } from './projectTypes';

/** 現在のボード状態をスナップショットとして取り出す */
export function captureBoardSnapshot(): BoardSnapshot {
  const state = useBoardStore.getState();
  const scenes = state.scenes.map((scene, index) =>
    index === state.currentSceneIndex ? { ...scene, objects: state.objects } : scene,
  );
  return {
    sportType: state.sportType,
    layoutId: state.layoutId,
    aspect: state.aspect,
    fieldColors: state.fieldColors,
    playerDisplay: state.playerDisplay,
    scenes,
  };
}

/** スナップショットをボードへ反映する(履歴・選択・ビューはリセット) */
export function loadBoardSnapshot(snapshot: BoardSnapshot): void {
  useBoardStore.setState({
    sportType: snapshot.sportType,
    layoutId: snapshot.layoutId,
    aspect: snapshot.aspect,
    fieldColors: snapshot.fieldColors,
    playerDisplay: snapshot.playerDisplay,
    scenes: snapshot.scenes,
    currentSceneIndex: 0,
    objects: snapshot.scenes[0]?.objects ?? [],
    selectedIds: [],
    past: [],
    future: [],
    lastUpdateKey: null,
    zoom: 1,
    pan: ZERO_PAN,
    tool: 'select',
  });
}
