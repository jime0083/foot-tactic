import { create } from 'zustand';
import { clampZoom, ZERO_PAN, type PanOffset } from '@/features/board/boardView';
import { DEFAULT_FIELD_COLORS, type FieldColors } from '@/features/board/field/fieldColors';
import type { FieldLayoutId } from '@/features/board/field/fieldLayouts';
import type { SportType } from '@/features/board/field/fieldSpec';
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
    })),
  setObjects: (objects) => set({ objects }),
}));
