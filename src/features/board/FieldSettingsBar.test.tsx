import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldSettingsBar } from './FieldSettingsBar';
import { useBoardStore } from '@/stores/boardStore';

describe('FieldSettingsBar', () => {
  beforeEach(() => {
    useBoardStore.setState({
      sportType: 'soccer11',
      layoutId: 'full-landscape',
      aspect: '16:9',
    });
  });

  it('表示レイアウトのセレクトが表示される(競技・比率の切替は持たない)', () => {
    render(<FieldSettingsBar />);
    expect(screen.getByLabelText('表示')).toHaveValue('full-landscape');
    // 競技種別・ピッチ比率の切替UIは削除済み(11人制・16:9固定)
    expect(screen.queryByLabelText('競技')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('比率')).not.toBeInTheDocument();
  });

  it('表示レイアウトは8種類から選択できる', () => {
    render(<FieldSettingsBar />);
    const options = screen.getByLabelText('表示').querySelectorAll('option');
    expect(options).toHaveLength(8);
  });

  it('レイアウトを切り替えるとストアが更新される', async () => {
    render(<FieldSettingsBar />);
    await userEvent.selectOptions(screen.getByLabelText('表示'), 'full-portrait');
    expect(useBoardStore.getState().layoutId).toBe('full-portrait');
  });
});
