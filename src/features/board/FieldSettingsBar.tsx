import { useTranslation } from 'react-i18next';
import { useBoardStore, type BoardAspect } from '@/stores/boardStore';
import { FieldColorPanel } from './FieldColorPanel';
import { FIELD_LAYOUT_IDS, type FieldLayoutId } from './field/fieldLayouts';
import type { SportType } from './field/fieldSpec';

const SPORT_TYPES: SportType[] = ['soccer11', 'soccer8', 'futsal'];
const ASPECTS: BoardAspect[] = ['16:9', '9:16'];

/** フィールド設定バー(競技種別・レイアウト・アスペクト比の切替) */
export function FieldSettingsBar() {
  const { t } = useTranslation();
  const sportType = useBoardStore((state) => state.sportType);
  const layoutId = useBoardStore((state) => state.layoutId);
  const aspect = useBoardStore((state) => state.aspect);
  const setSportType = useBoardStore((state) => state.setSportType);
  const setLayoutId = useBoardStore((state) => state.setLayoutId);
  const setAspect = useBoardStore((state) => state.setAspect);

  return (
    <div className="board-toolbar">
      <label>
        {t('board.sportLabel')}
        <select
          value={sportType}
          onChange={(event) => setSportType(event.target.value as SportType)}
        >
          {SPORT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`board.sport.${type}`)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('board.layoutLabel')}
        <select
          value={layoutId}
          onChange={(event) => setLayoutId(event.target.value as FieldLayoutId)}
        >
          {FIELD_LAYOUT_IDS.map((id) => (
            <option key={id} value={id}>
              {t(`board.layout.${id}`)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('board.aspectLabel')}
        <select value={aspect} onChange={(event) => setAspect(event.target.value as BoardAspect)}>
          {ASPECTS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <FieldColorPanel />
    </div>
  );
}
