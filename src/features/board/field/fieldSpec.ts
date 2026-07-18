/**
 * フィールドの寸法定義。単位はすべてメートル。
 * 描画時はフィールド座標(メートル)をKonvaのscaleでピクセルへ変換する。
 */
export interface FieldSpec {
  /** タッチライン方向の長さ(横向き表示時のx方向) */
  length: number;
  /** ゴールライン方向の幅(横向き表示時のy方向) */
  width: number;
  penaltyAreaWidth: number;
  penaltyAreaDepth: number;
  goalAreaWidth: number;
  goalAreaDepth: number;
  centerCircleRadius: number;
  penaltySpotDistance: number;
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
  penaltyAreaWidth: 40.32,
  penaltyAreaDepth: 16.5,
  goalAreaWidth: 18.32,
  goalAreaDepth: 5.5,
  centerCircleRadius: 9.15,
  penaltySpotDistance: 11,
  cornerArcRadius: 1,
  goalWidth: 7.32,
  goalDepth: 2,
  lineWidth: 0.12,
};

export const FIELD_SPECS: Record<SportType, FieldSpec> = {
  soccer11: FIELD_SPEC_SOCCER11,
  // 8人制・フットサルの正確な寸法定義はPhase2.2で追加する
  soccer8: FIELD_SPEC_SOCCER11,
  futsal: FIELD_SPEC_SOCCER11,
};
