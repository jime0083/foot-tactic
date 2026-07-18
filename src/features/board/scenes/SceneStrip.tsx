import { useTranslation } from 'react-i18next';
import { useBoardStore } from '@/stores/boardStore';

/** シーンの切替・追加・複製・削除を行う下部ストリップ */
export function SceneStrip() {
  const { t } = useTranslation();
  const scenes = useBoardStore((state) => state.scenes);
  const currentSceneIndex = useBoardStore((state) => state.currentSceneIndex);
  const addScene = useBoardStore((state) => state.addScene);
  const duplicateScene = useBoardStore((state) => state.duplicateScene);
  const deleteScene = useBoardStore((state) => state.deleteScene);
  const switchScene = useBoardStore((state) => state.switchScene);

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
        >
          {index + 1}
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
