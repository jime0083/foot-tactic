import { fireEvent, render, screen } from '@testing-library/react';
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

  async function openPanel() {
    render(<FormationPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'フォーメーション' }));
  }

  it('一括配置で11人のプレイヤーが配置される', async () => {
    await openPanel();
    await userEvent.click(screen.getByRole('button', { name: '一括配置' }));

    const objects = useBoardStore.getState().objects;
    expect(objects).toHaveLength(11);
    expect(objects.every((object) => object.type === 'player')).toBe(true);
  });

  it('選手リストを入力すると背番号と名前が反映される', async () => {
    await openPanel();
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
    await openPanel();
    // まずホームを配置
    await userEvent.click(screen.getByRole('button', { name: '一括配置' }));
    // アウェイに切り替えて配置
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

  it('CSVタブから両チームを一括配置できる', async () => {
    await openPanel();
    await userEvent.click(screen.getByRole('tab', { name: 'CSV一括' }));

    const home = Array.from({ length: 11 }, (_, i) => `${i + 1},H${i + 1}`).join('\n');
    const away = Array.from({ length: 11 }, (_, i) => `${i + 1},A${i + 1}`).join('\n');
    const csv = `###home,4-4-2\n${home}\n###away,4-3-3\n${away}`;

    fireEvent.change(screen.getByLabelText('CSVデータ'), { target: { value: csv } });
    await userEvent.click(screen.getByRole('button', { name: 'CSVから配置' }));

    const players = useBoardStore.getState().objects as PlayerObject[];
    expect(players).toHaveLength(22);
    expect(players.filter((p) => p.team === 'home')).toHaveLength(11);
    expect(players.filter((p) => p.team === 'away')).toHaveLength(11);
  });

  it('###home/###awayがないCSVはエラーを表示し配置しない', async () => {
    await openPanel();
    await userEvent.click(screen.getByRole('tab', { name: 'CSV一括' }));

    fireEvent.change(screen.getByLabelText('CSVデータ'), { target: { value: '1,山田\n2,佐藤' } });
    await userEvent.click(screen.getByRole('button', { name: 'CSVから配置' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(useBoardStore.getState().objects).toHaveLength(0);
  });

  it('CSV作成ツールでフォーム入力からCSVを生成しCSV欄に反映する', async () => {
    await openPanel();
    await userEvent.click(screen.getByRole('tab', { name: 'CSV一括' }));
    await userEvent.click(screen.getByRole('button', { name: 'CSV作成ツール' }));

    fireEvent.change(screen.getByLabelText('ホーム選手(背番号,名前)'), {
      target: { value: '1,GK田中\n10,山本' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'CSVを生成' }));

    const csvBox = screen.getByLabelText('CSVデータ') as HTMLTextAreaElement;
    expect(csvBox.value).toContain('###home,4-4-2');
    expect(csvBox.value).toContain('1,GK田中');
    expect(csvBox.value).toContain('10,山本');
    // 生成したCSVでそのまま配置できる
    await userEvent.click(screen.getByRole('button', { name: 'CSVから配置' }));
    expect(useBoardStore.getState().objects).toHaveLength(11);
  });
});
