import type { RosterEntry } from './formationPlacement';

/**
 * 選手リストのテキスト入力をパースする。CSVペーストに対応。
 * 1行=1人。区切りはカンマ/タブ/全角読点。
 * - "10,山田" → 背番号10・山田
 * - "10" → 背番号10のみ
 * - "山田" → 名前のみ(背番号省略→ポジション名表示)
 */
export function parseRoster(text: string): RosterEntry[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      const [first, ...rest] = line.split(/[,\t、]/).map((token) => token.trim());
      if (/^\d{1,3}$/.test(first)) {
        return { number: first, name: rest.join(' ').trim() };
      }
      return { number: '', name: [first, ...rest].join(' ').trim() };
    });
}
