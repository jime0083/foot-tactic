/** プレイヤーの体の半径(メートル)。全プレイヤー共通(Phase2.6で設定可能にする) */
export const PLAYER_BODY_RADIUS = 1.2;

/** #rrggbb形式の色を不透明度付きのrgba()に変換する。不透明度0はundefined(塗りなし) */
export function withOpacity(hexColor: string, opacity: number): string | undefined {
  if (opacity <= 0) {
    return undefined;
  }
  const match = /^#([0-9a-f]{6})$/i.exec(hexColor);
  if (!match) {
    return hexColor;
  }
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
