import type { BoardObject } from './objectTypes';

export type AlignMode = 'left' | 'right' | 'top' | 'bottom' | 'distributeH' | 'distributeV';

/**
 * 選択オブジェクトを整列した新しい配列を返す。
 * 整列はオブジェクトの基準点(x, y)に対して行う。
 * - left/right/top/bottom: 端に揃える(2個以上で有効)
 * - distributeH/distributeV: 両端の間で等間隔に分布(3個以上で有効)
 */
export function alignObjects(
  objects: BoardObject[],
  ids: string[],
  mode: AlignMode,
): BoardObject[] {
  const targets = objects.filter((object) => ids.includes(object.id));
  const minCount = mode === 'distributeH' || mode === 'distributeV' ? 3 : 2;
  if (targets.length < minCount) {
    return objects;
  }

  const patches = new Map<string, Partial<BoardObject>>();

  switch (mode) {
    case 'left': {
      const minX = Math.min(...targets.map((object) => object.x));
      targets.forEach((object) => patches.set(object.id, { x: minX }));
      break;
    }
    case 'right': {
      const maxX = Math.max(...targets.map((object) => object.x));
      targets.forEach((object) => patches.set(object.id, { x: maxX }));
      break;
    }
    case 'top': {
      const minY = Math.min(...targets.map((object) => object.y));
      targets.forEach((object) => patches.set(object.id, { y: minY }));
      break;
    }
    case 'bottom': {
      const maxY = Math.max(...targets.map((object) => object.y));
      targets.forEach((object) => patches.set(object.id, { y: maxY }));
      break;
    }
    case 'distributeH': {
      const sorted = [...targets].sort((a, b) => a.x - b.x);
      const min = sorted[0].x;
      const max = sorted[sorted.length - 1].x;
      const step = (max - min) / (sorted.length - 1);
      sorted.forEach((object, index) => patches.set(object.id, { x: min + step * index }));
      break;
    }
    case 'distributeV': {
      const sorted = [...targets].sort((a, b) => a.y - b.y);
      const min = sorted[0].y;
      const max = sorted[sorted.length - 1].y;
      const step = (max - min) / (sorted.length - 1);
      sorted.forEach((object, index) => patches.set(object.id, { y: min + step * index }));
      break;
    }
  }

  return objects.map((object) => {
    const patch = patches.get(object.id);
    return patch ? ({ ...object, ...patch } as BoardObject) : object;
  });
}
