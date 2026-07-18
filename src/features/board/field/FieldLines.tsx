import { useMemo } from 'react';
import { Arc, Circle, Group, Line, Rect } from 'react-konva';
import { buildFieldShapes, buildLaneRects, buildZoneRects } from './fieldGeometry';
import { DEFAULT_FIELD_COLORS, type FieldColors } from './fieldColors';
import type { FieldSpec } from './fieldSpec';

interface FieldLinesProps {
  spec: FieldSpec;
  colors?: FieldColors;
}

/** フィールドのライン一式を描画する(座標はメートル単位、親のGroup/Stageでスケールする) */
export function FieldLines({ spec, colors = DEFAULT_FIELD_COLORS }: FieldLinesProps) {
  const shapes = useMemo(() => buildFieldShapes(spec), [spec]);
  const laneRects = useMemo(() => buildLaneRects(spec), [spec]);
  const zoneRects = useMemo(() => buildZoneRects(spec), [spec]);
  const stroke = colors.line;
  const strokeWidth = spec.lineWidth;

  return (
    <Group listening={false}>
      <Rect
        x={shapes.border.x}
        y={shapes.border.y}
        width={shapes.border.width}
        height={shapes.border.height}
        fill={colors.background}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {colors.laneOpacity > 0 &&
        laneRects.map(
          (rect, index) =>
            index % 2 === 1 && (
              <Rect
                key={`lane-${index}`}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill={colors.lane}
                opacity={colors.laneOpacity}
              />
            ),
        )}
      {colors.zoneOpacity > 0 &&
        zoneRects.map(
          (rect, index) =>
            index % 2 === 1 && (
              <Rect
                key={`zone-${index}`}
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill={colors.zone}
                opacity={colors.zoneOpacity}
              />
            ),
        )}
      <Line points={shapes.halfwayLine.points} stroke={stroke} strokeWidth={strokeWidth} />
      <Circle
        x={shapes.centerCircle.x}
        y={shapes.centerCircle.y}
        radius={shapes.centerCircle.radius}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <Circle
        x={shapes.centerSpot.x}
        y={shapes.centerSpot.y}
        radius={shapes.centerSpot.radius}
        fill={stroke}
      />
      {shapes.penaltyAreas.map((rect, index) => (
        <Rect
          key={`penalty-area-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
      {shapes.penaltyAreaArcs.map((arc, index) => (
        <Arc
          key={`penalty-area-arc-${index}`}
          x={arc.x}
          y={arc.y}
          innerRadius={arc.radius}
          outerRadius={arc.radius}
          rotation={arc.rotation}
          angle={arc.angle}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
      {shapes.penaltyAreaLines.map((line, index) => (
        <Line
          key={`penalty-area-line-${index}`}
          points={line.points}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
      {shapes.goalAreas.map((rect, index) => (
        <Rect
          key={`goal-area-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
      {shapes.penaltySpots.map((spot, index) => (
        <Circle
          key={`penalty-spot-${index}`}
          x={spot.x}
          y={spot.y}
          radius={spot.radius}
          fill={stroke}
        />
      ))}
      {shapes.penaltyArcs.map((arc, index) => (
        <Arc
          key={`penalty-arc-${index}`}
          x={arc.x}
          y={arc.y}
          innerRadius={arc.radius}
          outerRadius={arc.radius}
          rotation={arc.rotation}
          angle={arc.angle}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
      {shapes.cornerArcs.map((arc, index) => (
        <Arc
          key={`corner-arc-${index}`}
          x={arc.x}
          y={arc.y}
          innerRadius={arc.radius}
          outerRadius={arc.radius}
          rotation={arc.rotation}
          angle={arc.angle}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
      {shapes.goals.map((rect, index) => (
        <Rect
          key={`goal-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
    </Group>
  );
}
