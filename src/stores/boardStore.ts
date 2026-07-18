import { create } from 'zustand';
import { clampZoom, ZERO_PAN, type PanOffset } from '@/features/board/boardView';
import { DEFAULT_FIELD_COLORS, type FieldColors } from '@/features/board/field/fieldColors';
import type { FieldLayoutId } from '@/features/board/field/fieldLayouts';
import type { SportType } from '@/features/board/field/fieldSpec';
import { alignObjects, type AlignMode } from '@/features/board/objects/alignment';
import { bringToFront, sendToBack } from '@/features/board/objects/objectOps';
import type { BoardObject, BoardTool } from '@/features/board/objects/objectTypes';

/** ボード全体のアスペクト比(書き出し・表示枠) */
export type BoardAspect = '16:9' | '9:16';

/** 保持する履歴の最大数 */
const MAX_HISTORY = 100;

interface BoardState {
  sportType: SportType;
  layoutId: FieldLayoutId;
  aspect: BoardAspect;
  fieldColors: FieldColors;
  /** ユーザーズーム(1=ウィンドウフィット) */
  zoom: number;
  /** ユーザーパン(ピクセル) */
  pan: PanOffset;
  /** 選択中のツール */
  tool: BoardTool;
  /** 連続配置モード(ONの場合、配置後もツールを維持する) */
  continuousPlacement: boolean;
  /** 現在のシーンのオブジェクト(配列順=重なり順) */
  objects: BoardObject[];
  /** 選択中オブジェクトのID */
  selectedIds: string[];
  /** 全プレイヤー共通の表示設定 */
  playerDisplay: PlayerDisplaySettings;
  /** Undo用の履歴(objectsのスナップショット) */
  past: BoardObject[][];
  /** Redo用の履歴 */
  future: BoardObject[][];
  /** 連続更新(スライダー操作等)の履歴を1つにまとめるためのキー */
  lastUpdateKey: string | null;
  setSportType: (sportType: SportType) => void;
  setLayoutId: (layoutId: FieldLayoutId) => void;
  setAspect: (aspect: BoardAspect) => void;
  setFieldColors: (colors: Partial<FieldColors>) => void;
  setView: (zoom: number, pan: PanOffset) => void;
  resetView: () => void;
  setTool: (tool: BoardTool) => void;
  toggleContinuousPlacement: () => void;
  addObject: (object: BoardObject) => void;
  updateObject: (id: string, patch: Partial<BoardObject>) => void;
  removeObjects: (ids: string[]) => void;
  setObjects: (objects: BoardObject[]) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setPlayerDisplay: (settings: Partial<PlayerDisplaySettings>) => void;
  /** コピー&ペースト用クリップボード */
  clipboard: BoardObject[];
  setClipboard: (objects: BoardObject[]) => void;
  /** 選択オブジェクトの重なり順を変更する */
  reorderSelected: (direction: 'front' | 'back') => void;
  /** 選択オブジェクトを整列する */
  alignSelected: (mode: AlignMode) => void;
  undo: () => void;
  redo: () => void;
  /** 履歴を破棄する(シーン切替・プロジェクト読込時用) */
  clearHistory: () => void;
}

/** 全プレイヤー共通の表示設定 */
export interface PlayerDisplaySettings {
  /** 体の半径(メートル) */
  bodyRadius: number;
  /** 選手名のフォントサイズ(メートル) */
  nameFontSize: number;
}

export const DEFAULT_PLAYER_DISPLAY: PlayerDisplaySettings = {
  bodyRadius: 1.2,
  nameFontSize: 1.6,
};

/** objectsの変更を履歴に積む共通処理。updateKeyが直前と同じ場合は履歴をまとめる */
function withHistory(
  state: Pick<BoardState, 'objects' | 'past' | 'lastUpdateKey'>,
  objects: BoardObject[],
  updateKey: string | null = null,
): Pick<BoardState, 'objects' | 'past' | 'future' | 'lastUpdateKey'> {
  if (updateKey !== null && updateKey === state.lastUpdateKey) {
    return { objects, past: state.past, future: [], lastUpdateKey: updateKey };
  }
  return {
    objects,
    past: [...state.past.slice(-(MAX_HISTORY - 1)), state.objects],
    future: [],
    lastUpdateKey: updateKey,
  };
}

export const useBoardStore = create<BoardState>((set) => ({
  sportType: 'soccer11',
  layoutId: 'full-landscape',
  aspect: '16:9',
  fieldColors: DEFAULT_FIELD_COLORS,
  zoom: 1,
  pan: ZERO_PAN,
  tool: 'select',
  continuousPlacement: false,
  objects: [],
  selectedIds: [],
  playerDisplay: DEFAULT_PLAYER_DISPLAY,
  past: [],
  future: [],
  lastUpdateKey: null,
  // 表示対象が変わるためズーム・パンはリセットする
  setSportType: (sportType) => set({ sportType, zoom: 1, pan: ZERO_PAN }),
  setLayoutId: (layoutId) => set({ layoutId, zoom: 1, pan: ZERO_PAN }),
  setAspect: (aspect) => set({ aspect, zoom: 1, pan: ZERO_PAN }),
  setFieldColors: (colors) =>
    set((state) => ({ fieldColors: { ...state.fieldColors, ...colors } })),
  setView: (zoom, pan) => set({ zoom: clampZoom(zoom), pan }),
  resetView: () => set({ zoom: 1, pan: ZERO_PAN }),
  setTool: (tool) => set({ tool }),
  toggleContinuousPlacement: () =>
    set((state) => ({ continuousPlacement: !state.continuousPlacement })),
  addObject: (object) => set((state) => withHistory(state, [...state.objects, object])),
  updateObject: (id, patch) =>
    set((state) =>
      withHistory(
        state,
        state.objects.map((object) =>
          object.id === id ? ({ ...object, ...patch } as BoardObject) : object,
        ),
        `${id}:${Object.keys(patch).sort().join(',')}`,
      ),
    ),
  removeObjects: (ids) =>
    set((state) => ({
      ...withHistory(
        state,
        state.objects.filter((object) => !ids.includes(object.id)),
      ),
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    })),
  setObjects: (objects) => set((state) => ({ ...withHistory(state, objects), selectedIds: [] })),
  setSelection: (ids) => set({ selectedIds: ids, lastUpdateKey: null }),
  clearSelection: () => set({ selectedIds: [], lastUpdateKey: null }),
  setPlayerDisplay: (settings) =>
    set((state) => ({ playerDisplay: { ...state.playerDisplay, ...settings } })),
  clipboard: [],
  setClipboard: (objects) => set({ clipboard: objects }),
  reorderSelected: (direction) =>
    set((state) =>
      withHistory(
        state,
        direction === 'front'
          ? bringToFront(state.objects, state.selectedIds)
          : sendToBack(state.objects, state.selectedIds),
      ),
    ),
  alignSelected: (mode) =>
    set((state) => withHistory(state, alignObjects(state.objects, state.selectedIds, mode))),
  undo: () =>
    set((state) => {
      const previous = state.past[state.past.length - 1];
      if (!previous) {
        return {};
      }
      return {
        objects: previous,
        past: state.past.slice(0, -1),
        future: [state.objects, ...state.future],
        selectedIds: [],
        lastUpdateKey: null,
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) {
        return {};
      }
      return {
        objects: next,
        past: [...state.past, state.objects],
        future: state.future.slice(1),
        selectedIds: [],
        lastUpdateKey: null,
      };
    }),
  clearHistory: () => set({ past: [], future: [], lastUpdateKey: null }),
}));
