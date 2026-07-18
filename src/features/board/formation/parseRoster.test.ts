import { parseRoster } from './parseRoster';

describe('parseRoster', () => {
  it('カンマ区切りの背番号+名前をパースする', () => {
    expect(parseRoster('10,山田\n7,佐藤')).toEqual([
      { number: '10', name: '山田' },
      { number: '7', name: '佐藤' },
    ]);
  });

  it('タブ区切り(スプレッドシートからのペースト)に対応する', () => {
    expect(parseRoster('10\t山田')).toEqual([{ number: '10', name: '山田' }]);
  });

  it('背番号のみ・名前のみの行に対応する', () => {
    expect(parseRoster('10\n山田')).toEqual([
      { number: '10', name: '' },
      { number: '', name: '山田' },
    ]);
  });

  it('空行と前後の空白を無視する', () => {
    expect(parseRoster('  10 , 山田 \n\n\n7,佐藤\n')).toEqual([
      { number: '10', name: '山田' },
      { number: '7', name: '佐藤' },
    ]);
  });

  it('空文字列は空配列を返す', () => {
    expect(parseRoster('')).toEqual([]);
  });

  it('4桁以上の数値は名前として扱う', () => {
    expect(parseRoster('2026')).toEqual([{ number: '', name: '2026' }]);
  });
});
