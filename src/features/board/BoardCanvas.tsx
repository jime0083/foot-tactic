import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type Konva from 'konva';
import { Circle, Layer, Line, Rect, Stage } from 'react-konva';
import { useElementSize } from '@/lib/useElementSize';
import { useBoardStore } from '@/stores/boardStore';
import { fitAspectBox } from './aspect';
import {
  composeStageTransform,
  screenToField,
  wheelZoomFactor,
  zoomAtPoint,
  type Point,
} from './boardView';
import { FieldLines } from './field/FieldLines';
import { computeViewTransform, FIELD_LAYOUTS } from './field/fieldLayouts';
import { FIELD_SPECS } from './field/fieldSpec';
import { BoardObjects } from './objects/BoardObjects';
import { createObjectAt } from './objects/createObject';
import { cloneObjects } from './objects/objectOps';
import { isEditableElement, normalizeRect, selectIdsInRect } from './objects/selection';
import {
  appendFreehandPoint,
  buildDragShape,
  buildFreehandShape,
  buildVertexShape,
  type DragShapeType,
  type VertexShapeType,
} from './objects/shapeDrafting';

/** フィールド周囲の余白(メートル)。フィールド外への選手・ゴール配置に使う */
const FIELD_PADDING_METERS = 4;

const DRAG_SHAPE_TYPES: DragShapeType[] = ['line', 'circle', 'rect'];
const VERTEX_SHAPE_TYPES: VertexShapeType[] = ['polygon', 'polyline'];

/** 作成途中の図形(ドラッグ中/頂点追加中/手書き中) */
type Draft =
  | { kind: 'drag'; type: DragShapeType; start: Point; current: Point }
  | { kind: 'vertices'; type: VertexShapeType; vertices: Point[]; current: Point | null }
  | { kind: 'freehand'; trace: Point[] };

/** 作成途中の図形のプレビュー描画 */
function DraftPreview({ draft }: { draft: Draft }) {
  const previewProps = { stroke: '#ffffffaa', strokeWidth: 0.25, dash: [0.8, 0.5] as number[] };
  if (draft.kind === 'drag') {
    const { start, current } = draft;
    if (draft.type === 'circle') {
      return (
        <Circle
          x={start.x}
          y={start.y}
          radius={Math.hypot(current.x - start.x, current.y - start.y)}
          {...previewProps}
        />
      );
    }
    if (draft.type === 'rect') {
      return (
        <Rect
          x={Math.min(start.x, current.x)}
          y={Math.min(start.y, current.y)}
          width={Math.abs(current.x - start.x)}
          height={Math.abs(current.y - start.y)}
          {...previewProps}
        />
      );
    }
    return <Line points={[start.x, start.y, current.x, current.y]} {...previewProps} />;
  }
  if (draft.kind === 'freehand') {
    return (
      <Line
        points={draft.trace.flatMap((point) => [point.x, point.y])}
        stroke="#ffffffaa"
        strokeWidth={0.25}
        lineCap="round"
        lineJoin="round"
      />
    );
  }
  const points = draft.vertices.flatMap((vertex) => [vertex.x, vertex.y]);
  if (draft.current) {
    points.push(draft.current.x, draft.current.y);
  }
  return <Line points={points} {...previewProps} />;
}

