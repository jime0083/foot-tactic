import { collectTags, filterProjects } from './projectFilter';
import type { ProjectListItem } from './projectService';

const items: ProjectListItem[] = [
  {
    id: 'p1',
    title: 'vs FC東京',
    tags: ['リーグ戦', '分析'],
    sportType: 'soccer11',
    updatedAt: 1,
    previewObjects: [],
  },
  {
    id: 'p2',
    title: 'フットサル練習',
    tags: ['練習'],
    sportType: 'futsal',
    updatedAt: 2,
    previewObjects: [],
  },
  {
    id: 'p3',
    title: 'VS 川崎',
    tags: ['リーグ戦'],
    sportType: 'soccer11',
    updatedAt: 3,
    previewObjects: [],
  },
];

describe('filterProjects', () => {
  it('タイトル部分一致で絞り込む(大文字小文字無視)', () => {
    expect(filterProjects(items, 'vs', '').map((i) => i.id)).toEqual(['p1', 'p3']);
  });

  it('タグ完全一致で絞り込む', () => {
    expect(filterProjects(items, '', 'リーグ戦').map((i) => i.id)).toEqual(['p1', 'p3']);
    expect(filterProjects(items, '', '練習').map((i) => i.id)).toEqual(['p2']);
  });

  it('検索とタグの両方で絞り込める', () => {
    expect(filterProjects(items, '川崎', 'リーグ戦').map((i) => i.id)).toEqual(['p3']);
    expect(filterProjects(items, 'フットサル', 'リーグ戦')).toEqual([]);
  });

  it('空条件では全件を返す', () => {
    expect(filterProjects(items, '', '')).toHaveLength(3);
  });
});

describe('collectTags', () => {
  it('重複なしでタグを集める', () => {
    expect(collectTags(items)).toEqual(['リーグ戦', '分析', '練習']);
  });
});
