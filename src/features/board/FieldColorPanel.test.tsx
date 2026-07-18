import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldColorPanel } from './FieldColorPanel';
import { DEFAULT_FIELD_COLORS } from './field/fieldColors';
import { useBoardStore } from '@/stores/boardStore';

describe('FieldColorPanel', () => {
  beforeEach(() => {
    useBoardStore.setState({ fieldColors: DEFAULT_FIELD_COLORS });
  });

  it('ボタンを押すとパネルが開閉する', async () => {
    render(<FieldColorPanel />);
    expect(screen.queryByLabelText('背景')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '色設定' }));
    expect(screen.getByLabelText('背景')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '色設定' }));
    expect(screen.queryByLabelText('背景')).not.toBeInTheDocument();
  });

  it('背景色を変更するとストアが更新される', async () => {
    render(<FieldColorPanel />);
    await userEvent.click(screen.getByRole('button', { name: '色設定' }));

    fireEvent.change(screen.getByLabelText('背景'), { target: { value: '#123456' } });

    expect(useBoardStore.getState().fieldColors.background).toBe('#123456');
    // 他の色設定は維持される
    expect(useBoardStore.getState().fieldColors.line).toBe(DEFAULT_FIELD_COLORS.line);
  });

  it('レーン不透明度を変更するとストアが更新される', async () => {
    render(<FieldColorPanel />);
    await userEvent.click(screen.getByRole('button', { name: '色設定' }));

    fireEvent.change(screen.getByLabelText('レーン不透明度'), { target: { value: '40' } });

    expect(useBoardStore.getState().fieldColors.laneOpacity).toBeCloseTo(0.4);
  });
});
