import type { FieldSpec } from './fieldSpec';

/** フィールドの向き・表示領域(8種類) */
export const FIELD_LAYOUT_IDS = [
  'full-landscape',
  'full-portrait',
  'half-home-landscape',
  'half-away-landscape',
  'half-home-portrait',
  'half-away-portrait',
  'penalty-home-portrait',
  'penalty-away-portrait',
] as const;

export type FieldLayoutId = (typeof FIELD_LAYOUT_IDS)[number];

export interface FieldRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FieldLayout {
  id: FieldLayoutId;
  /** 縦向き表示(フィールドを回転して表示)かどうか */
  rotated: boolean;
  /** 表示するフィールド領域(フィールド座標・メートル) */
  region: (spec: FieldSpec) => FieldRegion;
}

/** ゴール前表示でゴールラインから含める奥行きの割合(フィールド長に対して) */
const PENALTY_VIEW_DEPTH_RATIO = 0.33;

export const FIELD_LAYOUTS: Record<FieldLayoutId, FieldLayout> = {
  'full-landscape': {
    id: 'full-landscape',
    rotated: false,
    region: (spec) => ({ x: 0, y: 0, width: spec.length, height: spec.width }),
  },
  'full-portrait': {
    id: 'full-portrait',
    rotated: true,
    region: (spec) => ({ x: 0, y: 0, width: spec.length, height: spec.width }),
  },
  'half-home-landscape': {
    id: 'half-home-landscape',
    rotated: false,
    region: (spec) => ({ x: 0, y: 0, width: spec.length / 2, height: spec.width }),
  },
  'half-away-landscape': {
    id: 'half-away-landscape',
    rotated: false,
    region: (spec) => ({
      x: spec.length / 2,
      y: 0,
      width: spec.length / 2,
      height: spec.width,
    }),
  },
  'half-home-portrait': {
    id: 'half-home-portrait',
    rotated: true,
    region: (spec) => ({ x: 0, y: 0, width: spec.length / 2, height: spec.width }),
  },
  'half-away-portrait': {
    id: 'half-away-portrait',
    rotated: true,
    region: (spec) => ({
      x: spec.length / 2,
      y: 0,
      width: spec.length / 2,
      height: spec.width,
    }),
  },
  'penalty-home-portrait': {
    id: 'penalty-home-portrait',
    rotated: true,
    region: (spec) => ({
      x: 0,
      y: 0,
      width: spec.length * PENALTY_VIEW_DEPTH_RATIO,
      height: spec.width,
    }),
  },
  'penalty-away-portrait': {
    id: 'penalty-away-portrait',
    rotated: true,
    region: (spec) => ({
      x: spec.length * (1 - PENALTY_VIEW_DEPTH_RATIO),
      y: 0,
      width: spec.length * PENALTY_VIEW_DEPTH_RATIO,
      height: spec.width,
    }),
  },
};

export interface ViewTransform {
  scale: number;
  x: number;
  y: number;
  /** Konva Stageのrotation(度)。縦向きは-90度(ホームが下から上へ攻める) */
  rotation: number;
}

/**
 * コンテナサイズに合わせて表示領域(フィールド座標)を収めるKonva Stage変換を計算する。
 * アスペクト比を維持し、中央寄せで配置する。
 * 縦向き(rotated)は-90度回転し、ホーム側(x小)が画面下になる。
 */
export function computeViewTransform(
  containerWidth: number,
  containerHeight: number,
  region: FieldRegion,
  rotated: boolean,
  paddingMeters: number,
): ViewTransform {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { scale: 1, x: 0, y: 0, rotation: rotated ? -90 : 0 };
  }
  const viewWidth = (rotated ? region.height : region.width) + paddingMeters * 2;
  const viewHeight = (rotated ? region.width : region.height) + paddingMeters * 2;
  const scale = Math.min(containerWidth / viewWidth, containerHeight / viewHeight);

  const regionCenterX = region.x + region.width / 2;
  const regionCenterY = region.y + region.height / 2;

  if (!rotated) {
    return {
      scale,
      x: containerWidth / 2 - regionCenterX * scale,
      y: containerHeight / 2 - regionCenterY * scale,
      rotation: 0,
    };
  }
  // rotation=-90: フィールド座標(fx, fy) → 画面座標(x + fy*scale, y - fx*scale)
  return {
    scale,
    x: containerWidth / 2 - regionCenterY * scale,
    y: containerHeight / 2 + regionCenterX * scale,
    rotation: -90,
  };
}

/** フィールド座標を画面座標へ変換する(検証・テスト用) */
export function fieldPointToScreen(
  transform: ViewTransform,
  fieldX: number,
  fieldY: number,
): { x: number; y: number } {
  if (transform.rotation === 0) {
    return {
      x: transform.x + fieldX * transform.scale,
      y: transform.y + fieldY * transform.scale,
    };
  }
  return {
    x: transform.x + fieldY * transform.scale,
    y: transform.y - fieldX * transform.scale,
  };
}
