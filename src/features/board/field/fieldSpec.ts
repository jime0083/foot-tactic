/**
 * フィールドの寸法定義。単位はすべてメートル。
 * 描画時はフィールド座標(メートル)をKonvaのscaleでピクセルへ変換する。
 */
export interface FieldSpec {
  /** タッチライン方向の長さ(横向き表示時のx方向) */
  length: number;
  /** ゴールライン方向の幅(横向き表示時のy方向) */
  width: number;
  /** ペナルティエリアの形状。futsalはゴールポスト起点の1/4円弧 */
  penaltyAreaStyle: 'rect' | 'quarterCircle';
  penaltyAreaWidth: number;
  penaltyAreaDepth: number;
  /** ゴールエリアの有無(フットサルはなし) */
  hasGoalArea: boolean;
  goalAreaWidth: number;
  goalAreaDepth: number;
  centerCircleRadius: number;
  penaltySpotDistance: number;
  /** 第2ペナルティマーク(フットサルのみ) */
  secondPenaltySpotDistance?: number;
  /** ペナルティアーク(ペナルティエリア外側の弧)の有無 */
  hasPenaltyArc: boolean;
  cornerArcRadius: number;
  goalWidth: number;
  goalDepth: number;
  /** ラインの太さ */
  lineWidth: number;
}

export type SportType = 'soccer11' | 'soccer8' | 'futsal';

/** 11人制サッカー(105m x 68m) */
export const FIELD_SPEC_SOCCER11: FieldSpec = {
  length: 105,
  width: 68,
  penaltyAreaStyle: 'rect',
  penaltyAreaWidth: 40.32,
  penaltyAreaDepth: 16.5,
  hasGoalArea: true,
  goalAreaWidth: 18.32,
  goalAreaDepth: 5.5,
  centerCircleRadius: 9.15,
  penaltySpotDistance: 11,
  hasPenaltyArc: true,
  cornerArcRadius: 1,
  goalWidth: 7.32,
  goalDepth: 2,
  lineWidth: 0.12,
};

/** 8人制サッカー(JFA少年用: 68m x 50m) */
export const FIELD_SPEC_SOCCER8: FieldSpec = {
  length: 68,
  width: 50,
  penaltyAreaStyle: 'rect',
  penaltyAreaWidth: 24,
  penaltyAreaDepth: 12,
  hasGoalArea: true,
  goalAreaWidth: 12,
  goalAreaDepth: 4,
  centerCircleRadius: 7,
  penaltySpotDistance: 8,
  hasPenaltyArc: false,
  cornerArcRadius: 1,
  goalWidth: 5,
  goalDepth: 1.5,
  lineWidth: 0.1,
};

/** フットサル(40m x 20m) */
export const FIELD_SPEC_FUTSAL: FieldSpec = {
  length: 40,
  width: 20,
  penaltyAreaStyle: 'quarterCircle',
  // quarterCircleではdepthを円弧半径として使用する
  penaltyAreaWidth: 3.16,
  penaltyAreaDepth: 6,
  hasGoalArea: false,
  goalAreaWidth: 0,
  goalAreaDepth: 0,
  centerCircleRadius: 3,
  penaltySpotDistance: 6,
  secondPenaltySpotDistance: 10,
  hasPenaltyArc: false,
  cornerArcRadius: 0.25,
  goalWidth: 3,
  goalDepth: 1,
  lineWidth: 0.08,
};

export const FIELD_SPECS: Record<SportType, FieldSpec> = {
  soccer11: FIELD_SPEC_SOCCER11,
  soccer8: FIELD_SPEC_SOCCER8,
  futsal: FIELD_SPEC_FUTSAL,
};
