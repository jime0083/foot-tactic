import { create } from 'zustand';
import { clampZoom, ZERO_PAN, type PanOffset } from '@/features/board/boardView';
import { DEFAULT_FIELD_COLORS, type FieldColors } from '@/features/board/field/fieldColors';
import type { FieldLayoutId } from '@/features/board/field/fieldLayouts';
import type { SportType } from '@/features/board/field/fieldSpec';

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
  setSportType: (sportType: SportType) => void;
  setLayoutId: (layoutId: FieldLayoutId) => void;
  setAspect: (aspect: BoardAspect) => void;
  setFieldColors: (colors: Partial<FieldColors>) => void;
  setView: (zoom: number, pan: PanOffset) => void;
  resetView: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  sportType: 'soccer11',
  layoutId: 'full-landscape',
  aspect: '16:9',
  fieldColors: DEFAULT_FIELD_COLORS,
  zoom: 1,
  pan: ZERO_PAN,
  // 表示対象が変わるためズーム・パンはリセットする
  setSportType: (sportType) => set({ sportType, zoom: 1, pan: ZERO_PAN }),
  setLayoutId: (layoutId) => set({ layoutId, zoom: 1, pan: ZERO_PAN }),
  setAspect: (aspect) => set({ aspect, zoom: 1, pan: ZERO_PAN }),
  setFieldColors: (colors) =>
    set((state) => ({ fieldColors: { ...state.fieldColors, ...colors } })),
  setView: (zoom, pan) => set({ zoom: clampZoom(zoom), pan }),
  resetView: () => set({ zoom: 1, pan: ZERO_PAN }),
}));
