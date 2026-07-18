import { captureBoardSnapshot, loadBoardSnapshot } from './boardSnapshot';
import { createObjectAt } from '@/features/board/objects/createObject';
import { useBoardStore } from '@/stores/boardStore';

vi.mock('@/lib/firebase', () => ({ db: {} }));

describe('captureBoardSnapshot / loadBoardSnapshot', () => {
  beforeEach(() => {
    useBoardStore.setState({
      sportType: 'soccer11',
      layoutId: 'full-landscape',
      aspect: '16:9',
      objects: [],
      selectedIds: [],
      past: [],
      future: [],
      lastUpdateKey: null,
      scenes: [{ id: 'scene-1', objects: [] }],
      currentSceneIndex: 0,
    });
  });

  it('作業中のオブジェクトを含めてキャプチャできる', () => {
    const ball = createObjectAt('ball', 50, 34);
    useBoardStore.getState().addObject(ball);

    const snapshot = captureBoardSnapshot();

    expect(snapshot.scenes[0].objects).toHaveLength(1);
    expect(snapshot.sportType).toBe('soccer11');
  });

  it('キャプチャ→ロードで状態が復元される(往復)', () => {
    const ball = createObjectAt('ball', 50, 34);
    useBoardStore.getState().addObject(ball);
    useBoardStore.getState().addScene();
    useBoardStore.getState().addObject(createObjectAt('marker', 20, 20));
    const snapshot = captureBoardSnapshot();

    // 状態を壊してからロード
    useBoardStore.setState({
      objects: [],
      scenes: [{ id: 'other', objects: [] }],
      currentSceneIndex: 0,
    });
    loadBoardSnapshot(snapshot);

    const state = useBoardStore.getState();
    expect(state.scenes).toHaveLength(2);
    expect(state.currentSceneIndex).toBe(0);
    expect(state.objects).toHaveLength(1);
    expect(state.objects[0].type).toBe('ball');
    expect(state.past).toHaveLength(0);
    expect(state.tool).toBe('select');
  });
});
