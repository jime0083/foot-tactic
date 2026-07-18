import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import { FIELD_SPECS } from '../field/fieldSpec';
import type { TeamSide } from '../objects/objectTypes';
import { buildFormationPlayers, replaceTeamPlayers } from './formationPlacement';
import { FORMATIONS } from './formations';

/** フォーメーション一括配置パネル */
export function FormationPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<TeamSide>('home');
  const [centered, setCentered] = useState(false);
  const sportType = useBoardStore((state) => state.sportType);
  const formations = FORMATIONS[sportType];
  const [formationId, setFormationId] = useState(formations[0].id);

  // 競技種別が変わった場合は先頭のフォーメーションへ戻す(レンダー中の状態調整)
  const [previousSport, setPreviousSport] = useState(sportType);
  if (previousSport !== sportType) {
    setPreviousSport(sportType);
    setFormationId(FORMATIONS[sportType][0].id);
  }

  const handleApply = () => {
    const store = useBoardStore.getState();
    const spec = FIELD_SPECS[store.sportType];
    const formation = FORMATIONS[store.sportType].find((item) => item.id === formationId);
    if (!formation) {
      return;
    }
    const players = buildFormationPlayers(spec, formation, team, { centered });
    store.setObjects(replaceTeamPlayers(store.objects, team, players));
  };

  return (
    <div className="formation-panel">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {t('board.formation.title')}
      </button>
      {open && (
        <div className="formation-panel__body">
          <label>
            {t('board.player.team')}
            <select value={team} onChange={(event) => setTeam(event.target.value as TeamSide)}>
              <option value="home">{t('board.player.home')}</option>
              <option value="away">{t('board.player.away')}</option>
            </select>
          </label>
          <label>
            {t('board.formation.system')}
            <select value={formationId} onChange={(event) => setFormationId(event.target.value)}>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={centered}
              onChange={(event) => setCentered(event.target.checked)}
            />
            {t('board.formation.centered')}
          </label>
          <button type="button" onClick={handleApply}>
            {t('board.formation.apply')}
          </button>
        </div>
      )}
    </div>
  );
}
