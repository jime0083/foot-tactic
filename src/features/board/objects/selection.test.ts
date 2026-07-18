import { createObjectAt } from './createObject';
import {
  idsOfType,
  isEditableElement,
  normalizeRect,
  selectIdsInRect,
  toggleSelection,
} from './selection';

describe('normalizeRect', () => {
  it('どの方向のドラッグでも正規化された範囲を返す', () => {
    expect(normalizeRect({ x: 10, y: 20 }, { x: 5, y: 8 })).toEqual({
      minX: 5,
      minY: 8,
      maxX: 10,
      maxY: 20,
    });
  });
});

describe('selectIdsInRect', () => {
  it('範囲内のオブジェクトだけを選択する', () => {
    const inside = createObjectAt('player', 10, 10);
    const outside = createObjectAt('player', 50, 50);
    const ids = selectIdsInRect([inside, outside], { minX: 0, minY: 0, maxX: 20, maxY: 20 });
    expect(ids).toEqual([inside.id]);
  });
});

describe('idsOfType', () => {
  it('種類別に全IDを返す', () => {
    const player1 = createObjectAt('player', 0, 0);
    const player2 = createObjectAt('player', 5, 5);
    const ball = createObjectAt('ball', 10, 10);
    expect(idsOfType([player1, player2, ball], 'player')).toEqual([player1.id, player2.id]);
    expect(idsOfType([player1, player2, ball], 'marker')).toEqual([]);
  });
});

describe('toggleSelection', () => {
  it('未選択なら追加、選択済みなら解除する', () => {
    expect(toggleSelection(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleSelection(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('isEditableElement', () => {
  it('input/textarea/selectを編集中要素と判定する', () => {
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const select = document.createElement('select');
    const div = document.createElement('div');
    expect(isEditableElement(input)).toBe(true);
    expect(isEditableElement(textarea)).toBe(true);
    expect(isEditableElement(select)).toBe(true);
    expect(isEditableElement(div)).toBe(false);
    expect(isEditableElement(null)).toBe(false);
  });
});
