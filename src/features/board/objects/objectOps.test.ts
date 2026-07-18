import { createObjectAt } from './createObject';
import { applyNodeTransform, bringToFront, cloneObjects, sendToBack } from './objectOps';

describe('cloneObjects', () => {
  it('新しいIDとオフセット付きで複製する', () => {
    const original = createObjectAt('player', 10, 20);
    const [clone] = cloneObjects([original]);
    expect(clone.id).not.toBe(original.id);
    expect(clone.x).toBe(12);
    expect(clone.y).toBe(22);
    expect(clone.type).toBe('player');
  });
});

describe('bringToFront / sendToBack', () => {
  const a = createObjectAt('ball', 0, 0);
  const b = createObjectAt('ball', 1, 1);
  const c = createObjectAt('ball', 2, 2);

  it('指定IDを配列末尾(最前面)へ移動する', () => {
    const result = bringToFront([a, b, c], [a.id]);
    expect(result.map((o) => o.id)).toEqual([b.id, c.id, a.id]);
  });

  it('指定IDを配列先頭(最背面)へ移動する', () => {
    const result = sendToBack([a, b, c], [c.id]);
    expect(result.map((o) => o.id)).toEqual([c.id, a.id, b.id]);
  });
});

describe('applyNodeTransform', () => {
  const transform = { x: 5, y: 6, rotation: 30, scaleX: 2, scaleY: 3 };

  it('円形はスケールを半径へ反映する(回転なし)', () => {
    const circle = createObjectAt('circle', 0, 0);
    const patch = applyNodeTransform(circle, transform);
    expect(patch).toMatchObject({ x: 5, y: 6, rotation: 0, radius: 8 });
  });

  it('矩形はスケールを幅・高さへ反映する', () => {
    const rect = createObjectAt('rect', 0, 0);
    const patch = applyNodeTransform(rect, transform);
    expect(patch).toMatchObject({ x: 5, y: 6, rotation: 30, width: 16, height: 18 });
  });

  it('テキストはスケールをフォントサイズへ反映する', () => {
    const text = createObjectAt('text', 0, 0);
    const patch = applyNodeTransform(text, transform);
    expect(patch).toMatchObject({ fontSize: 7.5 });
  });

  it('ライン系はスケールを頂点座標へ反映する', () => {
    const line = createObjectAt('line', 0, 0);
    const patch = applyNodeTransform(line, transform);
    expect(patch).toMatchObject({ points: [0, 0, 16, 0] });
  });
});
