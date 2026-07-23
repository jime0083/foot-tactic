import { hasAnyTeam, parseFormationCsv } from './parseFormationCsv';

describe('parseFormationCsv', () => {
  it('###home/###awayマーカーでチームとシステムを検出する', () => {
    const data = parseFormationCsv('###home,4-4-2\n1,GK\n###away,4-3-3\n1,GKア');
    expect(data.home?.systemId).toBe('4-4-2');
    expect(data.away?.systemId).toBe('4-3-3');
  });

  it('選手行を「背番号,名前」でパースする', () => {
    const data = parseFormationCsv('###home,4-4-2\n10,山田\n7,佐藤');
    expect(data.home?.players).toEqual([
      { number: '10', name: '山田' },
      { number: '7', name: '佐藤' },
    ]);
  });

  it('システム名省略(###homeのみ)はsystemId=null', () => {
    const data = parseFormationCsv('###home\n1,GK');
    expect(data.home?.systemId).toBeNull();
    expect(data.home?.players).toHaveLength(1);
  });

  it('タブ区切り(Excelペースト)に対応する', () => {
    const data = parseFormationCsv('###home\t4-4-2\n10\t山田');
    expect(data.home?.systemId).toBe('4-4-2');
    expect(data.home?.players[0]).toEqual({ number: '10', name: '山田' });
  });

  it('マーカーより前の行は無視する', () => {
    const data = parseFormationCsv('メモ\n999,無視\n###home,4-4-2\n1,GK');
    expect(data.home?.players).toEqual([{ number: '1', name: 'GK' }]);
  });

  it('片方のチームのみでも良い', () => {
    const data = parseFormationCsv('###away,4-3-3\n1,GK');
    expect(data.home).toBeNull();
    expect(data.away?.players).toHaveLength(1);
  });

  it('空行を無視する', () => {
    const data = parseFormationCsv('###home,4-4-2\n\n1,GK\n\n');
    expect(data.home?.players).toHaveLength(1);
  });

  it('背番号のみ・名前のみの行に対応する', () => {
    const data = parseFormationCsv('###home\n10\n山田');
    expect(data.home?.players).toEqual([
      { number: '10', name: '' },
      { number: '', name: '山田' },
    ]);
  });

  it('マーカーの大文字小文字を無視する', () => {
    const data = parseFormationCsv('###HOME,4-4-2\n1,GK');
    expect(data.home?.systemId).toBe('4-4-2');
  });
});

describe('hasAnyTeam', () => {
  it('チームが1つでもあればtrue', () => {
    expect(hasAnyTeam({ home: { systemId: null, players: [] }, away: null })).toBe(true);
  });

  it('両方nullならfalse', () => {
    expect(hasAnyTeam({ home: null, away: null })).toBe(false);
  });
});
