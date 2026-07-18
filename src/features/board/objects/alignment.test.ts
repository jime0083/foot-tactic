import { alignObjects } from './alignment';
import { createObjectAt } from './createObject';

function setup() {
  const a = createObjectAt('player', 10, 30);
  const b = createObjectAt('player', 20, 10);
  const c = createObjectAt('player', 50, 20);
  return { a, b, c, objects: [a, b, c] };
}

describe('alignObjects', () => {
  it('左揃え: 最小xに揃える', () => {
    const { a, b, c, objects } = setup();
    const result = alignObjects(objects, [a.id, b.id, c.id], 'left');
    expect(result.map((o) => o.x)).toEqual([10, 10, 10]);
  });

  it('右揃え: 最大xに揃える', () => {
    const { a, b, c, objects } = setup();
    const result = alignObjects(objects, [a.id, b.id, c.id], 'right');
    expect(result.map((o) => o.x)).toEqual([50, 50, 50]);
  });

  it('上揃え/下揃え: y座標を揃える', () => {
    const { a, b, c, objects } = setup();
    expect(alignObjects(objects, [a.id, b.id, c.id], 'top').map((o) => o.y)).toEqual([10, 10, 10]);
    expect(alignObjects(objects, [a.id, b.id, c.id], 'bottom').map((o) => o.y)).toEqual([
      30, 30, 30,
    ]);
  });

  it('水平分布: xを等間隔にする', () => {
    const { a, b, c, objects } = setup();
    const result = alignObjects(objects, [a.id, b.id, c.id], 'distributeH');
    expect(result.map((o) => o.x)).toEqual([10, 30, 50]);
  });

  it('垂直分布: yを等間隔にする', () => {
    const { a, b, c, objects } = setup();
    const result = alignObjects(objects, [a.id, b.id, c.id], 'distributeV');
    // ソート順(y昇順: b=10, c=20, a=30)で等間隔
    expect(result.find((o) => o.id === b.id)?.y).toBe(10);
    expect(result.find((o) => o.id === c.id)?.y).toBe(20);
    expect(result.find((o) => o.id === a.id)?.y).toBe(30);
  });

  it('揃えは2個未満、分布は3個未満なら何もしない', () => {
    const { a, objects } = setup();
    expect(alignObjects(objects, [a.id], 'left')).toEqual(objects);
    const { a: a2, b: b2, objects: objects2 } = setup();
    expect(alignObjects(objects2, [a2.id, b2.id], 'distributeH')).toEqual(objects2);
  });

  it('選択外のオブジェクトは変更しない', () => {
    const { a, b, c, objects } = setup();
    const result = alignObjects(objects, [a.id, b.id], 'left');
    expect(result.find((o) => o.id === c.id)?.x).toBe(50);
  });
});
