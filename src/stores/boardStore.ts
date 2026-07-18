import { create } from 'zustand';
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
  setSportType: (sportType: SportType) => void;
  setLayoutId: (layoutId: FieldLayoutId) => void;
  setAspect: (aspect: BoardAspect) => void;
  setFieldColors: (colors: Partial<FieldColors>) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  sportType: 'soccer11',
  layoutId: 'full-landscape',
  aspect: '16:9',
  fieldColors: DEFAULT_FIELD_COLORS,
  setSportType: (sportType) => set({ sportType }),
  setLayoutId: (layoutId) => set({ layoutId }),
  setAspect: (aspect) => set({ aspect }),
  setFieldColors: (colors) =>
    set((state) => ({ fieldColors: { ...state.fieldColors, ...colors } })),
}));
