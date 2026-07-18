import {
  computeViewTransform,
  fieldPointToScreen,
  FIELD_LAYOUT_IDS,
  FIELD_LAYOUTS,
} from './fieldLayouts';
import { FIELD_SPEC_SOCCER11 } from './fieldSpec';

describe('FIELD_LAYOUTS', () => {
  it('8種類のレイアウトが定義されている', () => {
    expect(FIELD_LAYOUT_IDS).toHaveLength(8);
    for (const id of FIELD_LAYOUT_IDS) {
      expect(FIELD_LAYOUTS[id].id).toBe(id);
    }
  });

  it('全景レイアウトはフィールド全体を表示する', () => {
    const region = FIELD_LAYOUTS['full-landscape'].region(FIELD_SPEC_SOCCER11);
    expect(region).toEqual({ x: 0, y: 0, width: 105, height: 68 });
  });

  it('自陣ハーフはフィールド左半分、敵陣ハーフは右半分を表示する', () => {
    const home = FIELD_LAYOUTS['half-home-landscape'].region(FIELD_SPEC_SOCCER11);
    const away = FIELD_LAYOUTS['half-away-landscape'].region(FIELD_SPEC_SOCCER11);
    expect(home).toEqual({ x: 0, y: 0, width: 52.5, height: 68 });
    expect(away).toEqual({ x: 52.5, y: 0, width: 52.5, height: 68 });
  });

  it('縦向きレイアウトはrotatedがtrueになる', () => {
    expect(FIELD_LAYOUTS['full-portrait'].rotated).toBe(true);
    expect(FIELD_LAYOUTS['full-landscape'].rotated).toBe(false);
  });
});

describe('computeViewTransform', () => {
  const fullRegion = { x: 0, y: 0, width: 105, height: 68 };

  it('横向きではフィールド中心がコンテナ中心に一致する', () => {
    const transform = computeViewTransform(1130, 760, fullRegion, false, 4);
    const center = fieldPointToScreen(transform, 52.5, 34);
    expect(center.x).toBeCloseTo(565);
    expect(center.y).toBeCloseTo(380);
    expect(transform.rotation).toBe(0);
  });

  it('縦向きではフィールドが回転しホームゴール(x=0)が画面下になる', () => {
    const transform = computeViewTransform(760, 1130, fullRegion, true, 4);
    expect(transform.rotation).toBe(-90);
    const center = fieldPointToScreen(transform, 52.5, 34);
    expect(center.x).toBeCloseTo(380);
    expect(center.y).toBeCloseTo(565);
    const homeGoal = fieldPointToScreen(transform, 0, 34);
    const awayGoal = fieldPointToScreen(transform, 105, 34);
    // ホームゴールの方が画面下(yが大きい)
    expect(homeGoal.y).toBeGreaterThan(awayGoal.y);
  });

  it('縦向きでは幅と高さを入れ替えてスケールを計算する', () => {
    // 表示領域68x105+余白8 → 76x113。コンテナ760x1130ならscale=10
    const transform = computeViewTransform(760, 1130, fullRegion, true, 4);
    expect(transform.scale).toBeCloseTo(10);
  });

  it('コンテナサイズが0でも破綻しない', () => {
    const transform = computeViewTransform(0, 0, fullRegion, false, 4);
    expect(transform.scale).toBe(1);
  });
});
