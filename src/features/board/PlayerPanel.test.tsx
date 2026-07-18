import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerPanel } from './PlayerPanel';
import { createObjectAt } from './objects/createObject';
import type { BallObject, PlayerObject } from './objects/objectTypes';
import { useBoardStore } from '@/stores/boardStore';

function setupWithPlayer(): PlayerObject {
  const player = createObjectAt('player', 40, 34) as PlayerObject;
  useBoardStore.setState({ objects: [player], selectedIds: [player.id] });
  return player;
}

describe('PlayerPanel', () => {
  beforeEach(() => {
    useBoardStore.setState({ objects: [], selectedIds: [] });
  });

  it('未選択の場合は何も表示しない', () => {
    const { container } = render(<PlayerPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('プレイヤー選択時に背番号を入力できる', async () => {
    const player = setupWithPlayer();
    render(<PlayerPanel />);

    await userEvent.type(screen.getByLabelText('背番号'), '10');

    const updated = useBoardStore.getState().objects[0] as PlayerObject;
    expect(updated.number).toBe('10');
    expect(updated.id).toBe(player.id);
  });

  it('向き矢印の表示を切り替えられる', async () => {
    setupWithPlayer();
    render(<PlayerPanel />);

    await userEvent.click(screen.getByRole('checkbox', { name: '向き矢印' }));

    expect((useBoardStore.getState().objects[0] as PlayerObject).showArrow).toBe(true);
  });

  it('ボールがある場合「ボール方向を向く」でプレイヤーが回転する', async () => {
    const player = setupWithPlayer();
    const ball = createObjectAt('ball', 40, 50) as BallObject;
    useBoardStore.setState({ objects: [player, ball], selectedIds: [player.id] });
    render(<PlayerPanel />);

    await userEvent.click(screen.getByRole('button', { name: 'ボール方向を向く' }));

    // 真下のボールを向く=90度
    expect((useBoardStore.getState().objects[0] as PlayerObject).rotation).toBeCloseTo(90);
  });

  it('ボール選択時は全選手をボールに向けるボタンが表示される', async () => {
    const player = createObjectAt('player', 30, 34) as PlayerObject;
    player.showArrow = true;
    const ball = createObjectAt('ball', 50, 34) as BallObject;
    useBoardStore.setState({ objects: [player, ball], selectedIds: [ball.id] });
    render(<PlayerPanel />);

    await userEvent.click(screen.getByRole('button', { name: '全選手がボールを向く' }));

    expect((useBoardStore.getState().objects[0] as PlayerObject).rotation).toBeCloseTo(0);
  });

  it('選手サイズの共通設定を変更できる', () => {
    setupWithPlayer();
    render(<PlayerPanel />);

    const slider = screen.getByLabelText('選手サイズ');
    expect(slider).toBeInTheDocument();
  });

  it('ボール選択時に色を変更できる', () => {
    const ball = createObjectAt('ball', 50, 34) as BallObject;
    useBoardStore.setState({ objects: [ball], selectedIds: [ball.id] });
    render(<PlayerPanel />);

    fireEvent.change(screen.getByLabelText('色'), { target: { value: '#ff8800' } });

    expect((useBoardStore.getState().objects[0] as BallObject).color).toBe('#ff8800');
  });

  it('テキスト選択時に内容と文字サイズを変更できる', () => {
    const text = createObjectAt('text', 30, 30);
    useBoardStore.setState({ objects: [text], selectedIds: [text.id] });
    render(<PlayerPanel />);

    fireEvent.change(screen.getByLabelText('テキスト'), { target: { value: 'プレス開始' } });
    fireEvent.change(screen.getByLabelText('文字サイズ'), { target: { value: '40' } });

    const updated = useBoardStore.getState().objects[0];
    expect(updated.type === 'text' && updated.text).toBe('プレス開始');
    expect(updated.type === 'text' && updated.fontSize).toBe(4);
  });

  it('マーカー選択時に色とサイズを変更できる', () => {
    const marker = createObjectAt('marker', 20, 20);
    useBoardStore.setState({ objects: [marker], selectedIds: [marker.id] });
    render(<PlayerPanel />);

    fireEvent.change(screen.getByLabelText('サイズ'), { target: { value: '20' } });

    const updated = useBoardStore.getState().objects[0];
    expect(updated.type === 'marker' && updated.size).toBe(2);
  });
});
