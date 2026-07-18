import type Konva from 'konva';
import { Circle, Group, Line, Rect, Text } from 'react-konva';
import { useBoardStore } from '@/stores/boardStore';
import { withOpacity } from './objectStyles';
import { angleToPoint } from './playerActions';
import { PlayerShape } from './PlayerShape';
import type { BoardObject, PlayerObject } from './objectTypes';

/** 各オブジェクトのKonvaノードに共通で渡す操作プロパティ */
interface CommonNodeProps {
  draggable: boolean;
  onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onClick: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  onTap: (event: Konva.KonvaEventObject<TouchEvent>) => void;
}

function useCommonNodeProps(objectId: string): CommonNodeProps {
  const tool = useBoardStore((state) => state.tool);
  const updateObject = useBoardStore((state) => state.updateObject);
  const setSelection = useBoardStore((state) => state.setSelection);
  const selectable = tool === 'select';
  return {
    draggable: selectable,
    onDragEnd: (event) => {
      updateObject(objectId, { x: event.target.x(), y: event.target.y() });
    },
    onClick: (event) => {
      if (selectable) {
        event.cancelBubble = true;
        setSelection([objectId]);
      }
    },
    onTap: (event) => {
      if (selectable) {
        event.cancelBubble = true;
        setSelection([objectId]);
      }
    },
  };
}

function ObjectShape({ object, selected }: { object: BoardObject; selected: boolean }) {
  const playerDisplay = useBoardStore((state) => state.playerDisplay);
  const common = useCommonNodeProps(object.id);

  switch (object.type) {
    case 'player':
      return (
        <Group x={object.x} y={object.y} {...common}>
          <PlayerShape
            player={{ ...object, x: 0, y: 0 }}
            display={playerDisplay}
            selected={selected}
          />
        </Group>
      );
    case 'ball':
      return (
        <Circle
          x={object.x}
          y={object.y}
          radius={0.5}
          fill={object.color}
          stroke={selected ? '#00e5ff' : '#000000'}
          strokeWidth={selected ? 0.15 : 0.08}
          {...common}
        />
      );
    case 'marker':
      return (
        <Circle
          x={object.x}
          y={object.y}
          radius={object.size * 0.6}
          fill={object.color}
          stroke={selected ? '#00e5ff' : '#00000055'}
          strokeWidth={selected ? 0.15 : 0.06}
          {...common}
        />
      );
    case 'line':
      return (
        <Line
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          points={object.points}
          stroke={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          dash={object.dashed ? [1, 0.6] : undefined}
          lineCap="round"
          hitStrokeWidth={1.5}
          {...common}
        />
      );
    case 'circle':
      return (
        <Circle
          x={object.x}
          y={object.y}
          radius={object.radius}
          stroke={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          fill={withOpacity(object.fill, object.fillOpacity)}
          {...common}
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
          stroke={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          fill={withOpacity(object.fill, object.fillOpacity)}
          {...common}
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
          stroke={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          fill={withOpacity(object.fill, object.fillOpacity)}
          {...common}
        />
      );
    case 'polyline':
      return (
        <Line
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          points={object.points}
          stroke={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          dash={object.dashed ? [1, 0.6] : undefined}
          lineCap="round"
          lineJoin="round"
          hitStrokeWidth={1.5}
          {...common}
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
          fill={selected ? '#00e5ff' : object.color}
          {...common}
        />
      );
    case 'freehand':
      return (
        <Line
          x={object.x}
          y={object.y}
          points={object.points}
          stroke={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={0.4}
          hitStrokeWidth={1.5}
          {...common}
        />
      );
  }
}

/** 選択中プレイヤーの向きを変える回転ハンドル */
function RotationHandle({ player }: { player: PlayerObject }) {
  const bodyRadius = useBoardStore((state) => state.playerDisplay.bodyRadius);
  const updateObject = useBoardStore((state) => state.updateObject);
  const distance = bodyRadius + 2;
  const angleRad = (player.rotation * Math.PI) / 180;

  return (
    <Circle
      x={player.x + Math.cos(angleRad) * distance}
      y={player.y + Math.sin(angleRad) * distance}
      radius={0.55}
      fill="#00e5ff"
      stroke="#ffffff"
      strokeWidth={0.1}
      draggable
      onDragMove={(event) => {
        const rotation = angleToPoint(player.x, player.y, event.target.x(), event.target.y());
        updateObject(player.id, { rotation });
        const rad = (rotation * Math.PI) / 180;
        event.target.position({
          x: player.x + Math.cos(rad) * distance,
          y: player.y + Math.sin(rad) * distance,
        });
      }}
    />
  );
}

/** 現在のシーンの全オブジェクトを描画するグループ */
export function BoardObjects() {
  const objects = useBoardStore((state) => state.objects);
  const selectedIds = useBoardStore((state) => state.selectedIds);

  const selectedPlayer =
    selectedIds.length === 1
      ? objects.find(
          (object): object is PlayerObject =>
            object.id === selectedIds[0] &&
            object.type === 'player' &&
            (object.showArrow || object.showArm),
        )
      : undefined;

  return (
    <Group>
      {objects.map((object) => (
        <ObjectShape key={object.id} object={object} selected={selectedIds.includes(object.id)} />
      ))}
      {selectedPlayer && <RotationHandle player={selectedPlayer} />}
    </Group>
  );
}
