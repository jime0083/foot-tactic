import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolMenu } from './ToolMenu';
import { useBoardStore } from '@/stores/boardStore';

describe('ToolMenu', () => {
  beforeEach(() => {
    useBoardStore.setState({ tool: 'select', continuousPlacement: false, objects: [] });
  });

  it('選択+10種のオブジェクトツールが表示される', () => {
    render(<ToolMenu />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.querySelectorAll('button')).toHaveLength(11);
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
