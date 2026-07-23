import type { RosterEntry } from './formationPlacement';

export interface CsvTeamData {
  /** システム名(例: "4-4-2")。マーカー行にシステム名がなければnull */
  systemId: string | null;
  /** 選手一覧(先発・控えの区別なし。配置時に先発人数で分割する) */
  players: RosterEntry[];
}

export interface CsvFormationData {
  home: CsvTeamData | null;
  away: CsvTeamData | null;
}

const HOME_MARKER = '###home';
const AWAY_MARKER = '###away';

/** カンマ/タブ/全角読点でセルに分割する */
function splitCells(line: string): string[] {
  return line.split(/[,\t、]/).map((cell) => cell.trim());
}

/** 「背番号,名前」または「名前」1行をパースする(parseRosterと同じ規則) */
function parsePlayerLine(cells: string[]): RosterEntry {
  const [first, ...rest] = cells;
  if (/^\d{1,3}$/.test(first)) {
    return { number: first, name: rest.join(' ').trim() };
  }
  return { number: '', name: [first, ...rest].join(' ').trim() };
}

/**
 * TACTICALista互換のCSVをパースする。
 * - 「###home」または「###home,4-4-2」の行でホームチーム開始(2セル目がシステム名)
 * - 「###away」または「###away,4-3-3」の行でアウェイチーム開始
 * - 以降の「背番号,名前」行がそのチームの選手(マーカーが現れるまで)
 * - マーカーより前の行は無視する
 */
export function parseFormationCsv(text: string): CsvFormationData {
  const result: CsvFormationData = { home: null, away: null };
  let current: 'home' | 'away' | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '') {
      continue;
    }
    const cells = splitCells(line);
    const marker = cells[0].toLowerCase();
    if (marker === HOME_MARKER) {
      current = 'home';
      result.home = { systemId: cells[1] ? cells[1] : null, players: [] };
      continue;
    }
    if (marker === AWAY_MARKER) {
      current = 'away';
      result.away = { systemId: cells[1] ? cells[1] : null, players: [] };
      continue;
    }
    if (current === null) {
      continue;
    }
    const team = current === 'home' ? result.home : result.away;
    team?.players.push(parsePlayerLine(cells));
  }
  return result;
}

/** パース結果に有効なチームデータ(###home/###away)が1つ以上含まれるか */
export function hasAnyTeam(data: CsvFormationData): boolean {
  return data.home !== null || data.away !== null;
}
