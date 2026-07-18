import type { FieldColors } from '@/features/board/field/fieldColors';
import type { FieldLayoutId } from '@/features/board/field/fieldLayouts';
import { FIELD_LAYOUT_IDS } from '@/features/board/field/fieldLayouts';
import type { SportType } from '@/features/board/field/fieldSpec';
import { DEFAULT_FIELD_COLORS } from '@/features/board/field/fieldColors';
import { generateObjectId } from '@/features/board/objects/createObject';
import type { BoardObject } from '@/features/board/objects/objectTypes';
import type { BoardAspect, PlayerDisplaySettings, Scene } from '@/stores/boardStore';
import { DEFAULT_PLAYER_DISPLAY } from '@/stores/boardStore';

/** Firestoreに保存するボードの内容一式 */
export interface BoardSnapshot {
  sportType: SportType;
  layoutId: FieldLayoutId;
  aspect: BoardAspect;
  fieldColors: FieldColors;
  playerDisplay: PlayerDisplaySettings;
  scenes: Scene[];
}

/** プロジェクトのメタ情報 */
export interface ProjectMeta {
  id: string;
  title: string;
  tags: string[];
  sportType: SportType;
  /** 更新日時(ミリ秒)。未保存時はnull */
  updatedAt: number | null;
}

export interface ProjectData {
  meta: ProjectMeta;
  snapshot: BoardSnapshot;
}

/** 新規プロジェクト用の初期スナップショット */
export function createInitialSnapshot(sportType: SportType): BoardSnapshot {
  return {
    sportType,
    layoutId: 'full-landscape',
    aspect: '16:9',
    fieldColors: DEFAULT_FIELD_COLORS,
    playerDisplay: DEFAULT_PLAYER_DISPLAY,
    scenes: [{ id: generateObjectId(), objects: [] }],
  };
}

const SPORT_TYPES: SportType[] = ['soccer11', 'soccer8', 'futsal'];

/**
 * Firestoreから読み込んだ生データをBoardSnapshotとして検証・正規化する。
 * 想定外の値は安全な既定値に置き換える。
 */
export function normalizeSnapshot(raw: unknown): BoardSnapshot {
  const data = (raw ?? {}) as Record<string, unknown>;
  const sportType = SPORT_TYPES.includes(data.sportType as SportType)
    ? (data.sportType as SportType)
    : 'soccer11';
  const fallback = createInitialSnapshot(sportType);

  const layoutId = FIELD_LAYOUT_IDS.includes(data.layoutId as FieldLayoutId)
    ? (data.layoutId as FieldLayoutId)
    : fallback.layoutId;
  const aspect = data.aspect === '9:16' ? '9:16' : '16:9';

  const rawScenes = Array.isArray(data.scenes) ? (data.scenes as unknown[]) : [];
  const scenes: Scene[] = rawScenes
    .filter((scene): scene is Record<string, unknown> => typeof scene === 'object' && !!scene)
    .map((scene) => ({
      id: typeof scene.id === 'string' ? scene.id : generateObjectId(),
      objects: Array.isArray(scene.objects)
        ? (scene.objects as unknown[]).filter(
            (object): object is BoardObject =>
              typeof object === 'object' &&
              !!object &&
              typeof (object as BoardObject).id === 'string' &&
              typeof (object as BoardObject).type === 'string',
          )
        : [],
    }));

  return {
    sportType,
    layoutId,
    aspect,
    fieldColors: { ...fallback.fieldColors, ...(data.fieldColors as Partial<FieldColors>) },
    playerDisplay: {
      ...fallback.playerDisplay,
      ...(data.playerDisplay as Partial<PlayerDisplaySettings>),
    },
    scenes: scenes.length > 0 ? scenes : fallback.scenes,
  };
}
