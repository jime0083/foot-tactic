import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import { buildFormationCsv } from './buildFormationCsv';
import { applyCsvFormation } from './csvFormation';
import { FORMATIONS } from './formations';
import { hasAnyTeam, parseFormationCsv } from './parseFormationCsv';
import { parseRoster } from './parseRoster';

/** CSV一括フォーメーション入力 + CSV作成ツール(左パネルの「CSV」タブ) */
export function CsvPanel() {
  const { t } = useTranslation();
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [toolHomeRoster, setToolHomeRoster] = useState('');
  const [toolAwayRoster, setToolAwayRoster] = useState('');
  const sportType = useBoardStore((state) => state.sportType);
  const formations = FORMATIONS[sportType];
  const [toolHomeSystem, setToolHomeSystem] = useState(formations[0].id);
  const [toolAwaySystem, setToolAwaySystem] = useState(formations[0].id);

  // 競技種別が変わった場合は先頭のシステムへ戻す(レンダー中の状態調整)
  const [previousSport, setPreviousSport] = useState(sportType);
  if (previousSport !== sportType) {
    setPreviousSport(sportType);
    setToolHomeSystem(FORMATIONS[sportType][0].id);
    setToolAwaySystem(FORMATIONS[sportType][0].id);
  }

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

  const handleGenerateCsv = () => {
    const homePlayers = parseRoster(toolHomeRoster);
    const awayPlayers = parseRoster(toolAwayRoster);
    const csv = buildFormationCsv(
      homePlayers.length > 0 ? { systemId: toolHomeSystem, players: homePlayers } : null,
      awayPlayers.length > 0 ? { systemId: toolAwaySystem, players: awayPlayers } : null,
    );
    setCsvText(csv);
    setCsvError(null);
  };

  const handleCopyCsv = async () => {
    if (csvText.trim() === '') {
      return;
    }
    try {
      await navigator.clipboard.writeText(csvText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('CSVのコピーに失敗しました', error);
    }
  };

  return (
    <div className="csv-panel">
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
      <div className="formation-panel__csv-actions">
        <button type="button" className="btn-primary" onClick={handleApplyCsv}>
          {t('board.formation.applyCsv')}
        </button>
        <button type="button" onClick={() => void handleCopyCsv()} disabled={csvText.trim() === ''}>
          {copied ? t('board.formation.csvCopied') : t('board.formation.csvCopy')}
        </button>
      </div>

      {/* CSV作成ツール(フォーム入力→CSV生成) */}
      <div className="formation-panel__tool">
        <button type="button" onClick={() => setToolOpen((v) => !v)} aria-expanded={toolOpen}>
          {t('board.formation.csvTool')}
        </button>
        {toolOpen && (
          <div className="formation-panel__tool-body">
            <p className="formation-panel__csv-help">{t('board.formation.csvToolHelp')}</p>
            <label>
              {t('board.player.home')} · {t('board.formation.system')}
              <select
                value={toolHomeSystem}
                onChange={(event) => setToolHomeSystem(event.target.value)}
              >
                {formations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="formation-panel__roster">
              {t('board.formation.toolHomeRoster')}
              <textarea
                rows={4}
                value={toolHomeRoster}
                placeholder={t('board.formation.rosterPlaceholder')}
                onChange={(event) => setToolHomeRoster(event.target.value)}
              />
            </label>
            <label>
              {t('board.player.away')} · {t('board.formation.system')}
              <select
                value={toolAwaySystem}
                onChange={(event) => setToolAwaySystem(event.target.value)}
              >
                {formations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="formation-panel__roster">
              {t('board.formation.toolAwayRoster')}
              <textarea
                rows={4}
                value={toolAwayRoster}
                placeholder={t('board.formation.rosterPlaceholder')}
                onChange={(event) => setToolAwayRoster(event.target.value)}
              />
            </label>
            <button type="button" onClick={handleGenerateCsv}>
              {t('board.formation.generateCsv')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
