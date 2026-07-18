import type { ViewTransform } from './field/fieldLayouts';

export interface PanOffset {
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

/** ズーム下限(1=ウィンドウフィット) */
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 8;

export const ZERO_PAN: PanOffset = { x: 0, y: 0 };

export function clampZoom(zoom: number): number {
  if (Number.isNaN(zoom)) {
    return MIN_ZOOM;
  }
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

/**
 * ベースのフィット変換にユーザーのズーム・パンを合成する。
 * ズームはコンテナ中心を基準に拡大し、パンはピクセル単位の平行移動。
 */
export function composeStageTransform(
  base: ViewTransform,
  zoom: number,
  pan: PanOffset,
  center: Point,
): ViewTransform {
  return {
    scale: base.scale * zoom,
    x: zoom * (base.x - center.x) + center.x + pan.x,
    y: zoom * (base.y - center.y) + center.y + pan.y,
    rotation: base.rotation,
  };
}

/**
 * 指定した画面上の点(ポインタ位置)を固定したままズーム値を変更した際の
 * 新しいズームとパンを求める。
 */
export function zoomAtPoint(
  currentZoom: number,
  currentPan: PanOffset,
  nextZoomRaw: number,
  point: Point,
  center: Point,
): { zoom: number; pan: PanOffset } {
  const zoom = clampZoom(nextZoomRaw);
  if (zoom === MIN_ZOOM) {
    // フィット表示に戻ったらパンもリセットする
    return { zoom, pan: ZERO_PAN };
  }
  const ratio = zoom / currentZoom;
  return {
    zoom,
    pan: {
      x: point.x - center.x - ratio * (point.x - center.x - currentPan.x),
      y: point.y - center.y - ratio * (point.y - center.y - currentPan.y),
    },
  };
}

/** ホイールのdeltaYからズーム倍率係数を求める */
export function wheelZoomFactor(deltaY: number): number {
  return Math.exp(-deltaY * 0.002);
}

/** 画面座標(Stage内ピクセル)をフィールド座標(メートル)へ変換する */
export function screenToField(transform: ViewTransform, point: Point): Point {
  if (transform.rotation === 0) {
    return {
      x: (point.x - transform.x) / transform.scale,
      y: (point.y - transform.y) / transform.scale,
    };
  }
  // rotation=-90: 画面(x,y) = (t.x + fy*s, t.y - fx*s) の逆変換
  return {
    x: (transform.y - point.y) / transform.scale,
    y: (point.x - transform.x) / transform.scale,
  };
}
