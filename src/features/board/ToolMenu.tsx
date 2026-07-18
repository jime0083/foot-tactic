import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import type { AlignMode } from './objects/alignment';
import { BOARD_TOOLS, type BoardObjectType } from './objects/objectTypes';
import { idsOfType } from './objects/selection';

const OBJECT_TYPES = BOARD_TOOLS.filter((tool): tool is BoardObjectType => tool !== 'select');

const ALIGN_MODES: AlignMode[] = ['left', 'right', 'top', 'bottom', 'distributeH', 'distributeV'];

/** オブジェクト配置ツールの選択メニュー */
export function ToolMenu() {
  const { t } = useTranslation();
  const tool = useBoardStore((state) => state.tool);
  const setTool = useBoardStore((state) => state.setTool);
  const continuousPlacement = useBoardStore((state) => state.continuousPlacement);
  const toggleContinuousPlacement = useBoardStore((state) => state.toggleContinuousPlacement);
  const selectedIds = useBoardStore((state) => state.selectedIds);
  const removeObjects = useBoardStore((state) => state.removeObjects);
  const reorderSelected = useBoardStore((state) => state.reorderSelected);
  const alignSelected = useBoardStore((state) => state.alignSelected);
  const undo = useBoardStore((state) => state.undo);
  const redo = useBoardStore((state) => state.redo);
  const canUndo = useBoardStore((state) => state.past.length > 0);
  const canRedo = useBoardStore((state) => state.future.length > 0);

  const handleSelectByType = (value: string) => {
    if (value === '') {
      return;
    }
    const { objects, setSelection } = useBoardStore.getState();
    setSelection(idsOfType(objects, value as BoardObjectType));
  };

  return (
    <div className="tool-menu" role="toolbar" aria-label={t('board.tools.title')}>
      {BOARD_TOOLS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setTool(item)}
          aria-pressed={tool === item}
          className={tool === item ? 'tool-menu__item tool-menu__item--active' : 'tool-menu__item'}
        >
          {t(`board.tools.${item}`)}
        </button>
      ))}
      <label className="tool-menu__continuous">
        <input type="checkbox" checked={continuousPlacement} onChange={toggleContinuousPlacement} />
        {t('board.tools.continuous')}
      </label>
      <select
        aria-label={t('board.tools.selectByType')}
        value=""
        onChange={(event) => handleSelectByType(event.target.value)}
      >
        <option value="">{t('board.tools.selectByType')}</option>
        {OBJECT_TYPES.map((type) => (
          <option key={type} value={type}>
            {t(`board.tools.${type}`)}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={selectedIds.length === 0}
        onClick={() => removeObjects(selectedIds)}
      >
        {t('board.tools.delete')}
      </button>
      <button
        type="button"
        disabled={selectedIds.length === 0}
        onClick={() => reorderSelected('front')}
      >
        {t('board.tools.bringToFront')}
      </button>
      <button
        type="button"
        disabled={selectedIds.length === 0}
        onClick={() => reorderSelected('back')}
      >
        {t('board.tools.sendToBack')}
      </button>
      <button type="button" disabled={!canUndo} onClick={undo}>
        {t('board.tools.undo')}
      </button>
      <button type="button" disabled={!canRedo} onClick={redo}>
        {t('board.tools.redo')}
      </button>
      {ALIGN_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          disabled={selectedIds.length < (mode === 'distributeH' || mode === 'distributeV' ? 3 : 2)}
          onClick={() => alignSelected(mode)}
        >
          {t(`board.align.${mode}`)}
        </button>
      ))}
    </div>
  );
}
