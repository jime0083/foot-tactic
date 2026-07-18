import { buildFieldShapes, computeFieldTransform } from './fieldGeometry';
import { FIELD_SPEC_SOCCER11 } from './fieldSpec';

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

describe('computeFieldTransform', () => {
  it('横長コンテナでは高さ基準でスケールし中央寄せする', () => {
    // フィールド105x68+余白4m→113x76。コンテナ1130x380では高さが制約になる
    const transform = computeFieldTransform(1130, 380, 105, 68, 4);
    expect(transform.scale).toBeCloseTo(5);
    expect(transform.offsetY).toBeCloseTo((380 - 68 * 5) / 2);
    expect(transform.offsetX).toBeCloseTo((1130 - 105 * 5) / 2);
  });

  it('縦長コンテナでは幅基準でスケールする', () => {
    const transform = computeFieldTransform(565, 1000, 105, 68, 4);
    expect(transform.scale).toBeCloseTo(5);
  });

  it('コンテナサイズが0の場合でも破綻しない', () => {
    const transform = computeFieldTransform(0, 0, 105, 68, 4);
    expect(transform.scale).toBe(1);
  });
});
