import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import { MemoArea } from './MemoArea';
import { addMemo, deleteMemo, listMemos, updateMemo } from './memoService';
import type { Memo } from './memoTypes';

vi.mock('./memoService', () => ({
  listMemos: vi.fn(),
  addMemo: vi.fn(),
  updateMemo: vi.fn(),
  deleteMemo: vi.fn(),
}));

const sampleMemos: Memo[] = [
  {
    id: 'm1',
    text: '前半15分、右サイドから決定機',
    tags: [],
    source: 'manual',
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: 'm2',
    text: '相手は4-4-2でブロックを作る',
    tags: [],
    source: 'manual',
    createdAt: 2000,
    updatedAt: 2000,
  },
];

function renderMemoArea() {
  return render(<MemoArea uid="u1" projectId="p1" />);
}

describe('MemoArea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (listMemos as Mock).mockResolvedValue(sampleMemos);
  });

  it('メモ一覧が時系列で表示される', async () => {
    renderMemoArea();
    expect(await screen.findByText('前半15分、右サイドから決定機')).toBeInTheDocument();
    expect(screen.getByText('相手は4-4-2でブロックを作る')).toBeInTheDocument();
  });

  it('メモがない場合は案内が表示される', async () => {
    (listMemos as Mock).mockResolvedValue([]);
    renderMemoArea();
    expect(await screen.findByText('メモはまだありません')).toBeInTheDocument();
  });

  it('メモを追加できる', async () => {
    (addMemo as Mock).mockResolvedValue({
      id: 'm3',
      text: '後半から3バックへ変更',
      tags: [],
      source: 'manual',
      createdAt: 3000,
      updatedAt: 3000,
    });
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    await userEvent.type(screen.getByLabelText(/メモを入力/), '後半から3バックへ変更');
    await userEvent.click(screen.getByRole('button', { name: '追加' }));

    expect(addMemo).toHaveBeenCalledWith('u1', 'p1', { text: '後半から3バックへ変更' });
    expect(await screen.findByText('後半から3バックへ変更')).toBeInTheDocument();
  });

  it('空のメモは追加できない', async () => {
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');
    expect(screen.getByRole('button', { name: '追加' })).toBeDisabled();
  });

  it('メモを編集して保存できる', async () => {
    (updateMemo as Mock).mockResolvedValue(undefined);
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    await userEvent.click(screen.getAllByRole('button', { name: '編集' })[0]);
    const editArea = screen.getByLabelText('メモを編集');
    await userEvent.clear(editArea);
    await userEvent.type(editArea, '前半15分、左サイドから決定機');
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(updateMemo).toHaveBeenCalledWith('u1', 'p1', 'm1', {
      text: '前半15分、左サイドから決定機',
    });
    expect(await screen.findByText('前半15分、左サイドから決定機')).toBeInTheDocument();
  });

  it('メモを削除できる', async () => {
    (deleteMemo as Mock).mockResolvedValue(undefined);
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    await userEvent.click(screen.getAllByRole('button', { name: '削除' })[0]);

    expect(deleteMemo).toHaveBeenCalledWith('u1', 'p1', 'm1');
    expect(screen.queryByText('前半15分、右サイドから決定機')).not.toBeInTheDocument();
  });

  it('折りたたみで本文が非表示になる', async () => {
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    await userEvent.click(screen.getByRole('button', { name: '折りたたむ' }));
    expect(screen.queryByText('前半15分、右サイドから決定機')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '開く' }));
    expect(screen.getByText('前半15分、右サイドから決定機')).toBeInTheDocument();
  });
});
