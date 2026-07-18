import { useEffect, useRef } from 'react';
import type Konva from 'konva';
import { Arrow, Circle, Group, Line, Rect, RegularPolygon, Text, Transformer } from 'react-konva';
import { useBoardStore } from '@/stores/boardStore';
import { applyNodeTransform } from './objectOps';
import { withOpacity } from './objectStyles';
import { angleToPoint } from './playerActions';
import { toggleSelection } from './selection';
import { PlayerShape } from './PlayerShape';
import type { BoardObject, PlayerObject, PolygonObject, PolylineObject } from './objectTypes';

/** Transformerでリサイズ・回転できるオブジェクト種別 */
const TRANSFORMABLE_TYPES = new Set<BoardObject['type']>([
  'line',
  'circle',
  'rect',
  'polygon',
  'polyline',
  'text',
  'freehand',
]);

/** 各オブジェクトのKonvaノードに共通で渡す操作プロパティ */
interface CommonNodeProps {
  id: string;
  draggable: boolean;
  onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onClick: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  onTap: (event: Konva.KonvaEventObject<TouchEvent>) => void;
}

function useCommonNodeProps(objectId: string): CommonNodeProps {
  const tool = useBoardStore((state) => state.tool);
  const updateObject = useBoardStore((state) => state.updateObject);
  const selectable = tool === 'select';

  const select = (shiftKey: boolean) => {
    const { selectedIds, setSelection } = useBoardStore.getState();
    // Shift+クリックで追加選択/選択解除、通常クリックで単独選択
    setSelection(shiftKey ? toggleSelection(selectedIds, objectId) : [objectId]);
  };

  return {
    id: objectId,
    draggable: selectable,
    onDragEnd: (event) => {
      updateObject(objectId, { x: event.target.x(), y: event.target.y() });
    },
    onClick: (event) => {
      if (selectable) {
        event.cancelBubble = true;
        select(event.evt.shiftKey);
      }
    },
    onTap: (event) => {
      if (selectable) {
        event.cancelBubble = true;
        select(false);
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
        <Group x={object.x} y={object.y} {...common}>
          <Circle
            radius={0.5}
            fill={object.color}
            stroke={selected ? '#00e5ff' : '#000000'}
            strokeWidth={selected ? 0.15 : 0.08}
          />
          <RegularPolygon sides={5} radius={0.22} fill="#000000" listening={false} />
        </Group>
      );
    case 'marker':
      // トレーニング用のフラットマーカー(リング)として描画する
      return (
        <Circle
          x={object.x}
          y={object.y}
          radius={object.size * 0.55}
          stroke={selected ? '#00e5ff' : object.color}
          strokeWidth={object.size * 0.28}
          hitStrokeWidth={object.size}
          {...common}
        />
      );
    case 'line': {
      const LineComponent = object.arrow ? Arrow : Line;
      return (
        <LineComponent
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          points={object.points}
          stroke={selected ? '#00e5ff' : object.stroke}
          fill={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          dash={object.dashed ? [1, 0.6] : undefined}
          lineCap="round"
          pointerLength={object.strokeWidth * 4}
          pointerWidth={object.strokeWidth * 4}
          hitStrokeWidth={1.5}
          {...common}
        />
      );
    }
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
    case 'polyline': {
      const PolylineComponent = object.arrow ? Arrow : Line;
      return (
        <PolylineComponent
          x={object.x}
          y={object.y}
          rotation={object.rotation}
          points={object.points}
          stroke={selected ? '#00e5ff' : object.stroke}
          fill={selected ? '#00e5ff' : object.stroke}
          strokeWidth={object.strokeWidth}
          dash={object.dashed ? [1, 0.6] : undefined}
          lineCap="round"
          lineJoin="round"
          pointerLength={object.strokeWidth * 4}
          pointerWidth={object.strokeWidth * 4}
          hitStrokeWidth={1.5}
          {...common}
        />
      );
    }
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

/** 選択中ポリゴン/ポリラインの頂点編集ハンドル */
function VertexHandles({ object }: { object: PolygonObject | PolylineObject }) {
  const updateObject = useBoardStore((state) => state.updateObject);
  const vertexCount = Math.floor(object.points.length / 2);

  return (
    <>
      {Array.from({ length: vertexCount }, (_, index) => (
        <Circle
          key={index}
          x={object.x + object.points[index * 2]}
          y={object.y + object.points[index * 2 + 1]}
          radius={0.55}
          fill="#ffffff"
          stroke="#00e5ff"
          strokeWidth={0.12}
          draggable
          onDragMove={(event) => {
            const points = [...object.points];
            points[index * 2] = event.target.x() - object.x;
            points[index * 2 + 1] = event.target.y() - object.y;
            updateObject(object.id, { points });
          }}
        />
      ))}
    </>
  );
}

/** 選択中の図形・テキストにリサイズ/回転ハンドルを表示するTransformer */
function SelectionTransformer() {
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedIds = useBoardStore((state) => state.selectedIds);
  const objects = useBoardStore((state) => state.objects);
  const tool = useBoardStore((state) => state.tool);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) {
      return;
    }
    const stage = transformer.getStage();
    if (!stage) {
      return;
    }
    const nodes = selectedIds.flatMap((id) => {
      const object = objects.find((candidate) => candidate.id === id);
      if (!object || !TRANSFORMABLE_TYPES.has(object.type)) {
        return [];
      }
      const node = stage.findOne(`#${id}`);
      return node ? [node] : [];
    });
    transformer.nodes(nodes);
  }, [selectedIds, objects, tool]);

  if (tool !== 'select') {
    return null;
  }

  const handleTransformEnd = (event: Konva.KonvaEventObject<Event>) => {
    const node = event.target;
    const { objects: currentObjects, updateObject } = useBoardStore.getState();
    const object = currentObjects.find((candidate) => candidate.id === node.id());
    if (!object) {
      return;
    }
    const patch = applyNodeTransform(object, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });
    // スケールはオブジェクトのサイズへ焼き込み、ノードは等倍へ戻す
    node.scale({ x: 1, y: 1 });
    node.rotation(patch.rotation ?? 0);
    updateObject(object.id, patch);
  };

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled
      flipEnabled={false}
      onTransformEnd={handleTransformEnd}
    />
  );
}

/** 現在のシーンの全オブジェクトを描画するグループ */
export function BoardObjects() {
  const objects = useBoardStore((state) => state.objects);
  const selectedIds = useBoardStore((state) => state.selectedIds);

  const singleSelected =
    selectedIds.length === 1 ? objects.find((object) => object.id === selectedIds[0]) : undefined;

  const selectedPlayer =
    singleSelected?.type === 'player' && (singleSelected.showArrow || singleSelected.showArm)
      ? singleSelected
      : undefined;

  const selectedVertexShape =
    singleSelected?.type === 'polygon' || singleSelected?.type === 'polyline'
      ? singleSelected
      : undefined;

  return (
    <Group>
      {objects.map((object) => (
        <ObjectShape key={object.id} object={object} selected={selectedIds.includes(object.id)} />
      ))}
      {selectedPlayer && <RotationHandle player={selectedPlayer} />}
      {selectedVertexShape && <VertexHandles object={selectedVertexShape} />}
      <SelectionTransformer />
    </Group>
  );
}
