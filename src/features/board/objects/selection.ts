import type { Point } from '../boardView';
import type { BoardObject, BoardObjectType } from './objectTypes';

export interface RectBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 2点から正規化した矩形範囲を求める */
export function normalizeRect(a: Point, b: Point): RectBounds {
  return {
    minX: Math.min(a.x, b.x),
    minY: Math.min(a.y, b.y),
    maxX: Math.max(a.x, b.x),
    maxY: Math.max(a.y, b.y),
  };
}

/** 矩形範囲内に基準点があるオブジェクトのIDを返す */
export function selectIdsInRect(objects: BoardObject[], bounds: RectBounds): string[] {
  return objects
    .filter(
      (object) =>
        object.x >= bounds.minX &&
        object.x <= bounds.maxX &&
        object.y >= bounds.minY &&
        object.y <= bounds.maxY,
    )
    .map((object) => object.id);
}

/** 指定種類の全オブジェクトのIDを返す */
export function idsOfType(objects: BoardObject[], type: BoardObjectType): string[] {
  return objects.filter((object) => object.type === type).map((object) => object.id);
}

/** Shift+クリックによる選択トグル後のID一覧を返す */
export function toggleSelection(selectedIds: string[], id: string): string[] {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

/** フォーム入力中はDelete/Backspaceによるオブジェクト削除を無効にする */
export function isEditableElement(element: Element | null): boolean {
  if (!element) {
    return false;
  }
  const tagName = element.tagName;
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    (element as HTMLElement).isContentEditable === true
  );
}
