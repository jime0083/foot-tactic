import type { FieldSpec } from './fieldSpec';

export interface RectShape {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LineShape {
  points: [number, number, number, number];
}

export interface CircleShape {
  x: number;
  y: number;
  radius: number;
  filled: boolean;
}

export interface ArcShape {
  x: number;
  y: number;
  radius: number;
  /** 開始角度(度)。Konvaのrotationに対応 */
  rotation: number;
  /** 弧の角度(度) */
  angle: number;
}

export interface FieldShapes {
  /** フィールド外周 */
  border: RectShape;
  /** ハーフウェーライン */
  halfwayLine: LineShape;
  centerCircle: CircleShape;
  centerSpot: CircleShape;
  penaltyAreas: RectShape[];
  goalAreas: RectShape[];
  penaltySpots: CircleShape[];
  penaltyArcs: ArcShape[];
  cornerArcs: ArcShape[];
  goals: RectShape[];
}

/**
 * フィールド仕様から描画用の図形一覧を組み立てる。
 * 座標系: 横向きフィールド。原点はフィールド左上、x=タッチライン方向、y=ゴールライン方向。
 */
export function buildFieldShapes(spec: FieldSpec): FieldShapes {
  const { length, width } = spec;
  const centerY = width / 2;

  // ペナルティアークの角度: ペナルティエリアのラインと交わる位置まで
  const arcHalfAngle = toDegrees(
    Math.acos((spec.penaltyAreaDepth - spec.penaltySpotDistance) / spec.centerCircleRadius),
  );

  return {
    border: { x: 0, y: 0, width: length, height: width },
    halfwayLine: { points: [length / 2, 0, length / 2, width] },
    centerCircle: { x: length / 2, y: centerY, radius: spec.centerCircleRadius, filled: false },
    centerSpot: { x: length / 2, y: centerY, radius: spec.lineWidth * 2, filled: true },
    penaltyAreas: [
      areaRect(0, spec.penaltyAreaWidth, spec.penaltyAreaDepth, centerY, false),
      areaRect(length, spec.penaltyAreaWidth, spec.penaltyAreaDepth, centerY, true),
    ],
    goalAreas: [
      areaRect(0, spec.goalAreaWidth, spec.goalAreaDepth, centerY, false),
      areaRect(length, spec.goalAreaWidth, spec.goalAreaDepth, centerY, true),
    ],
    penaltySpots: [
      { x: spec.penaltySpotDistance, y: centerY, radius: spec.lineWidth * 2, filled: true },
      {
        x: length - spec.penaltySpotDistance,
        y: centerY,
        radius: spec.lineWidth * 2,
        filled: true,
      },
    ],
    penaltyArcs: [
      {
        x: spec.penaltySpotDistance,
        y: centerY,
        radius: spec.centerCircleRadius,
        rotation: -arcHalfAngle,
        angle: arcHalfAngle * 2,
      },
      {
        x: length - spec.penaltySpotDistance,
        y: centerY,
        radius: spec.centerCircleRadius,
        rotation: 180 - arcHalfAngle,
        angle: arcHalfAngle * 2,
      },
    ],
    cornerArcs: [
      { x: 0, y: 0, radius: spec.cornerArcRadius, rotation: 0, angle: 90 },
      { x: length, y: 0, radius: spec.cornerArcRadius, rotation: 90, angle: 90 },
      { x: length, y: width, radius: spec.cornerArcRadius, rotation: 180, angle: 90 },
      { x: 0, y: width, radius: spec.cornerArcRadius, rotation: 270, angle: 90 },
    ],
    goals: [
      {
        x: -spec.goalDepth,
        y: centerY - spec.goalWidth / 2,
        width: spec.goalDepth,
        height: spec.goalWidth,
      },
      {
        x: length,
        y: centerY - spec.goalWidth / 2,
        width: spec.goalDepth,
        height: spec.goalWidth,
      },
    ],
  };
}

/** ゴールライン起点のエリア(ペナルティエリア/ゴールエリア)の矩形を求める */
function areaRect(
  goalLineX: number,
  areaWidth: number,
  areaDepth: number,
  centerY: number,
  mirrored: boolean,
): RectShape {
  return {
    x: mirrored ? goalLineX - areaDepth : goalLineX,
    y: centerY - areaWidth / 2,
    width: areaDepth,
    height: areaWidth,
  };
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export interface FieldTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * コンテナサイズに合わせてフィールド(メートル座標)を収めるscale/offsetを計算する。
 * アスペクト比を維持し、中央寄せで配置する。
 */
export function computeFieldTransform(
  containerWidth: number,
  containerHeight: number,
  fieldLength: number,
  fieldWidth: number,
  paddingMeters: number,
): FieldTransform {
  const totalLength = fieldLength + paddingMeters * 2;
  const totalWidth = fieldWidth + paddingMeters * 2;
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { scale: 1, offsetX: paddingMeters, offsetY: paddingMeters };
  }
  const scale = Math.min(containerWidth / totalLength, containerHeight / totalWidth);
  const offsetX = (containerWidth - fieldLength * scale) / 2;
  const offsetY = (containerHeight - fieldWidth * scale) / 2;
  return { scale, offsetX, offsetY };
}
