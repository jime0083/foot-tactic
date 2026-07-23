import { FIELD_SPECS, type SportType } from '../field/fieldSpec';
import type { BoardObject, TeamSide } from '../objects/objectTypes';
import { buildFormationPlayers, buildSubstitutePlayers } from './formationPlacement';
import { FORMATIONS, type Formation } from './formations';
import type { CsvFormationData } from './parseFormationCsv';

const TEAMS: TeamSide[] = ['home', 'away'];

/** システムIDを解決する。見つからなければそのsportTypeの先頭システムを使う */
export function resolveFormation(sportType: SportType, systemId: string | null): Formation {
  const list = FORMATIONS[sportType];
  if (systemId) {
    const found = list.find((formation) => formation.id === systemId.trim());
    if (found) {
      return found;
    }
  }
  return list[0];
}

/**
 * パース済みCSVデータから両チームのプレイヤーを配置した新しいobjects配列を返す。
 * - 各チーム: システム名から先発を自動配置し、先発人数を超えた選手は控えに自動割当
 * - CSVに含まれるチームの既存プレイヤー(先発・控え)は全て置き換える
 * - CSVに含まれないチーム、およびプレイヤー以外のオブジェクトは維持する
 */
export function applyCsvFormation(
  objects: readonly BoardObject[],
  sportType: SportType,
  data: CsvFormationData,
): BoardObject[] {
  const spec = FIELD_SPECS[sportType];
  let result: BoardObject[] = [...objects];

  for (const team of TEAMS) {
    const teamData = data[team];
    if (!teamData) {
      continue;
    }
    const formation = resolveFormation(sportType, teamData.systemId);
    const starterCount = formation.spots.length;
    const starters = teamData.players.slice(0, starterCount);
    const substitutes = teamData.players.slice(starterCount);
    const starterPlayers = buildFormationPlayers(spec, formation, team, { roster: starters });
    const subPlayers = buildSubstitutePlayers(spec, team, substitutes);
    // このチームの既存プレイヤー(先発・控え両方)を除去して置き換える
    result = result.filter((object) => !(object.type === 'player' && object.team === team));
    result = [...result, ...starterPlayers, ...subPlayers];
  }
  return result;
}
