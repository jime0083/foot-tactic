import type { RosterEntry } from './formationPlacement';

export interface CsvBuildTeam {
  systemId: string;
  players: RosterEntry[];
}

/**
 * TACTICALista互換CSVを組み立てる(CSV作成補助ツール用)。
 * 指定されたチーム(home/away)を「###home,<system>」+「番号,名前」行の形式で出力する。
 * nullのチームは出力しない。
 */
export function buildFormationCsv(home: CsvBuildTeam | null, away: CsvBuildTeam | null): string {
  const lines: string[] = [];
  const appendTeam = (marker: string, team: CsvBuildTeam) => {
    lines.push(`${marker},${team.systemId}`);
    for (const player of team.players) {
      lines.push(`${player.number},${player.name}`);
    }
  };
  if (home) {
    appendTeam('###home', home);
  }
  if (away) {
    appendTeam('###away', away);
  }
  return lines.join('\n');
}
