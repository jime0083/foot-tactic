export interface FieldColors {
  background: string;
  line: string;
  /** レーン(縦5分割)の塗り色 */
  lane: string;
  /** レーンの不透明度(0〜1)。0で非表示 */
  laneOpacity: number;
  /** ゾーン(横3分割)の塗り色 */
  zone: string;
  /** ゾーンの不透明度(0〜1)。0で非表示 */
  zoneOpacity: number;
}

export const DEFAULT_FIELD_COLORS: FieldColors = {
  background: '#2e7d32',
  line: '#ffffff',
  lane: '#ffeb3b',
  laneOpacity: 0,
  zone: '#03a9f4',
  zoneOpacity: 0,
};
