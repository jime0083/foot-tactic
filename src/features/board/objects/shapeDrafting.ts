import type { Point } from '../boardView';
import { createObjectAt } from './createObject';
import type { BoardObject } from './objectTypes';

/** これ未満のドラッグ距離(メートル)は単純クリックとみなし既定サイズで配置する */
export const MIN_DRAG_METERS = 0.8;

/** 頂点確定時に直前の頂点とこの距離未満なら重複として除去する */
const DUPLICATE_VERTEX_METERS = 0.3;

export type DragShapeType = 'line' | 'circle' | 'rect';
export type VertexShapeType = 'polygon' | 'polyline';

/** ドラッグ操作(始点→終点)からライン/円形/矩形を生成する */
export function buildDragShape(type: DragShapeType, start: Point, end: Point): BoardObject {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const base = createObjectAt(type, start.x, start.y);
  if (distance < MIN_DRAG_METERS) {
    return base;
  }
  switch (base.type) {
    case 'line':
      return { ...base, points: [0, 0, dx, dy] };
    case 'circle':
      return { ...base, radius: distance };
    case 'rect':
      return {
        ...base,
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(dx),
        height: Math.abs(dy),
      };
    default:
      return base;
  }
}

/** 重複する連続頂点を取り除く */
export function dedupeVertices(vertices: Point[]): Point[] {
  return vertices.filter((vertex, index) => {
    if (index === 0) {
      return true;
    }
    const previous = vertices[index - 1];
    return Math.hypot(vertex.x - previous.x, vertex.y - previous.y) >= DUPLICATE_VERTEX_METERS;
  });
}

/** 手書き軌跡に点を追加する(直前の点から一定距離未満は間引く) */
export const FREEHAND_MIN_STEP_METERS = 0.15;

export function appendFreehandPoint(points: Point[], point: Point): Point[] {
  const last = points[points.length - 1];
  if (last && Math.hypot(point.x - last.x, point.y - last.y) < FREEHAND_MIN_STEP_METERS) {
    return points;
  }
  return [...points, point];
}

/** 手書き軌跡からフリーハンドオブジェクトを生成する。点が2未満ならnull */
export function buildFreehandShape(trace: Point[]): BoardObject | null {
  if (trace.length < 2) {
    return null;
  }
  const [origin, ...rest] = trace;
  const base = createObjectAt('freehand', origin.x, origin.y);
  if (base.type !== 'freehand') {
    return null;
  }
  return {
    ...base,
    points: [0, 0, ...rest.flatMap((point) => [point.x - origin.x, point.y - origin.y])],
  };
}

/**
 * クリックで集めた頂点列からポリゴン/ポリラインを生成する。
 * 頂点数が不足している場合(ポリゴン3未満/ポリライン2未満)はnullを返す。
 */
export function buildVertexShape(type: VertexShapeType, vertices: Point[]): BoardObject | null {
  const unique = dedupeVertices(vertices);
  const minCount = type === 'polygon' ? 3 : 2;
  if (unique.length < minCount) {
    return null;
  }
  const [origin, ...rest] = unique;
  const points = [0, 0, ...rest.flatMap((vertex) => [vertex.x - origin.x, vertex.y - origin.y])];
  const base = createObjectAt(type, origin.x, origin.y);
  if (base.type === 'polygon' || base.type === 'polyline') {
    return { ...base, points };
  }
  return null;
}
