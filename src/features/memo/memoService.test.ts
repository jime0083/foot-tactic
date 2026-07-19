import { vi, type Mock } from 'vitest';
import { addDoc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { addMemo, deleteMemo, listMemos, updateMemo } from './memoService';
import { MEMO_TEXT_MAX_LENGTH } from './memoTypes';

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ path: 'users/u1/projects/p1/memos' })),
  doc: vi.fn(() => ({ path: 'users/u1/projects/p1/memos/m1' })),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

describe('memoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addMemo: 前後の空白を除去して保存し、作成メモを返す', async () => {
    (addDoc as Mock).mockResolvedValue({ id: 'm1' });

    const memo = await addMemo('u1', 'p1', { text: '  決定機  ', tags: ['前半'] });

    expect(memo.id).toBe('m1');
    expect(memo.text).toBe('決定機');
    expect(memo.tags).toEqual(['前半']);
    expect(memo.source).toBe('manual');
    const payload = (addDoc as Mock).mock.calls[0][1];
    expect(payload.createdAt).toBeGreaterThan(0);
    expect(payload.updatedAt).toBe(payload.createdAt);
  });

  it('addMemo: 空文字は拒否される', async () => {
    await expect(addMemo('u1', 'p1', { text: '   ' })).rejects.toThrow();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('addMemo: 最大文字数を超えると拒否される', async () => {
    const longText = 'あ'.repeat(MEMO_TEXT_MAX_LENGTH + 1);
    await expect(addMemo('u1', 'p1', { text: longText })).rejects.toThrow();
  });

  it('listMemos: 作成日時の古い順に並べ、不正データを補正する', async () => {
    (getDocs as Mock).mockResolvedValue({
      docs: [
        { id: 'b', data: () => ({ text: '2件目', tags: [], createdAt: 2000, updatedAt: 2000 }) },
        {
          id: 'a',
          data: () => ({ text: '1件目', tags: 'broken', source: 'voice', createdAt: 1000 }),
        },
      ],
    });

    const memos = await listMemos('u1', 'p1');

    expect(memos.map((memo) => memo.id)).toEqual(['a', 'b']);
    expect(memos[0].tags).toEqual([]);
    expect(memos[0].source).toBe('voice');
    expect(memos[0].updatedAt).toBe(0);
  });

  it('updateMemo: 本文とタグを更新しupdatedAtを進める', async () => {
    (updateDoc as Mock).mockResolvedValue(undefined);

    await updateMemo('u1', 'p1', 'm1', { text: '修正後', tags: ['後半'] });

    const payload = (updateDoc as Mock).mock.calls[0][1];
    expect(payload.text).toBe('修正後');
    expect(payload.tags).toEqual(['後半']);
    expect(payload.updatedAt).toBeGreaterThan(0);
  });

  it('updateMemo: 空文字への更新は拒否される', async () => {
    await expect(updateMemo('u1', 'p1', 'm1', { text: '' })).rejects.toThrow();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('deleteMemo: ドキュメントを削除する', async () => {
    (deleteDoc as Mock).mockResolvedValue(undefined);
    await deleteMemo('u1', 'p1', 'm1');
    expect(deleteDoc).toHaveBeenCalled();
  });
});
