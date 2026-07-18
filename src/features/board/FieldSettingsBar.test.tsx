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

  it('競技・表示・比率のセレクトが表示される', () => {
    render(<FieldSettingsBar />);
    expect(screen.getByLabelText('競技')).toHaveValue('soccer11');
    expect(screen.getByLabelText('表示')).toHaveValue('full-landscape');
    expect(screen.getByLabelText('比率')).toHaveValue('16:9');
  });

  it('表示レイアウトは8種類から選択できる', () => {
    render(<FieldSettingsBar />);
    const options = screen.getByLabelText('表示').querySelectorAll('option');
    expect(options).toHaveLength(8);
  });

  it('競技を切り替えるとストアが更新される', async () => {
    render(<FieldSettingsBar />);
    await userEvent.selectOptions(screen.getByLabelText('競技'), 'futsal');
    expect(useBoardStore.getState().sportType).toBe('futsal');
  });

  it('レイアウトとアスペクト比を切り替えるとストアが更新される', async () => {
    render(<FieldSettingsBar />);
    await userEvent.selectOptions(screen.getByLabelText('表示'), 'full-portrait');
    await userEvent.selectOptions(screen.getByLabelText('比率'), '9:16');
    expect(useBoardStore.getState().layoutId).toBe('full-portrait');
    expect(useBoardStore.getState().aspect).toBe('9:16');
  });
});
