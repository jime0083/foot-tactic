import type { BoardObject } from './objectTypes';

/** 2点間の角度(度)。rotation=0は+x方向 */
export function angleToPoint(fromX: number, fromY: number, toX: number, toY: number): number {
  return (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI;
}

/**
 * 向き表示(矢印/アーム)を持つ全プレイヤーをボールの方向へ向けた
 * 更新済みオブジェクト配列を返す。ボールがない場合はそのまま返す。
 */
export function facePlayersTowardBall(objects: BoardObject[]): BoardObject[] {
  const ball = objects.find((object) => object.type === 'ball');
  if (!ball) {
    return objects;
  }
  return objects.map((object) => {
    if (object.type === 'player' && (object.showArrow || object.showArm)) {
      return { ...object, rotation: angleToPoint(object.x, object.y, ball.x, ball.y) };
    }
    return object;
  });
}
