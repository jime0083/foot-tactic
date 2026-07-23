import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import { FIELD_SPECS } from '../field/fieldSpec';
import type { TeamSide } from '../objects/objectTypes';
import { applyCsvFormation } from './csvFormation';
import {
  buildFormationPlayers,
  buildSubstitutePlayers,
  replaceTeamPlayers,
  replaceTeamSubstitutes,
} from './formationPlacement';
import { FORMATIONS } from './formations';
import { hasAnyTeam, parseFormationCsv } from './parseFormationCsv';
import { parseRoster } from './parseRoster';

type FormationTab = 'lineup' | 'substitute' | 'csv';

/** フォーメーション一括配置パネル(先発/控え/CSV一括) */
export function FormationPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<TeamSide>('home');
  const [centered, setCentered] = useState(false);
  const [rosterText, setRosterText] = useState('');
  const [substituteText, setSubstituteText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FormationTab>('lineup');
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
    const players = buildFormationPlayers(spec, formation, team, {
      centered,
      roster: parseRoster(rosterText),
    });
    store.setObjects(replaceTeamPlayers(store.objects, team, players));
  };

  const handleApplySubstitutes = () => {
    const store = useBoardStore.getState();
    const spec = FIELD_SPECS[store.sportType];
    const players = buildSubstitutePlayers(spec, team, parseRoster(substituteText));
    store.setObjects(replaceTeamSubstitutes(store.objects, spec, team, players));
  };

  const handleApplyCsv = () => {
    const store = useBoardStore.getState();
    const data = parseFormationCsv(csvText);
    if (!hasAnyTeam(data)) {
      setCsvError(t('board.formation.csvNoTeam'));
      return;
    }
    setCsvError(null);
    store.setObjects(applyCsvFormation(store.objects, store.sportType, data));
  };

  return (
    <div className="formation-panel">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {t('board.formation.title')}
      </button>
      {open && (
        <div className="formation-panel__body">
          <div role="tablist" className="formation-panel__tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'lineup'}
              onClick={() => setActiveTab('lineup')}
            >
              {t('board.formation.lineupTab')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'substitute'}
              onClick={() => setActiveTab('substitute')}
            >
              {t('board.formation.substituteTab')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'csv'}
              onClick={() => setActiveTab('csv')}
            >
              {t('board.formation.csvTab')}
            </button>
          </div>

          {activeTab !== 'csv' && (
            <label>
              {t('board.player.team')}
              <select value={team} onChange={(event) => setTeam(event.target.value as TeamSide)}>
                <option value="home">{t('board.player.home')}</option>
                <option value="away">{t('board.player.away')}</option>
              </select>
            </label>
          )}

          {activeTab === 'lineup' && (
            <>
              <label>
                {t('board.formation.system')}
                <select
                  value={formationId}
                  onChange={(event) => setFormationId(event.target.value)}
                >
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
              <label className="formation-panel__roster">
                {t('board.formation.roster')}
                <textarea
                  rows={4}
                  value={rosterText}
                  placeholder={t('board.formation.rosterPlaceholder')}
                  onChange={(event) => setRosterText(event.target.value)}
                />
              </label>
              <button type="button" onClick={handleApply}>
                {t('board.formation.apply')}
              </button>
            </>
          )}

          {activeTab === 'substitute' && (
            <>
              <label className="formation-panel__roster">
                {t('board.formation.substituteRoster')}
                <textarea
                  rows={4}
                  value={substituteText}
                  placeholder={t('board.formation.rosterPlaceholder')}
                  onChange={(event) => setSubstituteText(event.target.value)}
                />
              </label>
              <button type="button" onClick={handleApplySubstitutes}>
                {t('board.formation.applySubstitutes')}
              </button>
            </>
          )}

          {activeTab === 'csv' && (
            <>
              <p className="formation-panel__csv-help">{t('board.formation.csvHelp')}</p>
              <label className="formation-panel__roster">
                {t('board.formation.csvLabel')}
                <textarea
                  rows={8}
                  value={csvText}
                  placeholder={t('board.formation.csvPlaceholder')}
                  onChange={(event) => setCsvText(event.target.value)}
                />
              </label>
              {csvError && <p role="alert">{csvError}</p>}
              <button type="button" onClick={handleApplyCsv}>
                {t('board.formation.applyCsv')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
