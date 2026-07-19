import type { Memo } from './memoTypes';

/** メモ一覧から使用中のタグ(重複なし・出現順)を集める */
export function collectMemoTags(memos: readonly Memo[]): string[] {
  const tags: string[] = [];
  for (const memo of memos) {
    for (const tag of memo.tags) {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
  }
  return tags;
}

/** タグでメモを絞り込む(空タグは全件) */
export function filterMemosByTag(memos: readonly Memo[], tag: string): Memo[] {
  if (tag === '') {
    return [...memos];
  }
  return memos.filter((memo) => memo.tags.includes(tag));
}
