import { createObjectAt, AWAY_COLOR, HOME_COLOR } from './createObject';
import { withOpacity } from './objectStyles';
import type { BoardObjectType } from './objectTypes';

const ALL_TYPES: BoardObjectType[] = [
  'player',
  'ball',
  'marker',
  'line',
  'circle',
  'rect',
  'polygon',
  'polyline',
  'text',
  'freehand',
];

describe('createObjectAt', () => {
  it('10種類すべてのオブジェクトを生成できる', () => {
    for (const type of ALL_TYPES) {
      const object = createObjectAt(type, 10, 20);
      expect(object.type).toBe(type);
      expect(object.x).toBe(10);
      expect(object.y).toBe(20);
      expect(object.id).toBeTruthy();
    }
  });

  it('IDは生成のたびに一意になる', () => {
    const first = createObjectAt('ball', 0, 0);
    const second = createObjectAt('ball', 0, 0);
    expect(first.id).not.toBe(second.id);
  });

  it('プレイヤーはチームに応じた色になる', () => {
    const home = createObjectAt('player', 0, 0, { team: 'home' });
    const away = createObjectAt('player', 0, 0, { team: 'away' });
    expect(home.type === 'player' && home.color).toBe(HOME_COLOR);
    expect(away.type === 'player' && away.color).toBe(AWAY_COLOR);
    expect(away.type === 'player' && away.team).toBe('away');
  });
});

describe('withOpacity', () => {
  it('16進カラーを不透明度付きrgbaへ変換する', () => {
    expect(withOpacity('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('不透明度0はundefined(塗りなし)を返す', () => {
    expect(withOpacity('#ff0000', 0)).toBeUndefined();
  });
});
