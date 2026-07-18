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
  addObject: (object) => set((state) => ({ objects: [...state.objects, object] })),
  updateObject: (id, patch) =>
    set((state) => ({
      objects: state.objects.map((object) =>
        object.id === id ? ({ ...object, ...patch } as BoardObject) : object,
      ),
    })),
  removeObjects: (ids) =>
    set((state) => ({
      objects: state.objects.filter((object) => !ids.includes(object.id)),
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    })),
  setObjects: (objects) => set({ objects, selectedIds: [] }),
  setSelection: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  setPlayerDisplay: (settings) =>
    set((state) => ({ playerDisplay: { ...state.playerDisplay, ...settings } })),
  clipboard: [],
  setClipboard: (objects) => set({ clipboard: objects }),
  reorderSelected: (direction) =>
    set((state) => ({
      objects:
        direction === 'front'
          ? bringToFront(state.objects, state.selectedIds)
          : sendToBack(state.objects, state.selectedIds),
    })),
  alignSelected: (mode) =>
    set((state) => ({ objects: alignObjects(state.objects, state.selectedIds, mode) })),
}));
