import type { ProjectListItem } from './projectService';

/** タイトル部分一致(大文字小文字無視)とタグ完全一致でプロジェクトを絞り込む */
export function filterProjects(
  items: readonly ProjectListItem[],
  query: string,
  tag: string,
): ProjectListItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesQuery =
      normalizedQuery === '' || item.title.toLowerCase().includes(normalizedQuery);
    const matchesTag = tag === '' || item.tags.includes(tag);
    return matchesQuery && matchesTag;
  });
}

/** 全プロジェクトから使用中のタグ一覧(重複なし・出現順)を集める */
export function collectTags(items: readonly ProjectListItem[]): string[] {
  const tags: string[] = [];
  for (const item of items) {
    for (const tag of item.tags) {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
  }
  return tags;
}
