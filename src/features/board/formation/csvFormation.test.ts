import { applyCsvFormation, resolveFormation } from './csvFormation';
import { parseFormationCsv } from './parseFormationCsv';
import { FIELD_SPECS } from '../field/fieldSpec';
import { createObjectAt } from '../objects/createObject';
import type { PlayerObject } from '../objects/objectTypes';

function playersOf(objects: readonly { type: string }[]): PlayerObject[] {
  return objects.filter((o): o is PlayerObject => o.type === 'player');
}

function csvForTeam(marker: string, system: string, count: number, prefix: string): string {
  const lines = [`${marker},${system}`];
  for (let i = 1; i <= count; i += 1) {
    lines.push(`${i},${prefix}${i}`);
  }
  return lines.join('\n');
}

describe('resolveFormation', () => {
  it('システムIDが一致すればそのシステムを返す', () => {
    expect(resolveFormation('soccer11', '4-3-3').id).toBe('4-3-3');
  });

  it('見つからない/nullの場合は先頭システムを返す', () => {
    expect(resolveFormation('soccer11', 'unknown').id).toBe('4-4-2');
    expect(resolveFormation('soccer11', null).id).toBe('4-4-2');
  });
});

describe('applyCsvFormation', () => {
  it('両チームを一括配置する(11人制は各11人)', () => {
    const data = parseFormationCsv(
      `${csvForTeam('###home', '4-4-2', 11, 'H')}\n${csvForTeam('###away', '4-3-3', 11, 'A')}`,
    );
    const players = playersOf(applyCsvFormation([], 'soccer11', data));

    expect(players).toHaveLength(22);
    expect(players.filter((p) => p.team === 'home')).toHaveLength(11);
    expect(players.filter((p) => p.team === 'away')).toHaveLength(11);
  });

  it('12人目以降は控え(フィールド外)に配置される', () => {
    const data = parseFormationCsv(csvForTeam('###home', '4-4-2', 13, 'P'));
    const homePlayers = playersOf(applyCsvFormation([], 'soccer11', data)).filter(
      (p) => p.team === 'home',
    );

    expect(homePlayers).toHaveLength(13);
    // 控え(y > フィールド幅)が2人
    const subs = homePlayers.filter((p) => p.y > FIELD_SPECS.soccer11.width);
    expect(subs).toHaveLength(2);
  });

  it('背番号未指定の選手はポジション名になる', () => {
    const data = parseFormationCsv('###home,4-4-2\n,山田');
    const players = playersOf(applyCsvFormation([], 'soccer11', data));
    // 1人目(GK)は背番号未指定なのでポジション名'GK'
    expect(players[0].number).toBe('GK');
    expect(players[0].name).toBe('山田');
  });

  it('既存のプレイヤーは置き換え、ボール等の他オブジェクトは維持する', () => {
    const ball = createObjectAt('ball', 50, 34);
    const oldHome = createObjectAt('player', 10, 10, { team: 'home' });
    const data = parseFormationCsv('###home,4-4-2\n1,GK');

    const result = applyCsvFormation([ball, oldHome], 'soccer11', data);

    expect(result.some((o) => o.id === ball.id)).toBe(true);
    expect(result.some((o) => o.id === oldHome.id)).toBe(false);
    expect(playersOf(result)).toHaveLength(11);
  });

  it('CSVに含まれないチームのプレイヤーは維持する', () => {
    const away = createObjectAt('player', 90, 10, { team: 'away' });
    const data = parseFormationCsv('###home,4-4-2\n1,GK');

    const result = applyCsvFormation([away], 'soccer11', data);

    expect(result.some((o) => o.id === away.id)).toBe(true);
    expect(playersOf(result).filter((p) => p.team === 'home')).toHaveLength(11);
  });

  it('未知のシステム名は先頭システムで配置する', () => {
    const data = parseFormationCsv('###home,unknown-system\n1,GK');
    const players = playersOf(applyCsvFormation([], 'soccer11', data));
    expect(players).toHaveLength(11);
  });
});
