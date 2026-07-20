import { vi } from 'vitest';
import type Konva from 'konva';
import { captureAllScenesPng } from './captureScenes';
import { registerStage } from '@/features/board/export/stageRegistry';
import { createObjectAt } from '@/features/board/objects/createObject';
import { useBoardStore } from '@/stores/boardStore';

describe('captureAllScenesPng', () => {
  const toDataURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // シーンごとに切り替わったobjects数をdata URLに反映して検証する
    toDataURL.mockImplementation(
      () => `data:image/png;base64,scene-${useBoardStore.getState().objects.length}`,
    );
    registerStage({ width: () => 640, toDataURL } as unknown as Konva.Stage);

    const sceneA = { id: 's1', objects: [createObjectAt('ball', 1, 1)] };
    const sceneB = {
      id: 's2',
      objects: [createObjectAt('ball', 2, 2), createObjectAt('marker', 3, 3)],
    };
    useBoardStore.setState({
      scenes: [sceneA, sceneB],
      currentSceneIndex: 1,
      objects: sceneB.objects,
      selectedIds: [],
      past: [],
      future: [],
      lastUpdateKey: null,
    });
  });

  afterEach(() => {
    registerStage(null);
  });

  it('全シーンをシーン順にキャプチャし、元のシーンへ戻る', async () => {
    const images = await captureAllScenesPng();

    expect(images).toEqual(['data:image/png;base64,scene-1', 'data:image/png;base64,scene-2']);
    expect(useBoardStore.getState().currentSceneIndex).toBe(1);
  });

  it('ステージ未表示の場合はエラーになり、シーンは元に戻る', async () => {
    registerStage(null);

    await expect(captureAllScenesPng()).rejects.toThrow();
    expect(useBoardStore.getState().currentSceneIndex).toBe(1);
  });
});
