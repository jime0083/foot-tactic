import type { SportType } from '../field/fieldSpec';

/**
 * フォーメーションの1ポジション。
 * depth: 自陣ゴールライン(0)→ハーフウェーライン(1)方向の位置
 * width: フィールド幅方向(0〜1)の位置
 */
export interface FormationSpot {
  depth: number;
  width: number;
  /** ポジション名(背番号未指定時にプレイヤーへ表示) */
  position: string;
}

export interface Formation {
  id: string;
  label: string;
  spots: FormationSpot[];
}

const SOCCER11_FORMATIONS: Formation[] = [
  {
    id: '4-4-2',
    label: '4-4-2',
    spots: [
      { depth: 0.06, width: 0.5, position: 'GK' },
      { depth: 0.3, width: 0.14, position: 'LB' },
      { depth: 0.27, width: 0.38, position: 'CB' },
      { depth: 0.27, width: 0.62, position: 'CB' },
      { depth: 0.3, width: 0.86, position: 'RB' },
      { depth: 0.55, width: 0.14, position: 'LM' },
      { depth: 0.52, width: 0.38, position: 'CM' },
      { depth: 0.52, width: 0.62, position: 'CM' },
      { depth: 0.55, width: 0.86, position: 'RM' },
      { depth: 0.8, width: 0.4, position: 'ST' },
      { depth: 0.8, width: 0.6, position: 'ST' },
    ],
  },
  {
    id: '4-3-3',
    label: '4-3-3',
    spots: [
      { depth: 0.06, width: 0.5, position: 'GK' },
      { depth: 0.3, width: 0.14, position: 'LB' },
      { depth: 0.27, width: 0.38, position: 'CB' },
      { depth: 0.27, width: 0.62, position: 'CB' },
      { depth: 0.3, width: 0.86, position: 'RB' },
      { depth: 0.45, width: 0.5, position: 'DM' },
      { depth: 0.55, width: 0.3, position: 'CM' },
      { depth: 0.55, width: 0.7, position: 'CM' },
      { depth: 0.78, width: 0.16, position: 'LW' },
      { depth: 0.82, width: 0.5, position: 'CF' },
      { depth: 0.78, width: 0.84, position: 'RW' },
    ],
  },
  {
    id: '4-2-3-1',
    label: '4-2-3-1',
    spots: [
      { depth: 0.06, width: 0.5, position: 'GK' },
      { depth: 0.3, width: 0.14, position: 'LB' },
      { depth: 0.27, width: 0.38, position: 'CB' },
      { depth: 0.27, width: 0.62, position: 'CB' },
      { depth: 0.3, width: 0.86, position: 'RB' },
      { depth: 0.45, width: 0.38, position: 'DM' },
      { depth: 0.45, width: 0.62, position: 'DM' },
      { depth: 0.63, width: 0.18, position: 'LM' },
      { depth: 0.63, width: 0.5, position: 'AM' },
      { depth: 0.63, width: 0.82, position: 'RM' },
      { depth: 0.83, width: 0.5, position: 'CF' },
    ],
  },
  {
    id: '3-5-2',
    label: '3-5-2',
    spots: [
      { depth: 0.06, width: 0.5, position: 'GK' },
      { depth: 0.28, width: 0.25, position: 'CB' },
      { depth: 0.25, width: 0.5, position: 'CB' },
      { depth: 0.28, width: 0.75, position: 'CB' },
      { depth: 0.52, width: 0.08, position: 'LWB' },
      { depth: 0.5, width: 0.32, position: 'CM' },
      { depth: 0.45, width: 0.5, position: 'DM' },
      { depth: 0.5, width: 0.68, position: 'CM' },
      { depth: 0.52, width: 0.92, position: 'RWB' },
      { depth: 0.8, width: 0.4, position: 'ST' },
      { depth: 0.8, width: 0.6, position: 'ST' },
    ],
  },
  {
    id: '3-4-3',
    label: '3-4-3',
    spots: [
      { depth: 0.06, width: 0.5, position: 'GK' },
      { depth: 0.28, width: 0.25, position: 'CB' },
      { depth: 0.25, width: 0.5, position: 'CB' },
      { depth: 0.28, width: 0.75, position: 'CB' },
      { depth: 0.53, width: 0.1, position: 'LM' },
      { depth: 0.5, width: 0.38, position: 'CM' },
      { depth: 0.5, width: 0.62, position: 'CM' },
      { depth: 0.53, width: 0.9, position: 'RM' },
      { depth: 0.78, width: 0.2, position: 'LW' },
      { depth: 0.82, width: 0.5, position: 'CF' },
      { depth: 0.78, width: 0.8, position: 'RW' },
    ],
  },
  {
    id: '5-3-2',
    label: '5-3-2',
    spots: [
      { depth: 0.06, width: 0.5, position: 'GK' },
      { depth: 0.33, width: 0.08, position: 'LWB' },
      { depth: 0.27, width: 0.3, position: 'CB' },
      { depth: 0.25, width: 0.5, position: 'CB' },
      { depth: 0.27, width: 0.7, position: 'CB' },
      { depth: 0.33, width: 0.92, position: 'RWB' },
      { depth: 0.53, width: 0.3, position: 'CM' },
      { depth: 0.5, width: 0.5, position: 'CM' },
      { depth: 0.53, width: 0.7, position: 'CM' },
      { depth: 0.8, width: 0.4, position: 'ST' },
      { depth: 0.8, width: 0.6, position: 'ST' },
    ],
  },
];

