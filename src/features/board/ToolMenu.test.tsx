import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolMenu } from './ToolMenu';
import { createObjectAt } from './objects/createObject';
import { useBoardStore } from '@/stores/boardStore';

describe('ToolMenu', () => {
  beforeEach(() => {
    useBoardStore.setState({ tool: 'select', continuousPlacement: false, objects: [] });
  });

  it('選択+10種のオブジェクトツールが表示される', () => {
    render(<ToolMenu />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelectorAll('.tool-menu__item')).toHaveLength(11);
  });

  it('種類で選択すると同種の全オブジェクトが選択される', async () => {
    const player1 = createObjectAt('player', 0, 0);
    const player2 = createObjectAt('player', 10, 10);
    const ball = createObjectAt('ball', 20, 20);
    useBoardStore.setState({ objects: [player1, player2, ball], selectedIds: [] });
    render(<ToolMenu />);

    await userEvent.selectOptions(screen.getByLabelText('種類で選択'), 'player');

    expect(useBoardStore.getState().selectedIds).toEqual([player1.id, player2.id]);
  });

  it('削除ボタンで選択オブジェクトが削除される', async () => {
    const player = createObjectAt('player', 0, 0);
    const ball = createObjectAt('ball', 20, 20);
    useBoardStore.setState({ objects: [player, ball], selectedIds: [player.id] });
    render(<ToolMenu />);

    await userEvent.click(screen.getByRole('button', { name: '削除' }));

    expect(useBoardStore.getState().objects.map((o) => o.id)).toEqual([ball.id]);
    expect(useBoardStore.getState().selectedIds).toEqual([]);
  });

  it('未選択時は削除ボタンが無効になる', () => {
    render(<ToolMenu />);
    expect(screen.getByRole('button', { name: '削除' })).toBeDisabled();
  });

  it('ツールを選ぶとストアが更新され押下状態になる', async () => {
    render(<ToolMenu />);
    await userEvent.click(screen.getByRole('button', { name: '選手' }));
    expect(useBoardStore.getState().tool).toBe('player');
    expect(screen.getByRole('button', { name: '選手' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('連続配置モードを切り替えられる', async () => {
    render(<ToolMenu />);
    await userEvent.click(screen.getByRole('checkbox', { name: '連続配置' }));
    expect(useBoardStore.getState().continuousPlacement).toBe(true);
  });
});

describe('boardStore オブジェクト操作', () => {
  beforeEach(() => {
    useBoardStore.setState({ objects: [] });
  });

  it('追加・更新・削除ができる', () => {
    const store = useBoardStore.getState();
    store.addObject({ id: 'a', type: 'ball', x: 1, y: 2, rotation: 0, color: '#fff' });
    store.addObject({ id: 'b', type: 'ball', x: 3, y: 4, rotation: 0, color: '#fff' });
    expect(useBoardStore.getState().objects).toHaveLength(2);

    useBoardStore.getState().updateObject('a', { x: 10 });
    expect(useBoardStore.getState().objects[0]).toMatchObject({ id: 'a', x: 10, y: 2 });

    useBoardStore.getState().removeObjects(['a']);
    expect(useBoardStore.getState().objects).toHaveLength(1);
    expect(useBoardStore.getState().objects[0].id).toBe('b');
  });
});
