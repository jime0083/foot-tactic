import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CsvPanel } from './CsvPanel';
import type { PlayerObject } from '../objects/objectTypes';
import { useBoardStore } from '@/stores/boardStore';

describe('CsvPanel', () => {
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

  it('CSVから両チームを一括配置できる', async () => {
    render(<CsvPanel />);
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
    render(<CsvPanel />);
    fireEvent.change(screen.getByLabelText('CSVデータ'), { target: { value: '1,山田\n2,佐藤' } });
    await userEvent.click(screen.getByRole('button', { name: 'CSVから配置' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(useBoardStore.getState().objects).toHaveLength(0);
  });

  it('CSV作成ツールでフォーム入力からCSVを生成しCSV欄に反映する', async () => {
    render(<CsvPanel />);
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
