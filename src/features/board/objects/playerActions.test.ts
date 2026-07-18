import { angleToPoint, facePlayersTowardBall } from './playerActions';
import { createObjectAt } from './createObject';
import type { BoardObject, PlayerObject } from './objectTypes';

describe('angleToPoint', () => {
  it('右方向は0度、下方向は90度になる', () => {
    expect(angleToPoint(0, 0, 10, 0)).toBeCloseTo(0);
    expect(angleToPoint(0, 0, 0, 10)).toBeCloseTo(90);
    expect(angleToPoint(0, 0, -10, 0)).toBeCloseTo(180);
    expect(angleToPoint(0, 0, 0, -10)).toBeCloseTo(-90);
  });
});

describe('facePlayersTowardBall', () => {
  function makePlayer(x: number, y: number, showArrow: boolean): PlayerObject {
    return { ...(createObjectAt('player', x, y) as PlayerObject), showArrow };
  }

  it('向き表示のあるプレイヤーだけがボール方向を向く', () => {
    const ball = createObjectAt('ball', 50, 34);
    const facing = makePlayer(40, 34, true);
    const notFacing = makePlayer(60, 34, false);
    const objects: BoardObject[] = [facing, notFacing, ball];

    const result = facePlayersTowardBall(objects);

    const updatedFacing = result.find((o) => o.id === facing.id) as PlayerObject;
    const updatedNotFacing = result.find((o) => o.id === notFacing.id) as PlayerObject;
    expect(updatedFacing.rotation).toBeCloseTo(0); // 右にあるボールを向く
    expect(updatedNotFacing.rotation).toBe(0); // 変更されない(初期値のまま)
  });

  it('ボールがない場合は何も変更しない', () => {
    const player = makePlayer(40, 30, true);
    player.rotation = 45;
    const result = facePlayersTowardBall([player]);
    expect((result[0] as PlayerObject).rotation).toBe(45);
  });
});
