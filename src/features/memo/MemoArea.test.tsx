import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import { MemoArea } from './MemoArea';
import { addMemo, deleteMemo, listMemos, updateMemo } from './memoService';
import type { Memo } from './memoTypes';
import { AI_SETTINGS_STORAGE_KEY, saveAiSettings } from '@/features/transcription/aiSettings';
import { TranscriptionError } from '@/features/transcription/errors';
import { transcribeAudio } from '@/features/transcription/transcribe';

vi.mock('./memoService', () => ({
  listMemos: vi.fn(),
  addMemo: vi.fn(),
  updateMemo: vi.fn(),
  deleteMemo: vi.fn(),
}));

vi.mock('@/features/transcription/transcribe', () => ({
  transcribeAudio: vi.fn(),
}));

const sampleMemos: Memo[] = [
  {
    id: 'm1',
    text: '前半15分、右サイドから決定機',
    tags: ['決定機シーン'],
    source: 'manual',
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: 'm2',
    text: '相手は4-4-2でブロックを作る',
    tags: ['フォーメーション'],
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

    expect(addMemo).toHaveBeenCalledWith('u1', 'p1', { text: '後半から3バックへ変更', tags: [] });
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

  it('タグで絞り込める', async () => {
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    await userEvent.selectOptions(screen.getByLabelText('タグで絞り込み'), 'フォーメーション');

    expect(screen.queryByText('前半15分、右サイドから決定機')).not.toBeInTheDocument();
    expect(screen.getByText('相手は4-4-2でブロックを作る')).toBeInTheDocument();
  });

  it('メモにタグを追加できる', async () => {
    (updateMemo as Mock).mockResolvedValue(undefined);
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    const tagInput = screen.getByLabelText('タグを追加: 前半15分、右サイドから決定機');
    await userEvent.type(tagInput, '前半{enter}');

    expect(updateMemo).toHaveBeenCalledWith('u1', 'p1', 'm1', {
      tags: ['決定機シーン', '前半'],
    });
  });

  it('メモのタグを削除できる', async () => {
    (updateMemo as Mock).mockResolvedValue(undefined);
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    await userEvent.click(screen.getByRole('button', { name: 'タグを削除: 決定機シーン' }));

    expect(updateMemo).toHaveBeenCalledWith('u1', 'p1', 'm1', { tags: [] });
  });

  it('新規メモにタグを付けて追加できる', async () => {
    (addMemo as Mock).mockResolvedValue({
      id: 'm3',
      text: '後半から3バックへ変更',
      tags: ['フォーメーション'],
      source: 'manual',
      createdAt: 3000,
      updatedAt: 3000,
    });
    renderMemoArea();
    await screen.findByText('前半15分、右サイドから決定機');

    await userEvent.type(screen.getByLabelText(/メモを入力/), '後半から3バックへ変更');
    await userEvent.type(screen.getByLabelText('タグを追加: 新規メモ'), 'フォーメーション{enter}');
    await userEvent.click(screen.getByRole('button', { name: '追加' }));

    expect(addMemo).toHaveBeenCalledWith('u1', 'p1', {
      text: '後半から3バックへ変更',
      tags: ['フォーメーション'],
    });
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

/** 録音→文字起こし→挿入フロー(Phase6.5) */
describe('MemoArea 音声メモフロー', () => {
  class FakeMediaRecorder {
    static isTypeSupported = () => true;
    mimeType = 'audio/webm';
    ondataavailable: ((event: { data: Blob }) => void) | null = null;
    onstop: (() => void) | null = null;

    start() {}

    stop() {
      this.ondataavailable?.({ data: new Blob(['audio'], { type: 'audio/webm' }) });
      this.onstop?.();
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    (listMemos as Mock).mockResolvedValue([]);
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    saveAiSettings({ provider: 'gemini', geminiKey: 'test-key' });
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] })),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function recordOnce() {
    renderMemoArea();
    await screen.findByText('メモはまだありません');
    await userEvent.click(screen.getByRole('button', { name: /音声メモ/ }));
    await userEvent.click(screen.getByRole('button', { name: /録音停止/ }));
  }

  it('録音停止後に文字起こし結果がプレビューされ、採用でメモに追加される', async () => {
    (transcribeAudio as Mock).mockResolvedValue('前半20分、プレスがはまってきた');
    (addMemo as Mock).mockResolvedValue({
      id: 'v1',
      text: '前半20分、プレスがはまってきた',
      tags: [],
      source: 'voice',
      createdAt: 1,
      updatedAt: 1,
    });

    await recordOnce();

    const preview = await screen.findByLabelText('文字起こし結果');
    expect(preview).toHaveValue('前半20分、プレスがはまってきた');

    await userEvent.click(screen.getByRole('button', { name: 'メモに追加' }));

    expect(addMemo).toHaveBeenCalledWith('u1', 'p1', {
      text: '前半20分、プレスがはまってきた',
      tags: [],
      source: 'voice',
    });
    expect(await screen.findByText('前半20分、プレスがはまってきた')).toBeInTheDocument();
  });

  it('プレビューは編集してから採用できる', async () => {
    (transcribeAudio as Mock).mockResolvedValue('もとのテキスト');
    (addMemo as Mock).mockResolvedValue({
      id: 'v1',
      text: '編集後のテキスト',
      tags: [],
      source: 'voice',
      createdAt: 1,
      updatedAt: 1,
    });

    await recordOnce();
    const preview = await screen.findByLabelText('文字起こし結果');
    await userEvent.clear(preview);
    await userEvent.type(preview, '編集後のテキスト');
    await userEvent.click(screen.getByRole('button', { name: 'メモに追加' }));

    expect(addMemo).toHaveBeenCalledWith('u1', 'p1', {
      text: '編集後のテキスト',
      tags: [],
      source: 'voice',
    });
  });

  it('破棄するとプレビューが消えメモは追加されない', async () => {
    (transcribeAudio as Mock).mockResolvedValue('破棄されるテキスト');

    await recordOnce();
    await screen.findByLabelText('文字起こし結果');
    await userEvent.click(screen.getByRole('button', { name: '破棄' }));

    expect(screen.queryByLabelText('文字起こし結果')).not.toBeInTheDocument();
    expect(addMemo).not.toHaveBeenCalled();
  });

  it('クォータ超過エラーはその旨を表示する', async () => {
    (transcribeAudio as Mock).mockRejectedValue(new TranscriptionError('quota', 'limit'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await recordOnce();

    expect(await screen.findByRole('alert')).toHaveTextContent('利用上限(無料枠)に達しました');
    consoleError.mockRestore();
  });
});