const SOCCER8_FORMATIONS: Formation[] = [
  {
    id: '2-3-2',
    label: '2-3-2',
    spots: [
      { depth: 0.08, width: 0.5, position: 'GK' },
      { depth: 0.3, width: 0.35, position: 'CB' },
      { depth: 0.3, width: 0.65, position: 'CB' },
      { depth: 0.55, width: 0.18, position: 'LM' },
      { depth: 0.52, width: 0.5, position: 'CM' },
      { depth: 0.55, width: 0.82, position: 'RM' },
      { depth: 0.8, width: 0.4, position: 'FW' },
      { depth: 0.8, width: 0.6, position: 'FW' },
    ],
  },
  {
    id: '3-3-1',
    label: '3-3-1',
    spots: [
      { depth: 0.08, width: 0.5, position: 'GK' },
      { depth: 0.3, width: 0.2, position: 'DF' },
      { depth: 0.28, width: 0.5, position: 'DF' },
      { depth: 0.3, width: 0.8, position: 'DF' },
      { depth: 0.55, width: 0.2, position: 'MF' },
      { depth: 0.52, width: 0.5, position: 'MF' },
      { depth: 0.55, width: 0.8, position: 'MF' },
      { depth: 0.8, width: 0.5, position: 'FW' },
    ],
  },
  {
    id: '3-2-2',
    label: '3-2-2',
    spots: [
      { depth: 0.08, width: 0.5, position: 'GK' },
      { depth: 0.3, width: 0.2, position: 'DF' },
      { depth: 0.28, width: 0.5, position: 'DF' },
      { depth: 0.3, width: 0.8, position: 'DF' },
      { depth: 0.55, width: 0.35, position: 'MF' },
      { depth: 0.55, width: 0.65, position: 'MF' },
      { depth: 0.8, width: 0.35, position: 'FW' },
      { depth: 0.8, width: 0.65, position: 'FW' },
    ],
  },
];

const FUTSAL_FORMATIONS: Formation[] = [
  {
    id: '1-2-1',
    label: '1-2-1',
    spots: [
      { depth: 0.08, width: 0.5, position: 'GK' },
      { depth: 0.3, width: 0.5, position: 'FIX' },
      { depth: 0.55, width: 0.2, position: 'ALA' },
      { depth: 0.55, width: 0.8, position: 'ALA' },
      { depth: 0.8, width: 0.5, position: 'PIV' },
    ],
  },
  {
    id: '2-2',
    label: '2-2',
    spots: [
      { depth: 0.08, width: 0.5, position: 'GK' },
      { depth: 0.35, width: 0.3, position: 'DF' },
      { depth: 0.35, width: 0.7, position: 'DF' },
      { depth: 0.7, width: 0.3, position: 'FW' },
      { depth: 0.7, width: 0.7, position: 'FW' },
    ],
  },
  {
    id: '3-1',
    label: '3-1',
    spots: [
      { depth: 0.08, width: 0.5, position: 'GK' },
      { depth: 0.35, width: 0.2, position: 'DF' },
      { depth: 0.3, width: 0.5, position: 'DF' },
      { depth: 0.35, width: 0.8, position: 'DF' },
      { depth: 0.75, width: 0.5, position: 'PIV' },
    ],
  },
];

export const FORMATIONS: Record<SportType, Formation[]> = {
  soccer11: SOCCER11_FORMATIONS,
  soccer8: SOCCER8_FORMATIONS,
  futsal: FUTSAL_FORMATIONS,
};
