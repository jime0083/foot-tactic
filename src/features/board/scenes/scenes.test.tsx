import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SceneStrip } from './SceneStrip';
import { SceneThumbnail } from './SceneThumbnail';
import { createObjectAt } from '../objects/createObject';
import { useBoardStore } from '@/stores/boardStore';

function resetScenes() {
  useBoardStore.setState({
    objects: [],
    selectedIds: [],
    past: [],
    future: [],
    lastUpdateKey: null,
    scenes: [{ id: 'scene-1', objects: [] }],
    currentSceneIndex: 0,
  });
}

describe('boardStore シーン管理', () => {
  beforeEach(resetScenes);

  it('シーンを追加すると空のシーンに切り替わる', () => {
    useBoardStore.getState().addObject(createObjectAt('ball', 10, 10));
    useBoardStore.getState().addScene();

    const state = useBoardStore.getState();
    expect(state.scenes).toHaveLength(2);
    expect(state.currentSceneIndex).toBe(1);
    expect(state.objects).toHaveLength(0);
    // 元のシーンにはオブジェクトが保存されている
    expect(state.scenes[0].objects).toHaveLength(1);
  });

  it('シーンを複製すると現在の内容を引き継いだシーンが挿入される', () => {
    useBoardStore.getState().addObject(createObjectAt('ball', 10, 10));
    useBoardStore.getState().duplicateScene();

    const state = useBoardStore.getState();
    expect(state.scenes).toHaveLength(2);
    expect(state.currentSceneIndex).toBe(1);
    expect(state.objects).toHaveLength(1);
  });

  it('複製後の編集は元のシーンに影響しない', () => {
    const ball = createObjectAt('ball', 10, 10);
    useBoardStore.getState().addObject(ball);
    useBoardStore.getState().duplicateScene();
    useBoardStore.getState().updateObject(ball.id, { x: 50 });

    useBoardStore.getState().switchScene(0);
    const original = useBoardStore.getState().objects[0];
    expect(original.x).toBe(10);
  });

  it('シーン切替で作業中の内容が保存・復元される', () => {
    useBoardStore.getState().addObject(createObjectAt('ball', 10, 10));
    useBoardStore.getState().addScene();
    useBoardStore.getState().addObject(createObjectAt('marker', 20, 20));

    useBoardStore.getState().switchScene(0);
    expect(useBoardStore.getState().objects[0].type).toBe('ball');

    useBoardStore.getState().switchScene(1);
    expect(useBoardStore.getState().objects[0].type).toBe('marker');
  });

  it('シーン削除で隣のシーンへ切り替わる。最後の1つは削除できない', () => {
    useBoardStore.getState().addScene();
    useBoardStore.getState().deleteScene(1);
    expect(useBoardStore.getState().scenes).toHaveLength(1);
    expect(useBoardStore.getState().currentSceneIndex).toBe(0);

    useBoardStore.getState().deleteScene(0);
    expect(useBoardStore.getState().scenes).toHaveLength(1);
  });

  it('シーン切替で選択と履歴がリセットされる', () => {
    const ball = createObjectAt('ball', 10, 10);
    useBoardStore.getState().addObject(ball);
    useBoardStore.getState().setSelection([ball.id]);
    useBoardStore.getState().addScene();

    const state = useBoardStore.getState();
    expect(state.selectedIds).toHaveLength(0);
    expect(state.past).toHaveLength(0);
  });
});

describe('boardStore moveScene', () => {
  beforeEach(resetScenes);

  it('シーンを並び替えても現在シーンを追従する', () => {
    useBoardStore.getState().addObject(createObjectAt('ball', 10, 10));
    useBoardStore.getState().addScene(); // scene2(current)
    useBoardStore.getState().addScene(); // scene3(current)

    // 現在(3番目)を先頭へ移動
    useBoardStore.getState().moveScene(2, 0);

    const state = useBoardStore.getState();
    expect(state.currentSceneIndex).toBe(0);
    expect(state.scenes).toHaveLength(3);
    // 元の1番目(ballあり)は2番目に移動している
    expect(state.scenes[1].objects).toHaveLength(1);
  });

  it('範囲外や同一インデックスは何もしない', () => {
    const before = useBoardStore.getState().scenes;
    useBoardStore.getState().moveScene(0, 0);
    useBoardStore.getState().moveScene(0, 5);
    expect(useBoardStore.getState().scenes).toEqual(before);
  });
});

describe('SceneThumbnail', () => {
  it('オブジェクトの位置がミニマップに描画される', () => {
    const player = createObjectAt('player', 30, 20);
    const ball = createObjectAt('ball', 50, 34);
    const { container } = render(<SceneThumbnail objects={[player, ball]} sportType="soccer11" />);
    // フィールド+ハーフウェーライン+オブジェクト2つ
    expect(container.querySelectorAll('circle')).toHaveLength(2);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '-2 -2 109 72');
  });
});

describe('SceneStrip', () => {
  beforeEach(resetScenes);

  it('シーン一覧と操作ボタンが表示される', () => {
    render(<SceneStrip />);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '削除' })).toBeDisabled();
  });

  it('追加ボタンでシーンが増え、クリックで切り替えられる', async () => {
    render(<SceneStrip />);
    await userEvent.click(screen.getByRole('button', { name: '追加' }));

    expect(useBoardStore.getState().scenes).toHaveLength(2);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    expect(useBoardStore.getState().currentSceneIndex).toBe(0);
  });
});
