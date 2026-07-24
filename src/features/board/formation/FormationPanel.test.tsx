import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormationPanel } from './FormationPanel';
import type { PlayerObject } from '../objects/objectTypes';
import { useBoardStore } from '@/stores/boardStore';

describe('FormationPanel', () => {
  beforeEach(() => {
    useBoardStore.setState({
      sportType: 'soccer11',
      objects: [],
      selectedIds: [],
      past: [],
      future: [],
      lastUpdateKey: null,
    });
  });

  it('一括配置で11人のプレイヤーが配置される', async () => {
    render(<FormationPanel />);
    await userEvent.click(screen.getByRole('button', { name: '一括配置' }));

    const objects = useBoardStore.getState().objects;
    expect(objects).toHaveLength(11);
    expect(objects.every((object) => object.type === 'player')).toBe(true);
  });

  it('選手リストを入力すると背番号と名前が反映される', async () => {
    render(<FormationPanel />);
    await userEvent.type(screen.getByLabelText('選手リスト'), '1,GK田中{enter}10,山本');
    await userEvent.click(screen.getByRole('button', { name: '一括配置' }));

    const players = useBoardStore.getState().objects as PlayerObject[];
    expect(players[0].number).toBe('1');
    expect(players[0].name).toBe('GK田中');
    expect(players[1].number).toBe('10');
    expect(players[1].name).toBe('山本');
    // リストにない3人目以降はポジション名
    expect(players[2].number).toBe('CB');
  });

  it('アウェイを選ぶとアウェイ側にミラー配置され、既存アウェイのみ置換される', async () => {
    render(<FormationPanel />);
    await userEvent.click(screen.getByRole('button', { name: '一括配置' }));
    await userEvent.selectOptions(screen.getByLabelText('チーム'), 'away');
    await userEvent.click(screen.getByRole('button', { name: '一括配置' }));

    const players = useBoardStore.getState().objects as PlayerObject[];
    expect(players).toHaveLength(22);
    expect(players.filter((player) => player.team === 'home')).toHaveLength(11);
    expect(players.filter((player) => player.team === 'away')).toHaveLength(11);

    // アウェイを再配置しても総数は変わらない(置換)
    await userEvent.click(screen.getByRole('button', { name: '一括配置' }));
    expect(useBoardStore.getState().objects).toHaveLength(22);
  });
});
