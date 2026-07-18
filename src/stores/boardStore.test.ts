import { useBoardStore } from './boardStore';
import { DEFAULT_FIELD_COLORS } from '@/features/board/field/fieldColors';

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({
      sportType: 'soccer11',
      layoutId: 'full-landscape',
      aspect: '16:9',
      fieldColors: DEFAULT_FIELD_COLORS,
      zoom: 1,
      pan: { x: 0, y: 0 },
    });
  });

  it('setViewでズームとパンが設定される(ズームはクランプされる)', () => {
    useBoardStore.getState().setView(3, { x: 10, y: 20 });
    expect(useBoardStore.getState().zoom).toBe(3);
    expect(useBoardStore.getState().pan).toEqual({ x: 10, y: 20 });

    useBoardStore.getState().setView(100, { x: 0, y: 0 });
    expect(useBoardStore.getState().zoom).toBe(8);
  });

  it('resetViewでフィット表示に戻る', () => {
    useBoardStore.getState().setView(4, { x: 100, y: 100 });
    useBoardStore.getState().resetView();
    expect(useBoardStore.getState().zoom).toBe(1);
    expect(useBoardStore.getState().pan).toEqual({ x: 0, y: 0 });
  });

  it('レイアウト・競技・アスペクト比の変更でズームとパンがリセットされる', () => {
    useBoardStore.getState().setView(4, { x: 100, y: 100 });
    useBoardStore.getState().setLayoutId('full-portrait');
    expect(useBoardStore.getState().zoom).toBe(1);

    useBoardStore.getState().setView(4, { x: 100, y: 100 });
    useBoardStore.getState().setSportType('futsal');
    expect(useBoardStore.getState().zoom).toBe(1);

    useBoardStore.getState().setView(4, { x: 100, y: 100 });
    useBoardStore.getState().setAspect('9:16');
    expect(useBoardStore.getState().zoom).toBe(1);
  });

  it('setFieldColorsは部分更新できる', () => {
    useBoardStore.getState().setFieldColors({ background: '#000000' });
    expect(useBoardStore.getState().fieldColors.background).toBe('#000000');
    expect(useBoardStore.getState().fieldColors.line).toBe(DEFAULT_FIELD_COLORS.line);
  });
});
