import { Circle, Group, Line, Rect, Text } from 'react-konva';
import { useBoardStore } from '@/stores/boardStore';
import { PLAYER_BODY_RADIUS, withOpacity } from './objectStyles';
import type { BoardObject } from './objectTypes';

function ObjectShape({ object }: { object: BoardObject }) {
  switch (object.type) {
    case 'player':
      return (
        <Group x={object.x} y={object.y} rotation={object.rotation}>
          <Circle radius={PLAYER_BODY_RADIUS} fill={object.color} />
          {object.number !== '' && (
            <Text
              text={object.number}
              fontSize={PLAYER_BODY_RADIUS * 1.1}
              fill={object.numberColor}
              align="center"
              verticalAlign="middle"
              offsetX={PLAYER_BODY_RADIUS}
              offsetY={PLAYER_BODY_RADIUS * 0.55}
              width={PLAYER_BODY_RADIUS * 2}
            />
          )}
        </Group>
      );
    case 'ball':
      return (
        <Circle
          x={object.x}
          y={object.y}
          radius={0.5}
          fill={object.color}
          stroke="#000000"
          strokeWidth={0.08}
        />
      );
    case 'marker':
      return (
        <Circle
          x={object.x}
          y={object.y}
          radius={object.size * 0.6}
          fill={object.color}
          stroke="#00000055"
          strokeWidth={0.06}
        />
      );
    case 'line':
      return (
        <Line
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          points={object.points}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          dash={object.dashed ? [1, 0.6] : undefined}
          lineCap="round"
        />
      );
    case 'circle':
      return (
        <Circle
          x={object.x}
          y={object.y}
          radius={object.radius}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          fill={withOpacity(object.fill, object.fillOpacity)}
        />
      );
    case 'rect':
      return (
        <Rect
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          width={object.width}
          height={object.height}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          fill={withOpacity(object.fill, object.fillOpacity)}
        />
      );
    case 'polygon':
      return (
        <Line
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          points={object.points}
          closed
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          fill={withOpacity(object.fill, object.fillOpacity)}
        />
      );
    case 'polyline':
      return (
        <Line
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          points={object.points}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          dash={object.dashed ? [1, 0.6] : undefined}
          lineCap="round"
          lineJoin="round"
        />
      );
    case 'text':
      return (
        <Text
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          text={object.text}
          fontSize={object.fontSize}
          fill={object.color}
        />
      );
    case 'freehand':
      return (
        <Line
          x={object.x}
          y={object.y}
          points={object.points}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={0.4}
        />
      );
  }
}

/** 現在のシーンの全オブジェクトを描画するグループ */
export function BoardObjects() {
  const objects = useBoardStore((state) => state.objects);
  return (
    <Group>
      {objects.map((object) => (
        <ObjectShape key={object.id} object={object} />
      ))}
    </Group>
  );
}