/** 戦術ボードの描画キャンバス。配置・ズーム・パン・レイアウトを統合する */
export function BoardCanvas() {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const activePointers = useRef(new Map<number, Point>());
  const pinchState = useRef<{ startDistance: number; startZoom: number } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  /** ドラッグ矩形選択の範囲(フィールド座標) */
  const [selectionRect, setSelectionRect] = useState<{ start: Point; current: Point } | null>(null);

  const sportType = useBoardStore((state) => state.sportType);
  const layoutId = useBoardStore((state) => state.layoutId);
  const aspect = useBoardStore((state) => state.aspect);
  const fieldColors = useBoardStore((state) => state.fieldColors);
  const zoom = useBoardStore((state) => state.zoom);
  const pan = useBoardStore((state) => state.pan);
  const tool = useBoardStore((state) => state.tool);

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

  // ツール切替時は作成途中の図形を破棄する(レンダー中の状態調整パターン)
  const [previousTool, setPreviousTool] = useState(tool);
  if (previousTool !== tool) {
    setPreviousTool(tool);
    setDraft(null);
  }

  // キーボードショートカット(削除/複製/コピー/ペースト)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(document.activeElement)) {
        return;
      }
      const store = useBoardStore.getState();
      const isMod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (store.selectedIds.length > 0) {
          event.preventDefault();
          store.removeObjects(store.selectedIds);
        }
        return;
      }
      if (!isMod) {
        return;
      }
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          store.redo();
        } else {
          store.undo();
        }
        return;
      }
      if (key === 'y') {
        event.preventDefault();
        store.redo();
        return;
      }
      const selectedObjects = store.objects.filter((object) =>
        store.selectedIds.includes(object.id),
      );
      if (key === 'd' && selectedObjects.length > 0) {
        // 複製
        event.preventDefault();
        const clones = cloneObjects(selectedObjects);
        store.setObjects([...store.objects, ...clones]);
        store.setSelection(clones.map((clone) => clone.id));
        return;
      }
      if (key === 'c' && selectedObjects.length > 0) {
        // コピー
        event.preventDefault();
        store.setClipboard(selectedObjects);
        return;
      }
      if (key === 'v' && store.clipboard.length > 0) {
        // ペースト
        event.preventDefault();
        const clones = cloneObjects(store.clipboard);
        store.setObjects([...store.objects, ...clones]);
        store.setSelection(clones.map((clone) => clone.id));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Escapeで作成途中の図形をキャンセルする
  useEffect(() => {
    if (!draft) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDraft(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draft]);

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

  const toFieldPoint = (event: ReactPointerEvent<HTMLDivElement>): Point =>
    screenToField(stageTransform, toLocalPoint(event));

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const currentTool = useBoardStore.getState().tool;
    if (DRAG_SHAPE_TYPES.includes(currentTool as DragShapeType)) {
      const fieldPoint = toFieldPoint(event);
      setDraft({
        kind: 'drag',
        type: currentTool as DragShapeType,
        start: fieldPoint,
        current: fieldPoint,
      });
      return;
    }
    if (currentTool === 'freehand') {
      setDraft({ kind: 'freehand', trace: [toFieldPoint(event)] });
      return;
    }
    activePointers.current.set(event.pointerId, toLocalPoint(event));
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (draft) {
      const fieldPoint = toFieldPoint(event);
      if (draft.kind === 'freehand') {
        setDraft({ kind: 'freehand', trace: appendFreehandPoint(draft.trace, fieldPoint) });
        return;
      }
      setDraft(
        draft.kind === 'drag'
          ? { ...draft, current: fieldPoint }
          : { ...draft, current: fieldPoint },
      );
      if (draft.kind === 'drag') {
        return;
      }
    }

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
    if (draft?.kind === 'drag') {
      const { addObject, setTool, continuousPlacement } = useBoardStore.getState();
      addObject(buildDragShape(draft.type, draft.start, toFieldPoint(event)));
      setDraft(null);
      if (!continuousPlacement) {
        setTool('select');
      }
      return;
    }
    if (draft?.kind === 'freehand') {
      const { addObject, setTool, continuousPlacement } = useBoardStore.getState();
      const object = buildFreehandShape(draft.trace);
      if (object) {
        addObject(object);
      }
      setDraft(null);
      if (object && !continuousPlacement) {
        setTool('select');
      }
      return;
    }
    activePointers.current.delete(event.pointerId);
    if (activePointers.current.size < 2) {
      pinchState.current = null;
    }
  };

  /** クリック: ポイント配置ツールは即配置、頂点ツールは頂点を追加する */
  const handleStageClick = (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const {
      tool: currentTool,
      continuousPlacement,
      addObject,
      setTool,
      clearSelection,
    } = useBoardStore.getState();
    if (currentTool === 'select') {
      // 矩形選択直後のclickイベントでは選択を維持する
      if (justRubberBanded.current) {
        justRubberBanded.current = false;
        return;
      }
      // 何もない場所のクリックで選択解除
      if (event.target === event.target.getStage()) {
        clearSelection();
      }
      return;
    }
    const pointer = event.target.getStage()?.getPointerPosition();
    if (!pointer) {
      return;
    }
    const fieldPoint = screenToField(stageTransform, pointer);

    if (VERTEX_SHAPE_TYPES.includes(currentTool as VertexShapeType)) {
      setDraft((previous) =>
        previous?.kind === 'vertices'
          ? { ...previous, vertices: [...previous.vertices, fieldPoint] }
          : {
              kind: 'vertices',
              type: currentTool as VertexShapeType,
              vertices: [fieldPoint],
              current: null,
            },
      );
      return;
    }
    if (DRAG_SHAPE_TYPES.includes(currentTool as DragShapeType) || currentTool === 'freehand') {
      // ドラッグ配置/手書きはポインタイベント側で処理する
      return;
    }
    addObject(createObjectAt(currentTool, fieldPoint.x, fieldPoint.y));
    if (!continuousPlacement) {
      setTool('select');
    }
  };

  /** 空きエリアからのドラッグで矩形選択を開始する(フィット表示時のみ。ズーム中はパン優先) */
  const justRubberBanded = useRef(false);

  const handleStageMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const { tool: currentTool, zoom: currentZoom } = useBoardStore.getState();
    if (currentTool !== 'select' || currentZoom > 1) {
      return;
    }
    if (event.target !== event.target.getStage()) {
      return;
    }
    const pointer = event.target.getStage()?.getPointerPosition();
    if (!pointer) {
      return;
    }
    const fieldPoint = screenToField(stageTransform, pointer);
    setSelectionRect({ start: fieldPoint, current: fieldPoint });
  };

  const handleStageMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionRect) {
      return;
    }
    const pointer = event.target.getStage()?.getPointerPosition();
    if (!pointer) {
      return;
    }
    setSelectionRect({ ...selectionRect, current: screenToField(stageTransform, pointer) });
  };

  const handleStageMouseUp = () => {
    if (!selectionRect) {
      return;
    }
    const bounds = normalizeRect(selectionRect.start, selectionRect.current);
    // 微小ドラッグは単なるクリック(選択解除)として扱う
    if (bounds.maxX - bounds.minX > 0.5 || bounds.maxY - bounds.minY > 0.5) {
      const { objects, setSelection } = useBoardStore.getState();
      setSelection(selectIdsInRect(objects, bounds));
      justRubberBanded.current = true;
    }
    setSelectionRect(null);
  };

  /** ダブルクリックで頂点ツールの図形を確定する */
  const handleStageDblClick = () => {
    if (draft?.kind !== 'vertices') {
      return;
    }
    const { addObject, setTool, continuousPlacement } = useBoardStore.getState();
    const object = buildVertexShape(draft.type, draft.vertices);
    if (object) {
      addObject(object);
      setDraft(null);
      if (!continuousPlacement) {
        setTool('select');
      }
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
            onClick={handleStageClick}
            onTap={handleStageClick}
            onDblClick={handleStageDblClick}
            onDblTap={handleStageDblClick}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
          >
            <Layer>
              <FieldLines spec={spec} colors={fieldColors} />
              <BoardObjects />
              {draft && <DraftPreview draft={draft} />}
              {selectionRect && (
                <Rect
                  x={Math.min(selectionRect.start.x, selectionRect.current.x)}
                  y={Math.min(selectionRect.start.y, selectionRect.current.y)}
                  width={Math.abs(selectionRect.current.x - selectionRect.start.x)}
                  height={Math.abs(selectionRect.current.y - selectionRect.start.y)}
                  stroke="#00e5ff"
                  strokeWidth={0.15}
                  dash={[0.6, 0.4]}
                  fill="rgba(0, 229, 255, 0.08)"
                  listening={false}
                />
              )}
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  );
}
