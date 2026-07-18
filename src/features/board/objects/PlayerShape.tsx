import { Arrow, Circle, Group, Line, Text } from 'react-konva';
import type { PlayerDisplaySettings } from '@/stores/boardStore';
import type { PlayerObject } from './objectTypes';

interface PlayerShapeProps {
  player: PlayerObject;
  display: PlayerDisplaySettings;
  selected: boolean;
}

/** プレイヤーオブジェクトの描画(体・背番号・選手名・向き矢印・アーム・利き足) */
export function PlayerShape({ player, display, selected }: PlayerShapeProps) {
  const radius = display.bodyRadius;
  const nameOffsetY =
    player.namePosition === 'above'
      ? -(radius + display.nameFontSize * 0.9)
      : radius + display.nameFontSize * 0.35;

  return (
    <Group x={player.x} y={player.y}>
      {/* 向きに追従する部分 */}
      <Group rotation={player.rotation}>
        {player.showArm && (
          <>
            <Line
              points={[
                Math.cos(1.2) * radius,
                Math.sin(1.2) * radius,
                Math.cos(1.2) * (radius + 0.9),
                Math.sin(1.2) * (radius + 0.9),
              ]}
              stroke={player.color}
              strokeWidth={0.35}
              lineCap="round"
            />
            <Line
              points={[
                Math.cos(-1.2) * radius,
                Math.sin(-1.2) * radius,
                Math.cos(-1.2) * (radius + 0.9),
                Math.sin(-1.2) * (radius + 0.9),
              ]}
              stroke={player.color}
              strokeWidth={0.35}
              lineCap="round"
            />
          </>
        )}
        {player.showArrow && (
          <Arrow
            points={[radius * 0.4, 0, radius + 1.0, 0]}
            stroke={player.color}
            fill={player.color}
            strokeWidth={0.3}
            pointerLength={0.7}
            pointerWidth={0.7}
          />
        )}
        {player.dominantFoot !== 'none' && (
          <Circle
            x={Math.cos(player.dominantFoot === 'right' ? 0.6 : -0.6) * (radius + 0.35)}
            y={Math.sin(player.dominantFoot === 'right' ? 0.6 : -0.6) * (radius + 0.35)}
            radius={0.28}
            fill="#ffd600"
            stroke="#00000066"
            strokeWidth={0.05}
          />
        )}
        <Circle radius={radius} fill={player.color} />
      </Group>
      {selected && (
        <Circle radius={radius + 0.4} stroke="#00e5ff" strokeWidth={0.15} dash={[0.5, 0.3]} />
      )}
      {player.number !== '' && (
        <Text
          text={player.number}
          fontSize={radius * 1.1}
          fontStyle="bold"
          fill={player.numberColor}
          align="center"
          verticalAlign="middle"
          width={radius * 2}
          height={radius * 2}
          offsetX={radius}
          offsetY={radius}
          listening={false}
        />
      )}
      {player.name !== '' && (
        <Text
          text={player.name}
          fontSize={display.nameFontSize}
          fill={player.nameColor}
          align="center"
          width={20}
          offsetX={10}
          y={nameOffsetY}
          listening={false}
        />
      )}
    </Group>
  );
}
