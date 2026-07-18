import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import { BOARD_TOOLS } from './objects/objectTypes';

/** オブジェクト配置ツールの選択メニュー */
export function ToolMenu() {
  const { t } = useTranslation();
  const tool = useBoardStore((state) => state.tool);
  const setTool = useBoardStore((state) => state.setTool);
  const continuousPlacement = useBoardStore((state) => state.continuousPlacement);
  const toggleContinuousPlacement = useBoardStore((state) => state.toggleContinuousPlacement);

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
    </div>
  );
}
