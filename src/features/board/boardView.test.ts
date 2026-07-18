import {
  clampZoom,
  composeStageTransform,
  screenToField,
  wheelZoomFactor,
  zoomAtPoint,
  MAX_ZOOM,
  MIN_ZOOM,
  ZERO_PAN,
} from './boardView';
import type { ViewTransform } from './field/fieldLayouts';

const base: ViewTransform = { scale: 10, x: 100, y: 50, rotation: 0 };
const center = { x: 500, y: 300 };

describe('clampZoom', () => {
  it('範囲内に収める', () => {
    expect(clampZoom(0.5)).toBe(MIN_ZOOM);
    expect(clampZoom(3)).toBe(3);
    expect(clampZoom(100)).toBe(MAX_ZOOM);
    expect(clampZoom(Number.NaN)).toBe(MIN_ZOOM);
  });
});

describe('composeStageTransform', () => {
  it('ズーム1・パン0ではベース変換と一致する', () => {
    const result = composeStageTransform(base, 1, ZERO_PAN, center);
    expect(result).toEqual(base);
  });

  it('ズームはコンテナ中心を基準に拡大する', () => {
    const result = composeStageTransform(base, 2, ZERO_PAN, center);
    // 中心座標は移動しない: 中心に対応するフィールド座標の画面位置が不変
    const fieldAtCenterX = (center.x - base.x) / base.scale;
    expect(result.x + fieldAtCenterX * result.scale).toBeCloseTo(center.x);
    expect(result.scale).toBe(20);
  });

  it('パンはピクセル単位で平行移動する', () => {
    const result = composeStageTransform(base, 2, { x: 30, y: -20 }, center);
    const noPan = composeStageTransform(base, 2, ZERO_PAN, center);
    expect(result.x - noPan.x).toBe(30);
    expect(result.y - noPan.y).toBe(-20);
  });
});

describe('zoomAtPoint', () => {
  it('指定した点の画面位置を維持したままズームする', () => {
    const point = { x: 700, y: 400 };
    const before = composeStageTransform(base, 2, { x: 10, y: 5 }, center);
    // ズーム前にpointにあるフィールド座標
    const fieldX = (point.x - before.x) / before.scale;
    const fieldY = (point.y - before.y) / before.scale;

    const next = zoomAtPoint(2, { x: 10, y: 5 }, 4, point, center);
    const after = composeStageTransform(base, next.zoom, next.pan, center);

    expect(after.x + fieldX * after.scale).toBeCloseTo(point.x);
    expect(after.y + fieldY * after.scale).toBeCloseTo(point.y);
  });

  it('ズームが1に戻るとパンもリセットされる', () => {
    const next = zoomAtPoint(2, { x: 50, y: 50 }, 0.8, { x: 0, y: 0 }, center);
    expect(next.zoom).toBe(1);
    expect(next.pan).toEqual(ZERO_PAN);
  });
});

describe('wheelZoomFactor', () => {
  it('上スクロールで拡大・下スクロールで縮小の係数を返す', () => {
    expect(wheelZoomFactor(-100)).toBeGreaterThan(1);
    expect(wheelZoomFactor(100)).toBeLessThan(1);
    expect(wheelZoomFactor(0)).toBe(1);
  });
});

describe('screenToField', () => {
  it('横向き変換の逆変換になっている', () => {
    const transform: ViewTransform = { scale: 10, x: 100, y: 50, rotation: 0 };
    const field = screenToField(transform, { x: 100 + 52.5 * 10, y: 50 + 34 * 10 });
    expect(field.x).toBeCloseTo(52.5);
    expect(field.y).toBeCloseTo(34);
  });

  it('縦向き(-90度回転)の逆変換になっている', () => {
    const transform: ViewTransform = { scale: 10, x: 100, y: 1200, rotation: -90 };
    // フィールド(fx,fy) → 画面(x + fy*s, y - fx*s)
    const field = screenToField(transform, { x: 100 + 34 * 10, y: 1200 - 52.5 * 10 });
    expect(field.x).toBeCloseTo(52.5);
    expect(field.y).toBeCloseTo(34);
  });
});
