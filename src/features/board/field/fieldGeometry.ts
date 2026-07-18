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
  /** 矩形ペナルティエリア(quarterCircle形式の競技では空) */
  penaltyAreas: RectShape[];
  /** 1/4円弧ペナルティエリア(フットサル)の弧 */
  penaltyAreaArcs: ArcShape[];
  /** 1/4円弧ペナルティエリア(フットサル)の接続ライン */
  penaltyAreaLines: LineShape[];
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

  return {
    border: { x: 0, y: 0, width: length, height: width },
    halfwayLine: { points: [length / 2, 0, length / 2, width] },
    centerCircle: { x: length / 2, y: centerY, radius: spec.centerCircleRadius, filled: false },
    centerSpot: { x: length / 2, y: centerY, radius: spec.lineWidth * 2, filled: true },
    penaltyAreas:
      spec.penaltyAreaStyle === 'rect'
        ? [
            areaRect(0, spec.penaltyAreaWidth, spec.penaltyAreaDepth, centerY, false),
            areaRect(length, spec.penaltyAreaWidth, spec.penaltyAreaDepth, centerY, true),
          ]
        : [],
    penaltyAreaArcs: spec.penaltyAreaStyle === 'quarterCircle' ? buildFutsalPaArcs(spec) : [],
    penaltyAreaLines: spec.penaltyAreaStyle === 'quarterCircle' ? buildFutsalPaLines(spec) : [],
    goalAreas: spec.hasGoalArea
      ? [
          areaRect(0, spec.goalAreaWidth, spec.goalAreaDepth, centerY, false),
          areaRect(length, spec.goalAreaWidth, spec.goalAreaDepth, centerY, true),
        ]
      : [],
    penaltySpots: buildPenaltySpots(spec),
    penaltyArcs: spec.hasPenaltyArc ? buildPenaltyArcs(spec) : [],
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

function buildPenaltySpots(spec: FieldSpec): CircleShape[] {
  const centerY = spec.width / 2;
  const radius = spec.lineWidth * 2;
  const spots: CircleShape[] = [
    { x: spec.penaltySpotDistance, y: centerY, radius, filled: true },
    { x: spec.length - spec.penaltySpotDistance, y: centerY, radius, filled: true },
  ];
  if (spec.secondPenaltySpotDistance !== undefined) {
    spots.push(
      { x: spec.secondPenaltySpotDistance, y: centerY, radius, filled: true },
      { x: spec.length - spec.secondPenaltySpotDistance, y: centerY, radius, filled: true },
    );
  }
  return spots;
}

/** ペナルティエリア外側の弧(ペナルティアーク) */
function buildPenaltyArcs(spec: FieldSpec): ArcShape[] {
  const centerY = spec.width / 2;
  const arcHalfAngle = toDegrees(
    Math.acos((spec.penaltyAreaDepth - spec.penaltySpotDistance) / spec.centerCircleRadius),
  );
  return [
    {
      x: spec.penaltySpotDistance,
      y: centerY,
      radius: spec.centerCircleRadius,
      rotation: -arcHalfAngle,
      angle: arcHalfAngle * 2,
    },
    {
      x: spec.length - spec.penaltySpotDistance,
      y: centerY,
      radius: spec.centerCircleRadius,
      rotation: 180 - arcHalfAngle,
      angle: arcHalfAngle * 2,
    },
  ];
}

/** フットサルのペナルティエリア: 両ゴールポスト起点の1/4円弧 */
function buildFutsalPaArcs(spec: FieldSpec): ArcShape[] {
  const centerY = spec.width / 2;
  const halfLine = spec.penaltyAreaWidth / 2;
  const radius = spec.penaltyAreaDepth;
  const topPostY = centerY - halfLine;
  const bottomPostY = centerY + halfLine;
  return [
    // 左ゴール: 上ポスト起点(ゴールラインから上方向→フィールド内へ90度)
    { x: 0, y: topPostY, radius, rotation: -90, angle: 90 },
    // 左ゴール: 下ポスト起点
    { x: 0, y: bottomPostY, radius, rotation: 0, angle: 90 },
    // 右ゴール: 上ポスト起点
    { x: spec.length, y: topPostY, radius, rotation: 180, angle: 90 },
    // 右ゴール: 下ポスト起点
    { x: spec.length, y: bottomPostY, radius, rotation: 90, angle: 90 },
  ];
}

/** フットサルのペナルティエリア: 弧同士を結ぶゴールラインと平行なライン */
function buildFutsalPaLines(spec: FieldSpec): LineShape[] {
  const centerY = spec.width / 2;
  const halfLine = spec.penaltyAreaWidth / 2;
  const depth = spec.penaltyAreaDepth;
  return [
    { points: [depth, centerY - halfLine, depth, centerY + halfLine] },
    {
      points: [spec.length - depth, centerY - halfLine, spec.length - depth, centerY + halfLine],
    },
  ];
}

/** レーン(縦分割): フィールドをゴールライン方向にcount分割した横帯 */
export function buildLaneRects(spec: FieldSpec, count = 5): RectShape[] {
  const laneHeight = spec.width / count;
  return Array.from({ length: count }, (_, index) => ({
    x: 0,
    y: index * laneHeight,
    width: spec.length,
    height: laneHeight,
  }));
}

/** ゾーン(横分割): フィールドをタッチライン方向にcount分割した縦帯 */
export function buildZoneRects(spec: FieldSpec, count = 3): RectShape[] {
  const zoneWidth = spec.length / count;
  return Array.from({ length: count }, (_, index) => ({
    x: index * zoneWidth,
    y: 0,
    width: zoneWidth,
    height: spec.width,
  }));
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
