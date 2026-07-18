import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';
import { SceneThumbnail } from './SceneThumbnail';

/** シーンの切替・追加・複製・削除・並び替えを行う下部ストリップ */
export function SceneStrip() {
  const { t } = useTranslation();
  const scenes = useBoardStore((state) => state.scenes);
  const currentSceneIndex = useBoardStore((state) => state.currentSceneIndex);
  const objects = useBoardStore((state) => state.objects);
  const sportType = useBoardStore((state) => state.sportType);
  const addScene = useBoardStore((state) => state.addScene);
  const duplicateScene = useBoardStore((state) => state.duplicateScene);
  const deleteScene = useBoardStore((state) => state.deleteScene);
  const switchScene = useBoardStore((state) => state.switchScene);
  const moveScene = useBoardStore((state) => state.moveScene);
  const dragFromIndex = useRef<number | null>(null);

  return (
    <div className="scene-strip" role="toolbar" aria-label={t('board.scenes.title')}>
      {scenes.map((scene, index) => (
        <button
          key={scene.id}
          type="button"
          className={
            index === currentSceneIndex
              ? 'scene-strip__item scene-strip__item--active'
              : 'scene-strip__item'
          }
          aria-pressed={index === currentSceneIndex}
          onClick={() => switchScene(index)}
          draggable
          onDragStart={() => {
            dragFromIndex.current = index;
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (dragFromIndex.current !== null) {
              moveScene(dragFromIndex.current, index);
              dragFromIndex.current = null;
            }
          }}
        >
          <SceneThumbnail
            objects={index === currentSceneIndex ? objects : scene.objects}
            sportType={sportType}
          />
          <span>{index + 1}</span>
        </button>
      ))}
      <button type="button" onClick={addScene}>
        {t('board.scenes.add')}
      </button>
      <button type="button" onClick={duplicateScene}>
        {t('board.scenes.duplicate')}
      </button>
      <button
        type="button"
        disabled={scenes.length <= 1}
        onClick={() => deleteScene(currentSceneIndex)}
      >
        {t('board.scenes.delete')}
      </button>
    </div>
  );
}
