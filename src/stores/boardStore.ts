import { create } from 'zustand';
import type { FieldLayoutId } from '@/features/board/field/fieldLayouts';
import type { SportType } from '@/features/board/field/fieldSpec';

/** ボード全体のアスペクト比(書き出し・表示枠) */
export type BoardAspect = '16:9' | '9:16';

interface BoardState {
  sportType: SportType;
  layoutId: FieldLayoutId;
  aspect: BoardAspect;
  setSportType: (sportType: SportType) => void;
  setLayoutId: (layoutId: FieldLayoutId) => void;
  setAspect: (aspect: BoardAspect) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  sportType: 'soccer11',
  layoutId: 'full-landscape',
  aspect: '16:9',
  setSportType: (sportType) => set({ sportType }),
  setLayoutId: (layoutId) => set({ layoutId }),
  setAspect: (aspect) => set({ aspect }),
}));
