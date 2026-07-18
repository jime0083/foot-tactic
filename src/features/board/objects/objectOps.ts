import { generateObjectId } from './createObject';
import type { BoardObject } from './objectTypes';

/** 複製・貼り付け時のオフセット(メートル) */
export const CLONE_OFFSET_METERS = 2;

/** オブジェクトを新しいIDとオフセット付きで複製する */
export function cloneObjects(objects: BoardObject[], offset = CLONE_OFFSET_METERS): BoardObject[] {
  return objects.map(
    (object) =>
      ({
        ...object,
        id: generateObjectId(),
        x: object.x + offset,
        y: object.y + offset,
      }) as BoardObject,
  );
}

/** 指定IDのオブジェクトを配列末尾(最前面)へ移動する */
export function bringToFront(objects: BoardObject[], ids: string[]): BoardObject[] {
  const targets = objects.filter((object) => ids.includes(object.id));
  const others = objects.filter((object) => !ids.includes(object.id));
  return [...others, ...targets];
}

/** 指定IDのオブジェクトを配列先頭(最背面)へ移動する */
export function sendToBack(objects: BoardObject[], ids: string[]): BoardObject[] {
  const targets = objects.filter((object) => ids.includes(object.id));
  const others = objects.filter((object) => !ids.includes(object.id));
  return [...targets, ...others];
}

export interface NodeTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

/**
 * KonvaのTransformer操作結果(位置・回転・スケール)をオブジェクトのプロパティへ反映する。
 * スケールはサイズ系プロパティに焼き込み、ノード側のscaleは1に戻す前提。
 */
export function applyNodeTransform(
  object: BoardObject,
  transform: NodeTransform,
): Partial<BoardObject> {
  const base = { x: transform.x, y: transform.y, rotation: transform.rotation };
  switch (object.type) {
    case 'circle':
      return { ...base, rotation: 0, radius: object.radius * Math.abs(transform.scaleX) };
    case 'rect':
      return {
        ...base,
        width: object.width * Math.abs(transform.scaleX),
        height: object.height * Math.abs(transform.scaleY),
      };
    case 'text':
      return { ...base, fontSize: object.fontSize * Math.abs(transform.scaleY) };
    case 'line':
    case 'polygon':
    case 'polyline':
    case 'freehand': {
      const points = object.points.map((value, index) =>
        index % 2 === 0 ? value * transform.scaleX : value * transform.scaleY,
      );
      return { ...base, points } as Partial<BoardObject>;
    }
    default:
      // player/ball/markerはTransformer対象外(移動・回転ハンドルで操作)
      return { x: transform.x, y: transform.y };
  }
}
