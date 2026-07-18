import { FIELD_SPECS, type SportType } from '../field/fieldSpec';
import type { BoardObject } from '../objects/objectTypes';

interface SceneThumbnailProps {
  objects: readonly BoardObject[];
  sportType: SportType;
}

/** シーンの簡易サムネイル(SVGミニマップ)。フィールドとオブジェクト位置を表示する */
export function SceneThumbnail({ objects, sportType }: SceneThumbnailProps) {
  const spec = FIELD_SPECS[sportType];
  return (
    <svg
      className="scene-thumbnail"
      viewBox={`-2 -2 ${spec.length + 4} ${spec.width + 4}`}
      role="img"
      aria-hidden="true"
    >
      <rect x={0} y={0} width={spec.length} height={spec.width} fill="#2e7d32" />
      <line
        x1={spec.length / 2}
        y1={0}
        x2={spec.length / 2}
        y2={spec.width}
        stroke="#ffffff"
        strokeWidth={0.5}
      />
      {objects.map((object) => {
        if (object.type === 'player') {
          return <circle key={object.id} cx={object.x} cy={object.y} r={2.2} fill={object.color} />;
        }
        if (object.type === 'ball') {
          return (
            <circle
              key={object.id}
              cx={object.x}
              cy={object.y}
              r={1.5}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={0.3}
            />
          );
        }
        return <circle key={object.id} cx={object.x} cy={object.y} r={1.2} fill="#ffeb3b" />;
      })}
    </svg>
  );
}
