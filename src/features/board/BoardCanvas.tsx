import { Layer, Stage } from 'react-konva';
import { useElementSize } from '@/lib/useElementSize';
import { computeFieldTransform } from './field/fieldGeometry';
import { FieldLines } from './field/FieldLines';
import { FIELD_SPECS, type SportType } from './field/fieldSpec';

/** フィールド周囲の余白(メートル)。フィールド外への選手・ゴール配置に使う */
const FIELD_PADDING_METERS = 4;

interface BoardCanvasProps {
  sportType?: SportType;
}

/** 戦術ボードの描画キャンバス。コンテナサイズに合わせてフィールドを描画する */
export function BoardCanvas({ sportType = 'soccer11' }: BoardCanvasProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const spec = FIELD_SPECS[sportType];
  const transform = computeFieldTransform(
    size.width,
    size.height,
    spec.length,
    spec.width,
    FIELD_PADDING_METERS,
  );

  return (
    <div ref={ref} className="board-canvas" data-testid="board-canvas">
      {size.width > 0 && size.height > 0 && (
        <Stage
          width={size.width}
          height={size.height}
          scaleX={transform.scale}
          scaleY={transform.scale}
          x={transform.offsetX}
          y={transform.offsetY}
        >
          <Layer>
            <FieldLines spec={spec} />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
