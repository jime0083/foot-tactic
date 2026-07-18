import { buildFieldShapes, buildLaneRects, buildZoneRects } from './fieldGeometry';
import { FIELD_SPEC_FUTSAL, FIELD_SPEC_SOCCER8, FIELD_SPEC_SOCCER11 } from './fieldSpec';

describe('buildFieldShapes(11人制)', () => {
  const shapes = buildFieldShapes(FIELD_SPEC_SOCCER11);

  it('フィールド外周が105x68で原点から始まる', () => {
    expect(shapes.border).toEqual({ x: 0, y: 0, width: 105, height: 68 });
  });

  it('ハーフウェーラインがフィールド中央を縦断する', () => {
    expect(shapes.halfwayLine.points).toEqual([52.5, 0, 52.5, 68]);
  });

  it('センターサークルが中央に半径9.15で配置される', () => {
    expect(shapes.centerCircle).toMatchObject({ x: 52.5, y: 34, radius: 9.15 });
  });

  it('ペナルティエリアが両ゴール前に正しく配置される', () => {
    const [left, right] = shapes.penaltyAreas;
    expect(left).toEqual({ x: 0, y: 34 - 40.32 / 2, width: 16.5, height: 40.32 });
    expect(right).toEqual({ x: 105 - 16.5, y: 34 - 40.32 / 2, width: 16.5, height: 40.32 });
  });

  it('ゴールエリアが両ゴール前に正しく配置される', () => {
    const [left, right] = shapes.goalAreas;
    expect(left).toEqual({ x: 0, y: 34 - 18.32 / 2, width: 5.5, height: 18.32 });
    expect(right).toEqual({ x: 105 - 5.5, y: 34 - 18.32 / 2, width: 5.5, height: 18.32 });
  });

  it('ペナルティスポットがゴールラインから11mに配置される', () => {
    expect(shapes.penaltySpots[0]).toMatchObject({ x: 11, y: 34 });
    expect(shapes.penaltySpots[1]).toMatchObject({ x: 94, y: 34 });
  });

  it('ペナルティアークの角度がエリアラインと接する角度になる', () => {
    const expectedHalfAngle = (Math.acos((16.5 - 11) / 9.15) * 180) / Math.PI;
    const [left, right] = shapes.penaltyArcs;
    expect(left.angle).toBeCloseTo(expectedHalfAngle * 2, 5);
    expect(left.rotation).toBeCloseTo(-expectedHalfAngle, 5);
    expect(right.rotation).toBeCloseTo(180 - expectedHalfAngle, 5);
  });

  it('コーナーアークが四隅に4つ配置される', () => {
    expect(shapes.cornerArcs).toHaveLength(4);
    expect(shapes.cornerArcs.map((arc) => [arc.x, arc.y])).toEqual([
      [0, 0],
      [105, 0],
      [105, 68],
      [0, 68],
    ]);
  });

  it('ゴールがフィールド外側に配置される', () => {
    const [left, right] = shapes.goals;
    expect(left.x).toBeCloseTo(-2);
    expect(right.x).toBe(105);
    expect(left.height).toBeCloseTo(7.32);
  });
});

describe('buildLaneRects / buildZoneRects', () => {
  it('レーンはフィールドを縦に5分割した横帯になる', () => {
    const lanes = buildLaneRects(FIELD_SPEC_SOCCER11);
    expect(lanes).toHaveLength(5);
    expect(lanes[0]).toEqual({ x: 0, y: 0, width: 105, height: 13.6 });
    expect(lanes[4].y).toBeCloseTo(54.4);
  });

  it('ゾーンはフィールドを横に3分割した縦帯になる', () => {
    const zones = buildZoneRects(FIELD_SPEC_SOCCER11);
    expect(zones).toHaveLength(3);
    expect(zones[0]).toEqual({ x: 0, y: 0, width: 35, height: 68 });
    expect(zones[2].x).toBeCloseTo(70);
  });
});

describe('buildFieldShapes(8人制)', () => {
  const shapes = buildFieldShapes(FIELD_SPEC_SOCCER8);

  it('フィールド外周が68x50になる', () => {
    expect(shapes.border).toEqual({ x: 0, y: 0, width: 68, height: 50 });
  });

  it('矩形ペナルティエリアとゴールエリアを持つ', () => {
    expect(shapes.penaltyAreas).toHaveLength(2);
    expect(shapes.goalAreas).toHaveLength(2);
    expect(shapes.penaltyAreaArcs).toHaveLength(0);
  });

  it('ペナルティアークは描画しない', () => {
    expect(shapes.penaltyArcs).toHaveLength(0);
  });
});

describe('buildFieldShapes(フットサル)', () => {
  const shapes = buildFieldShapes(FIELD_SPEC_FUTSAL);

  it('フィールド外周が40x20になる', () => {
    expect(shapes.border).toEqual({ x: 0, y: 0, width: 40, height: 20 });
  });

  it('ペナルティエリアは1/4円弧4つ+接続ライン2本で構成される', () => {
    expect(shapes.penaltyAreas).toHaveLength(0);
    expect(shapes.penaltyAreaArcs).toHaveLength(4);
    expect(shapes.penaltyAreaLines).toHaveLength(2);
    // 左側の接続ラインはゴールラインから6mの位置
    expect(shapes.penaltyAreaLines[0].points[0]).toBe(6);
  });

  it('ゴールエリアはなし、第2ペナルティマークを含む4つのスポットを持つ', () => {
    expect(shapes.goalAreas).toHaveLength(0);
    expect(shapes.penaltySpots).toHaveLength(4);
    expect(shapes.penaltySpots.map((spot) => spot.x)).toEqual([6, 34, 10, 30]);
  });
});
