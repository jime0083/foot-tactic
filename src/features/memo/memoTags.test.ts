import { collectMemoTags, filterMemosByTag } from './memoTags';
import type { Memo } from './memoTypes';

const memos: Memo[] = [
  {
    id: 'm1',
    text: 'a',
    tags: ['フォーメーション', '前半'],
    source: 'manual',
    createdAt: 1,
    updatedAt: 1,
  },
  { id: 'm2', text: 'b', tags: ['決定機シーン'], source: 'manual', createdAt: 2, updatedAt: 2 },
  { id: 'm3', text: 'c', tags: ['前半'], source: 'voice', createdAt: 3, updatedAt: 3 },
];

describe('collectMemoTags', () => {
  it('重複なしでタグを集める', () => {
    expect(collectMemoTags(memos)).toEqual(['フォーメーション', '前半', '決定機シーン']);
  });

  it('メモがなければ空配列を返す', () => {
    expect(collectMemoTags([])).toEqual([]);
  });
});

describe('filterMemosByTag', () => {
  it('タグでメモを絞り込む', () => {
    expect(filterMemosByTag(memos, '前半').map((m) => m.id)).toEqual(['m1', 'm3']);
    expect(filterMemosByTag(memos, '決定機シーン').map((m) => m.id)).toEqual(['m2']);
  });

  it('空タグは全件を返す', () => {
    expect(filterMemosByTag(memos, '')).toHaveLength(3);
  });
});
