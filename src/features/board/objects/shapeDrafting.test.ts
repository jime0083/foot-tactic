import { buildDragShape, buildVertexShape, dedupeVertices } from './shapeDrafting';

describe('buildDragShape', () => {
  it('ドラッグ距離からラインを生成する', () => {
    const object = buildDragShape('line', { x: 10, y: 20 }, { x: 18, y: 26 });
    expect(object).toMatchObject({ type: 'line', x: 10, y: 20, points: [0, 0, 8, 6] });
  });

  it('ドラッグ距離から円形の半径を決める', () => {
    const object = buildDragShape('circle', { x: 50, y: 34 }, { x: 53, y: 38 });
    expect(object.type === 'circle' && object.radius).toBe(5);
  });

  it('矩形は始点と終点の最小座標を原点にする', () => {
    const object = buildDragShape('rect', { x: 30, y: 40 }, { x: 20, y: 10 });
    expect(object).toMatchObject({ type: 'rect', x: 20, y: 10, width: 10, height: 30 });
  });

  it('微小なドラッグは既定サイズで配置する', () => {
    const object = buildDragShape('circle', { x: 10, y: 10 }, { x: 10.2, y: 10.2 });
    expect(object.type === 'circle' && object.radius).toBe(4);
  });
});

describe('dedupeVertices', () => {
  it('連続する重複頂点を取り除く', () => {
    const result = dedupeVertices([
      { x: 0, y: 0 },
      { x: 0.1, y: 0.1 },
      { x: 5, y: 5 },
    ]);
    expect(result).toHaveLength(2);
  });
});

describe('buildVertexShape', () => {
  it('3頂点からポリゴンを生成する(相対座標)', () => {
    const object = buildVertexShape('polygon', [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 15, y: 18 },
    ]);
    expect(object).toMatchObject({
      type: 'polygon',
      x: 10,
      y: 10,
      points: [0, 0, 10, 0, 5, 8],
    });
  });

  it('2頂点からポリラインを生成する', () => {
    const object = buildVertexShape('polyline', [
      { x: 0, y: 0 },
      { x: 10, y: 5 },
    ]);
    expect(object).toMatchObject({ type: 'polyline', points: [0, 0, 10, 5] });
  });

  it('頂点数が不足する場合はnullを返す', () => {
    expect(
      buildVertexShape('polygon', [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]),
    ).toBeNull();
    expect(buildVertexShape('polyline', [{ x: 0, y: 0 }])).toBeNull();
  });

  it('ダブルクリックによる重複頂点は除去して判定する', () => {
    const object = buildVertexShape('polyline', [
      { x: 0, y: 0 },
      { x: 10, y: 5 },
      { x: 10.05, y: 5.05 },
    ]);
    expect(object).toMatchObject({ points: [0, 0, 10, 5] });
  });
});
