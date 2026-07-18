/**
 * ボード上に配置できるオブジェクトの型定義。
 * 座標・サイズはすべてフィールド座標(メートル)。
 */

export type BoardObjectType =
  | 'player'
  | 'ball'
  | 'marker'
  | 'line'
  | 'circle'
  | 'rect'
  | 'polygon'
  | 'polyline'
  | 'text'
  | 'freehand';

export type TeamSide = 'home' | 'away';
export type DominantFoot = 'none' | 'left' | 'right';
export type NamePosition = 'above' | 'below';

interface BaseObject {
  id: string;
  type: BoardObjectType;
  x: number;
  y: number;
  /** 回転角(度) */
  rotation: number;
}

export interface PlayerObject extends BaseObject {
  type: 'player';
  team: TeamSide;
  color: string;
  number: string;
  numberColor: string;
  name: string;
  nameColor: string;
  namePosition: NamePosition;
  showArrow: boolean;
  showArm: boolean;
  dominantFoot: DominantFoot;
}

export interface BallObject extends BaseObject {
  type: 'ball';
  color: string;
}

export interface MarkerObject extends BaseObject {
  type: 'marker';
  color: string;
  size: number;
}

export interface LineObject extends BaseObject {
  type: 'line';
  /** 始点からの相対座標[x1,y1,x2,y2]。オブジェクト位置(x,y)が基準点 */
  points: [number, number, number, number];
  stroke: string;
  strokeWidth: number;
  dashed: boolean;
  /** 終端の矢印 */
  arrow: boolean;
}

export interface CircleObject extends BaseObject {
  type: 'circle';
  radius: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillOpacity: number;
}

export interface RectObject extends BaseObject {
  type: 'rect';
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillOpacity: number;
}

export interface PolygonObject extends BaseObject {
  type: 'polygon';
  /** 相対座標の頂点列[x0,y0,x1,y1,...] */
  points: number[];
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillOpacity: number;
}

export interface PolylineObject extends BaseObject {
  type: 'polyline';
  points: number[];
  stroke: string;
  strokeWidth: number;
  dashed: boolean;
  arrow: boolean;
}

export interface TextObject extends BaseObject {
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
}

export interface FreehandObject extends BaseObject {
  type: 'freehand';
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export type BoardObject =
  | PlayerObject
  | BallObject
  | MarkerObject
  | LineObject
  | CircleObject
  | RectObject
  | PolygonObject
  | PolylineObject
  | TextObject
  | FreehandObject;

/** ツール: 選択または各オブジェクトの配置 */
export type BoardTool = 'select' | BoardObjectType;

export const BOARD_TOOLS: BoardTool[] = [
  'select',
  'player',
  'ball',
  'marker',
  'line',
  'circle',
  'rect',
  'polygon',
  'polyline',
  'text',
  'freehand',
];
