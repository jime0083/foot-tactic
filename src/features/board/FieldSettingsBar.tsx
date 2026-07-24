import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import { FieldColorPanel } from './FieldColorPanel';
import { FIELD_LAYOUT_IDS, type FieldLayoutId } from './field/fieldLayouts';

/**
 * フィールド設定バー(表示レイアウトの切替・色設定・表示リセット)。
 * 競技種別は11人制固定、ピッチ比率は16:9固定のため、それらの切替UIは持たない。
 */
export function FieldSettingsBar() {
  const { t } = useTranslation();
  const layoutId = useBoardStore((state) => state.layoutId);
  const setLayoutId = useBoardStore((state) => state.setLayoutId);
  const resetView = useBoardStore((state) => state.resetView);
  const zoomed = useBoardStore((state) => state.zoom > 1);

  return (
    <div className="board-toolbar">
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
      <FieldColorPanel />
      <button type="button" onClick={resetView} disabled={!zoomed}>
        {t('board.resetView')}
      </button>
    </div>
  );
}
