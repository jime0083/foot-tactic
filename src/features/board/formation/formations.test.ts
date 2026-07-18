import { FIELD_SPEC_SOCCER11 } from '../field/fieldSpec';
import {
  buildFormationPlayers,
  buildSubstitutePlayers,
  replaceTeamPlayers,
  replaceTeamSubstitutes,
} from './formationPlacement';
import { FORMATIONS } from './formations';
import { createObjectAt } from '../objects/createObject';
import type { PlayerObject } from '../objects/objectTypes';

describe('FORMATIONS データ定義', () => {
  it('11人制は11人、8人制は8人、フットサルは5人で構成される', () => {
    for (const formation of FORMATIONS.soccer11) {
      expect(formation.spots).toHaveLength(11);
    }
    for (const formation of FORMATIONS.soccer8) {
      expect(formation.spots).toHaveLength(8);
    }
    for (const formation of FORMATIONS.futsal) {
      expect(formation.spots).toHaveLength(5);
    }
  });

  it('全スポットのdepth/widthは0〜1の範囲に収まる', () => {
    for (const formations of Object.values(FORMATIONS)) {
      for (const formation of formations) {
        for (const spot of formation.spots) {
          expect(spot.depth).toBeGreaterThanOrEqual(0);
          expect(spot.depth).toBeLessThanOrEqual(1);
          expect(spot.width).toBeGreaterThanOrEqual(0);
          expect(spot.width).toBeLessThanOrEqual(1);
          expect(spot.position).toBeTruthy();
        }
      }
    }
  });
});

describe('buildFormationPlayers', () => {
  const formation442 = FORMATIONS.soccer11[0];

  it('ホームは自陣(左半面)に11人配置される', () => {
    const players = buildFormationPlayers(FIELD_SPEC_SOCCER11, formation442, 'home');
    expect(players).toHaveLength(11);
    for (const player of players) {
      expect(player.team).toBe('home');
      expect(player.x).toBeLessThanOrEqual(52.5);
      expect(player.rotation).toBe(0);
    }
    // GKは自ゴール近く
    expect(players[0].x).toBeCloseTo(0.06 * 52.5);
  });

  it('アウェイは反対側にミラー配置される', () => {
    const players = buildFormationPlayers(FIELD_SPEC_SOCCER11, formation442, 'away');
    for (const player of players) {
      expect(player.x).toBeGreaterThanOrEqual(52.5);
      expect(player.rotation).toBe(180);
    }
    expect(players[0].x).toBeCloseTo(105 - 0.06 * 52.5);
  });

  it('中央基準ではフィールド中央50%の範囲に配置される', () => {
    const players = buildFormationPlayers(FIELD_SPEC_SOCCER11, formation442, 'home', {
      centered: true,
    });
    for (const player of players) {
      expect(player.x).toBeGreaterThanOrEqual(105 * 0.25);
      expect(player.x).toBeLessThanOrEqual(105 * 0.75);
    }
  });

  it('選手リストがない場合はポジション名を表示する', () => {
    const players = buildFormationPlayers(FIELD_SPEC_SOCCER11, formation442, 'home');
    expect(players[0].number).toBe('GK');
    expect(players[10].number).toBe('ST');
  });

  it('選手リストの背番号・名前が順に適用され、背番号省略時はポジション名になる', () => {
    const players = buildFormationPlayers(FIELD_SPEC_SOCCER11, formation442, 'home', {
      roster: [
        { number: '1', name: 'GK選手' },
        { number: '', name: '左SB' },
      ],
    });
    expect(players[0].number).toBe('1');
    expect(players[0].name).toBe('GK選手');
    expect(players[1].number).toBe('LB'); // 背番号省略→ポジション名
    expect(players[1].name).toBe('左SB');
    expect(players[2].name).toBe('');
  });
});

describe('buildSubstitutePlayers / replaceTeamSubstitutes', () => {
  const roster = [
    { number: '12', name: '控えGK' },
    { number: '13', name: '控えDF' },
  ];

  it('控えはフィールド外(下側)に等間隔で並ぶ', () => {
    const subs = buildSubstitutePlayers(FIELD_SPEC_SOCCER11, 'home', roster);
    expect(subs).toHaveLength(2);
    for (const player of subs) {
      expect(player.y).toBeGreaterThan(FIELD_SPEC_SOCCER11.width);
    }
    expect(subs[1].x).toBeGreaterThan(subs[0].x);
    expect(subs[0].number).toBe('12');
    expect(subs[0].name).toBe('控えGK');
  });

  it('アウェイの控えは右端から左へ並ぶ', () => {
    const subs = buildSubstitutePlayers(FIELD_SPEC_SOCCER11, 'away', roster);
    expect(subs[0].x).toBeGreaterThan(subs[1].x);
    expect(subs[0].x).toBeCloseTo(103);
  });

  it('控えの置換では先発(フィールド内)を維持する', () => {
    const starters = buildFormationPlayers(FIELD_SPEC_SOCCER11, FORMATIONS.soccer11[0], 'home');
    const oldSubs = buildSubstitutePlayers(FIELD_SPEC_SOCCER11, 'home', [
      { number: '99', name: '旧控え' },
    ]);
    const newSubs = buildSubstitutePlayers(FIELD_SPEC_SOCCER11, 'home', roster);

    const result = replaceTeamSubstitutes(
      [...starters, ...oldSubs],
      FIELD_SPEC_SOCCER11,
      'home',
      newSubs,
    );

    expect(result).toHaveLength(11 + 2);
    expect(result.some((object) => object.id === oldSubs[0].id)).toBe(false);
    expect(result.filter((object) => starters.some((s) => s.id === object.id))).toHaveLength(11);
  });
});

describe('replaceTeamPlayers', () => {
  it('同チームのプレイヤーだけを置き換える', () => {
    const homePlayer = createObjectAt('player', 10, 10, { team: 'home' }) as PlayerObject;
    const awayPlayer = createObjectAt('player', 90, 10, { team: 'away' }) as PlayerObject;
    const ball = createObjectAt('ball', 50, 34);
    const newPlayers = buildFormationPlayers(FIELD_SPEC_SOCCER11, FORMATIONS.soccer11[0], 'home');

    const result = replaceTeamPlayers([homePlayer, awayPlayer, ball], 'home', newPlayers);

    expect(result).toHaveLength(2 + 11);
    expect(result.some((object) => object.id === homePlayer.id)).toBe(false);
    expect(result.some((object) => object.id === awayPlayer.id)).toBe(true);
    expect(result.some((object) => object.id === ball.id)).toBe(true);
  });
});
