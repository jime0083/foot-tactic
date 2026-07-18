import type { FieldSpec } from '../field/fieldSpec';
import { createObjectAt } from '../objects/createObject';
import type { BoardObject, PlayerObject, TeamSide } from '../objects/objectTypes';
import type { Formation } from './formations';

/** 選手リストの1エントリ(Phase3.2でCSV入力から生成) */
export interface RosterEntry {
  number: string;
  name: string;
}

export interface PlaceFormationOptions {
  /** trueの場合、自陣ではなくフィールド中央を基準に配置する */
  centered?: boolean;
  roster?: RosterEntry[];
}

/**
 * フォーメーションからプレイヤーオブジェクト一式を生成する。
 * - home: 自陣(左/下)側に配置。away: 反対側にミラー配置
 * - 背番号が未指定のスポットにはポジション名を表示する
 */
export function buildFormationPlayers(
  spec: FieldSpec,
  formation: Formation,
  team: TeamSide,
  options: PlaceFormationOptions = {},
): PlayerObject[] {
  const { centered = false, roster = [] } = options;
  return formation.spots.map((spot, index) => {
    const entry = roster[index];
    // 自陣配置: ゴールライン→ハーフウェーの半面。中央基準: フィールド中央50%の範囲
    const depthX = centered
      ? (0.25 + spot.depth * 0.5) * spec.length
      : spot.depth * (spec.length / 2);
    const x = team === 'home' ? depthX : spec.length - depthX;
    const y = spot.width * spec.width;
    const base = createObjectAt('player', x, y, { team }) as PlayerObject;
    return {
      ...base,
      // ホームは右向き(+x)、アウェイは左向きに攻撃方向を初期化
      rotation: team === 'home' ? 0 : 180,
      number: entry?.number.trim() ? entry.number.trim() : spot.position,
      name: entry?.name ?? '',
    };
  });
}

/** 指定チームの既存プレイヤーを置き換えて新しいオブジェクト配列を返す */
export function replaceTeamPlayers(
  objects: readonly BoardObject[],
  team: TeamSide,
  players: PlayerObject[],
): BoardObject[] {
  const others = objects.filter((object) => !(object.type === 'player' && object.team === team));
  return [...others, ...players];
}
