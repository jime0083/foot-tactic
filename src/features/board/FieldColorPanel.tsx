import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';

/** フィールドの色設定パネル(背景・ライン・レーン・ゾーン) */
export function FieldColorPanel() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const fieldColors = useBoardStore((state) => state.fieldColors);
  const setFieldColors = useBoardStore((state) => state.setFieldColors);

  return (
    <div className="field-color-panel">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {t('board.colors.title')}
      </button>
      {open && (
        <div className="field-color-panel__body">
          <label>
            {t('board.colors.background')}
            <input
              type="color"
              value={fieldColors.background}
              onChange={(event) => setFieldColors({ background: event.target.value })}
            />
          </label>
          <label>
            {t('board.colors.line')}
            <input
              type="color"
              value={fieldColors.line}
              onChange={(event) => setFieldColors({ line: event.target.value })}
            />
          </label>
          <label>
            {t('board.colors.lane')}
            <input
              type="color"
              value={fieldColors.lane}
              onChange={(event) => setFieldColors({ lane: event.target.value })}
            />
          </label>
          <label>
            {t('board.colors.laneOpacity')}
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(fieldColors.laneOpacity * 100)}
              onChange={(event) =>
                setFieldColors({ laneOpacity: Number(event.target.value) / 100 })
              }
            />
          </label>
          <label>
            {t('board.colors.zone')}
            <input
              type="color"
              value={fieldColors.zone}
              onChange={(event) => setFieldColors({ zone: event.target.value })}
            />
          </label>
          <label>
            {t('board.colors.zoneOpacity')}
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(fieldColors.zoneOpacity * 100)}
              onChange={(event) =>
                setFieldColors({ zoneOpacity: Number(event.target.value) / 100 })
              }
            />
          </label>
        </div>
      )}
    </div>
  );
}
