import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Layer, Stage } from 'react-konva';
import { useElementSize } from '@/lib/useElementSize';
import { useBoardStore } from '@/stores/boardStore';
import { fitAspectBox } from './aspect';
import { composeStageTransform, wheelZoomFactor, zoomAtPoint, type Point } from './boardView';
import { FieldLines } from './field/FieldLines';
import { computeViewTransform, FIELD_LAYOUTS } from './field/fieldLayouts';
import { FIELD_SPECS } from './field/fieldSpec';

/** フィールド周囲の余白(メートル)。フィールド外への選手・ゴール配置に使う */
const FIELD_PADDING_METERS = 4;

/** 戦術ボードの描画キャンバス。ズーム・パン・アスペクト比・レイアウトに対応する */
export function BoardCanvas() {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const activePointers = useRef(new Map<number, Point>());
  const pinchState = useRef<{ startDistance: number; startZoom: number } | null>(null);

  const sportType = useBoardStore((state) => state.sportType);
  const layoutId = useBoardStore((state) => state.layoutId);
  const aspect = useBoardStore((state) => state.aspect);
  const fieldColors = useBoardStore((state) => state.fieldColors);
  const zoom = useBoardStore((state) => state.zoom);
  const pan = useBoardStore((state) => state.pan);

  const spec = FIELD_SPECS[sportType];
  const layout = FIELD_LAYOUTS[layoutId];
  const box = fitAspectBox(size.width, size.height, aspect);
  const center: Point = { x: box.width / 2, y: box.height / 2 };
  const baseTransform = computeViewTransform(
    box.width,
    box.height,
    layout.region(spec),
    layout.rotated,
    FIELD_PADDING_METERS,
  );
  const stageTransform = composeStageTransform(baseTransform, zoom, pan, center);

  // ホイールズーム(preventDefaultのためpassive:falseで登録する)
  useEffect(() => {
    const element = stageWrapRef.current;
    if (!element) {
      return;
    }
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const point: Point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const wrapCenter: Point = { x: rect.width / 2, y: rect.height / 2 };
      const { zoom: currentZoom, pan: currentPan, setView } = useBoardStore.getState();
      const next = zoomAtPoint(
        currentZoom,
        currentPan,
        currentZoom * wheelZoomFactor(event.deltaY),
        point,
        wrapCenter,
      );
      setView(next.zoom, next.pan);
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [box.width, box.height]);

  const toLocalPoint = (event: ReactPointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointers.current.set(event.pointerId, toLocalPoint(event));
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointers = activePointers.current;
    if (!pointers.has(event.pointerId)) {
      return;
    }
    const previous = pointers.get(event.pointerId)!;
    const point = toLocalPoint(event);
    pointers.set(event.pointerId, point);

    const { zoom: currentZoom, pan: currentPan, setView } = useBoardStore.getState();

    if (pointers.size === 2) {
      // ピンチズーム
      const [first, second] = [...pointers.values()];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (!pinchState.current) {
        pinchState.current = { startDistance: distance, startZoom: currentZoom };
        return;
      }
      const midpoint: Point = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const wrapCenter: Point = { x: box.width / 2, y: box.height / 2 };
      const next = zoomAtPoint(
        currentZoom,
        currentPan,
        pinchState.current.startZoom * (distance / pinchState.current.startDistance),
        midpoint,
        wrapCenter,
      );
      setView(next.zoom, next.pan);
      return;
    }

    // 単一ポインタのドラッグはズーム中のみパンとして扱う
    if (currentZoom > 1) {
      setView(currentZoom, {
        x: currentPan.x + (point.x - previous.x),
        y: currentPan.y + (point.y - previous.y),
      });
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(event.pointerId);
    if (activePointers.current.size < 2) {
      pinchState.current = null;
    }
  };

  return (
    <div ref={ref} className="board-canvas" data-testid="board-canvas">
      {box.width > 0 && box.height > 0 && (
        <div
          ref={stageWrapRef}
          className="board-canvas__stage"
          style={{ width: box.width, height: box.height }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <Stage
            width={box.width}
            height={box.height}
            scaleX={stageTransform.scale}
            scaleY={stageTransform.scale}
            x={stageTransform.x}
            y={stageTransform.y}
            rotation={stageTransform.rotation}
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
