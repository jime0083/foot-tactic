import { useBoardStore } from './boardStore';
import { DEFAULT_FIELD_COLORS } from '@/features/board/field/fieldColors';
import { createObjectAt } from '@/features/board/objects/createObject';

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({
      sportType: 'soccer11',
      layoutId: 'full-landscape',
      aspect: '16:9',
      fieldColors: DEFAULT_FIELD_COLORS,
      zoom: 1,
      pan: { x: 0, y: 0 },
      objects: [],
      selectedIds: [],
      past: [],
      future: [],
      lastUpdateKey: null,
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

describe('boardStore Undo/Redo', () => {
  beforeEach(() => {
    useBoardStore.setState({
      objects: [],
      selectedIds: [],
      past: [],
      future: [],
      lastUpdateKey: null,
    });
  });

  it('追加操作をUndo/Redoできる', () => {
    const object = createObjectAt('ball', 10, 10);
    useBoardStore.getState().addObject(object);
    expect(useBoardStore.getState().objects).toHaveLength(1);

    useBoardStore.getState().undo();
    expect(useBoardStore.getState().objects).toHaveLength(0);

    useBoardStore.getState().redo();
    expect(useBoardStore.getState().objects).toHaveLength(1);
  });

  it('削除操作をUndoできる', () => {
    const object = createObjectAt('ball', 10, 10);
    useBoardStore.getState().addObject(object);
    useBoardStore.getState().removeObjects([object.id]);
    expect(useBoardStore.getState().objects).toHaveLength(0);

    useBoardStore.getState().undo();
    expect(useBoardStore.getState().objects).toHaveLength(1);
  });

  it('同一対象への連続更新は1回のUndoでまとめて戻る', () => {
    const object = createObjectAt('circle', 10, 10);
    useBoardStore.getState().addObject(object);
    // スライダー操作のような連続更新
    useBoardStore.getState().updateObject(object.id, { radius: 5 });
    useBoardStore.getState().updateObject(object.id, { radius: 6 });
    useBoardStore.getState().updateObject(object.id, { radius: 7 });

    useBoardStore.getState().undo();
    const restored = useBoardStore.getState().objects[0];
    expect(restored.type === 'circle' && restored.radius).toBe(4); // 既定値に戻る
  });

  it('異なる種類の更新は別々にUndoされる', () => {
    const object = createObjectAt('circle', 10, 10);
    useBoardStore.getState().addObject(object);
    useBoardStore.getState().updateObject(object.id, { radius: 8 });
    useBoardStore.getState().updateObject(object.id, { stroke: '#000000' });

    useBoardStore.getState().undo();
    const afterFirstUndo = useBoardStore.getState().objects[0];
    expect(afterFirstUndo.type === 'circle' && afterFirstUndo.radius).toBe(8);
    expect(afterFirstUndo.type === 'circle' && afterFirstUndo.stroke).not.toBe('#000000');
  });

  it('新しい操作をするとRedo履歴はクリアされる', () => {
    useBoardStore.getState().addObject(createObjectAt('ball', 0, 0));
    useBoardStore.getState().undo();
    expect(useBoardStore.getState().future).toHaveLength(1);

    useBoardStore.getState().addObject(createObjectAt('ball', 5, 5));
    expect(useBoardStore.getState().future).toHaveLength(0);
  });

  it('履歴がない状態のUndo/Redoは何もしない', () => {
    useBoardStore.getState().undo();
    useBoardStore.getState().redo();
    expect(useBoardStore.getState().objects).toHaveLength(0);
  });

  it('clearHistoryで履歴が破棄される', () => {
    useBoardStore.getState().addObject(createObjectAt('ball', 0, 0));
    useBoardStore.getState().clearHistory();
    expect(useBoardStore.getState().past).toHaveLength(0);
    useBoardStore.getState().undo();
    expect(useBoardStore.getState().objects).toHaveLength(1);
  });
});
