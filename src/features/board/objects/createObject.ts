import type { BoardObject, BoardObjectType, TeamSide } from './objectTypes';

export const HOME_COLOR = '#d32f2f';
export const AWAY_COLOR = '#1976d2';
export const DEFAULT_STROKE = '#ffff00';

export interface CreateObjectOptions {
  team?: TeamSide;
}

let idCounter = 0;

export function generateObjectId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // テスト環境などcrypto.randomUUIDがない場合のフォールバック
  idCounter += 1;
  return `obj-${Date.now()}-${idCounter}`;
}

/** 指定座標(フィールド座標・メートル)に既定値でオブジェクトを生成する */
export function createObjectAt(
  type: BoardObjectType,
  x: number,
  y: number,
  options: CreateObjectOptions = {},
): BoardObject {
  const base = { id: generateObjectId(), x, y, rotation: 0 };
  switch (type) {
    case 'player':
      return {
        ...base,
        type: 'player',
        team: options.team ?? 'home',
        color: options.team === 'away' ? AWAY_COLOR : HOME_COLOR,
        number: '',
        numberColor: '#ffffff',
        name: '',
        nameColor: '#ffffff',
        namePosition: 'below',
        showArrow: false,
        showArm: false,
        dominantFoot: 'none',
      };
    case 'ball':
      return { ...base, type: 'ball', color: '#ffffff' };
    case 'marker':
      return { ...base, type: 'marker', color: '#ff9800', size: 2 };
    case 'line':
      return {
        ...base,
        type: 'line',
        points: [0, 0, 8, 0],
        stroke: DEFAULT_STROKE,
        strokeWidth: 0.3,
        dashed: false,
        arrow: false,
      };
    case 'circle':
      return {
        ...base,
        type: 'circle',
        radius: 4,
        stroke: DEFAULT_STROKE,
        strokeWidth: 0.3,
        fill: DEFAULT_STROKE,
        fillOpacity: 0,
      };
    case 'rect':
      return {
        ...base,
        type: 'rect',
        width: 8,
        height: 6,
        stroke: DEFAULT_STROKE,
        strokeWidth: 0.3,
        fill: DEFAULT_STROKE,
        fillOpacity: 0,
      };
    case 'polygon':
      return {
        ...base,
        type: 'polygon',
        points: [0, 0, 8, 0, 4, 6],
        stroke: DEFAULT_STROKE,
        strokeWidth: 0.3,
        fill: DEFAULT_STROKE,
        fillOpacity: 0.2,
      };
    case 'polyline':
      return {
        ...base,
        type: 'polyline',
        points: [0, 0, 6, -4, 12, 0],
        stroke: DEFAULT_STROKE,
        strokeWidth: 0.3,
        dashed: false,
        arrow: false,
      };
    case 'text':
      return { ...base, type: 'text', text: 'Text', color: '#ffffff', fontSize: 2.5 };
    case 'freehand':
      return {
        ...base,
        type: 'freehand',
        points: [0, 0],
        stroke: DEFAULT_STROKE,
        strokeWidth: 0.3,
      };
  }
}
