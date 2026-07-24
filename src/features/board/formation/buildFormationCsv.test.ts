import { buildFormationCsv } from './buildFormationCsv';
import { parseFormationCsv } from './parseFormationCsv';

describe('buildFormationCsv', () => {
  it('両チームをTACTICALista形式で出力する', () => {
    const csv = buildFormationCsv(
      { systemId: '4-4-2', players: [{ number: '1', name: 'GK田中' }] },
      { systemId: '4-3-3', players: [{ number: '1', name: 'GK佐藤' }] },
    );
    expect(csv).toBe('###home,4-4-2\n1,GK田中\n###away,4-3-3\n1,GK佐藤');
  });

  it('片方のチームだけでも出力できる', () => {
    const csv = buildFormationCsv(
      { systemId: '3-5-2', players: [{ number: '10', name: '山田' }] },
      null,
    );
    expect(csv).toBe('###home,3-5-2\n10,山田');
  });

  it('生成したCSVはparseFormationCsvで元のデータに戻る(往復)', () => {
    const csv = buildFormationCsv(
      {
        systemId: '4-4-2',
        players: [
          { number: '1', name: 'GK' },
          { number: '10', name: '10番' },
        ],
      },
      { systemId: '4-3-3', players: [{ number: '9', name: 'FW' }] },
    );
    const parsed = parseFormationCsv(csv);
    expect(parsed.home?.systemId).toBe('4-4-2');
    expect(parsed.home?.players).toHaveLength(2);
    expect(parsed.away?.systemId).toBe('4-3-3');
    expect(parsed.away?.players[0]).toEqual({ number: '9', name: 'FW' });
  });

  it('両チームnullなら空文字列', () => {
    expect(buildFormationCsv(null, null)).toBe('');
  });
});
