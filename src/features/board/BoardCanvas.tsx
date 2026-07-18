import { Layer, Stage } from 'react-konva';
import { useElementSize } from '@/lib/useElementSize';
import { useBoardStore } from '@/stores/boardStore';
import { fitAspectBox } from './aspect';
import { FieldLines } from './field/FieldLines';
import { computeViewTransform, FIELD_LAYOUTS } from './field/fieldLayouts';
import { FIELD_SPECS } from './field/fieldSpec';

/** フィールド周囲の余白(メートル)。フィールド外への選手・ゴール配置に使う */
const FIELD_PADDING_METERS = 4;

/** 戦術ボードの描画キャンバス。アスペクト比とレイアウトに応じてフィールドを描画する */
export function BoardCanvas() {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const sportType = useBoardStore((state) => state.sportType);
  const layoutId = useBoardStore((state) => state.layoutId);
  const aspect = useBoardStore((state) => state.aspect);
  const fieldColors = useBoardStore((state) => state.fieldColors);

  const spec = FIELD_SPECS[sportType];
  const layout = FIELD_LAYOUTS[layoutId];
  const box = fitAspectBox(size.width, size.height, aspect);
  const transform = computeViewTransform(
    box.width,
    box.height,
    layout.region(spec),
    layout.rotated,
    FIELD_PADDING_METERS,
  );

  return (
    <div ref={ref} className="board-canvas" data-testid="board-canvas">
      {box.width > 0 && box.height > 0 && (
        <div className="board-canvas__stage" style={{ width: box.width, height: box.height }}>
          <Stage
            width={box.width}
            height={box.height}
            scaleX={transform.scale}
            scaleY={transform.scale}
            x={transform.x}
            y={transform.y}
            rotation={transform.rotation}
          >
            <Layer>
              <FieldLines spec={spec} colors={fieldColors} />
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  );
}
