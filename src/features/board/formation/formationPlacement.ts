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

/** 指定チームの既存プレイヤー(フィールド内=先発)を置き換えて新しいオブジェクト配列を返す */
export function replaceTeamPlayers(
  objects: readonly BoardObject[],
  team: TeamSide,
  players: PlayerObject[],
): BoardObject[] {
  const others = objects.filter((object) => !(object.type === 'player' && object.team === team));
  return [...others, ...players];
}

/** 控え選手の1人あたり間隔(メートル) */
const SUBSTITUTE_SPACING = 3.2;
/** フィールド下端から控え選手までの距離(メートル) */
const SUBSTITUTE_MARGIN = 2.5;

/**
 * 控え選手をフィールド外(下側)に一列で並べたプレイヤー一式を生成する。
 * ホームは左端から右へ、アウェイは右端から左へ並べる。
 */
export function buildSubstitutePlayers(
  spec: FieldSpec,
  team: TeamSide,
  roster: RosterEntry[],
): PlayerObject[] {
  const y = spec.width + SUBSTITUTE_MARGIN;
  return roster.map((entry, index) => {
    const offset = index * SUBSTITUTE_SPACING;
    const x = team === 'home' ? 2 + offset : spec.length - 2 - offset;
    const base = createObjectAt('player', x, y, { team }) as PlayerObject;
    return {
      ...base,
      number: entry.number.trim(),
      name: entry.name,
    };
  });
}

/**
 * 指定チームの控え選手(フィールド外=y座標がフィールド幅を超えるプレイヤー)を
 * 置き換えて新しいオブジェクト配列を返す。先発(フィールド内)は維持する。
 */
export function replaceTeamSubstitutes(
  objects: readonly BoardObject[],
  spec: FieldSpec,
  team: TeamSide,
  players: PlayerObject[],
): BoardObject[] {
  const others = objects.filter(
    (object) => !(object.type === 'player' && object.team === team && object.y > spec.width),
  );
  return [...others, ...players];
}
