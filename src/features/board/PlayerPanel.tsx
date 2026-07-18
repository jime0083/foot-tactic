import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import { facePlayersTowardBall, angleToPoint } from './objects/playerActions';
import type { DominantFoot, NamePosition, PlayerObject, TeamSide } from './objects/objectTypes';

/**
 * 選択オブジェクトに応じたコンテキストパネル。
 * - プレイヤー選択時: 外観・向きの編集
 * - ボール選択時: 全選手をボール方向へ向けるボタン
 */
export function PlayerPanel() {
  const { t } = useTranslation();
  const objects = useBoardStore((state) => state.objects);
  const selectedIds = useBoardStore((state) => state.selectedIds);
  const updateObject = useBoardStore((state) => state.updateObject);
  const setObjects = useBoardStore((state) => state.setObjects);
  const playerDisplay = useBoardStore((state) => state.playerDisplay);
  const setPlayerDisplay = useBoardStore((state) => state.setPlayerDisplay);

  const selected = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : null;

  if (!selected) {
    return null;
  }

  if (selected.type === 'ball') {
    return (
      <div className="object-panel">
        <label>
          {t('board.player.color')}
          <input
            type="color"
            value={selected.color}
            onChange={(event) => updateObject(selected.id, { color: event.target.value })}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const updated = facePlayersTowardBall(objects);
            setObjects(updated);
          }}
        >
          {t('board.player.faceBallAll')}
        </button>
      </div>
    );
  }

  if (selected.type === 'marker') {
    return (
      <div className="object-panel">
        <label>
          {t('board.player.color')}
          <input
            type="color"
            value={selected.color}
            onChange={(event) => updateObject(selected.id, { color: event.target.value })}
          />
        </label>
        <label>
          {t('board.marker.size')}
          <input
            type="range"
            min={5}
            max={25}
            value={Math.round(selected.size * 10)}
            onChange={(event) =>
              updateObject(selected.id, { size: Number(event.target.value) / 10 })
            }
          />
        </label>
      </div>
    );
  }

  if (selected.type === 'text') {
    return (
      <div className="object-panel">
        <label>
          {t('board.text.content')}
          <input
            type="text"
            maxLength={100}
            value={selected.text}
            onChange={(event) => updateObject(selected.id, { text: event.target.value })}
          />
        </label>
        <label>
          {t('board.player.color')}
          <input
            type="color"
            value={selected.color}
            onChange={(event) => updateObject(selected.id, { color: event.target.value })}
          />
        </label>
        <label>
          {t('board.text.fontSize')}
          <input
            type="range"
            min={10}
            max={60}
            value={Math.round(selected.fontSize * 10)}
            onChange={(event) =>
              updateObject(selected.id, { fontSize: Number(event.target.value) / 10 })
            }
          />
        </label>
      </div>
    );
  }

  if (selected.type !== 'player') {
    return null;
  }
  const player: PlayerObject = selected;
  const ball = objects.find((object) => object.type === 'ball');

  return (
    <div className="object-panel">
      <label>
        {t('board.player.team')}
        <select
          value={player.team}
          onChange={(event) => updateObject(player.id, { team: event.target.value as TeamSide })}
        >
          <option value="home">{t('board.player.home')}</option>
          <option value="away">{t('board.player.away')}</option>
        </select>
      </label>
      <label>
        {t('board.player.color')}
        <input
          type="color"
          value={player.color}
          onChange={(event) => updateObject(player.id, { color: event.target.value })}
        />
      </label>
      <label>
        {t('board.player.number')}
        <input
          type="text"
          maxLength={3}
          value={player.number}
          onChange={(event) => updateObject(player.id, { number: event.target.value })}
        />
      </label>
      <label>
        {t('board.player.numberColor')}
        <input
          type="color"
          value={player.numberColor}
          onChange={(event) => updateObject(player.id, { numberColor: event.target.value })}
        />
      </label>
      <label>
        {t('board.player.name')}
        <input
          type="text"
          maxLength={30}
          value={player.name}
          onChange={(event) => updateObject(player.id, { name: event.target.value })}
        />
      </label>
      <label>
        {t('board.player.nameColor')}
        <input
          type="color"
          value={player.nameColor}
          onChange={(event) => updateObject(player.id, { nameColor: event.target.value })}
        />
      </label>
      <label>
        {t('board.player.namePosition')}
        <select
          value={player.namePosition}
          onChange={(event) =>
            updateObject(player.id, { namePosition: event.target.value as NamePosition })
          }
        >
          <option value="above">{t('board.player.above')}</option>
          <option value="below">{t('board.player.below')}</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={player.showArrow}
          onChange={(event) => updateObject(player.id, { showArrow: event.target.checked })}
        />
        {t('board.player.arrow')}
      </label>
      <label>
        <input
          type="checkbox"
          checked={player.showArm}
          onChange={(event) => updateObject(player.id, { showArm: event.target.checked })}
        />
        {t('board.player.arm')}
      </label>
      <label>
        {t('board.player.dominantFoot')}
        <select
          value={player.dominantFoot}
          onChange={(event) =>
            updateObject(player.id, { dominantFoot: event.target.value as DominantFoot })
          }
        >
          <option value="none">{t('board.player.footNone')}</option>
          <option value="left">{t('board.player.footLeft')}</option>
          <option value="right">{t('board.player.footRight')}</option>
        </select>
      </label>
      {ball && (
        <button
          type="button"
          onClick={() =>
            updateObject(player.id, {
              rotation: angleToPoint(player.x, player.y, ball.x, ball.y),
            })
          }
        >
          {t('board.player.faceBall')}
        </button>
      )}
      <label>
        {t('board.player.bodySize')}
        <input
          type="range"
          min={6}
          max={25}
          value={Math.round(playerDisplay.bodyRadius * 10)}
          onChange={(event) => setPlayerDisplay({ bodyRadius: Number(event.target.value) / 10 })}
        />
      </label>
      <label>
        {t('board.player.nameSize')}
        <input
          type="range"
          min={8}
          max={40}
          value={Math.round(playerDisplay.nameFontSize * 10)}
          onChange={(event) => setPlayerDisplay({ nameFontSize: Number(event.target.value) / 10 })}
        />
      </label>
    </div>
  );
}
