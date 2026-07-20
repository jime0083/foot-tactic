import { stageToPngDataUrl, waitForNextFrame } from '@/features/board/export/exportPng';
import { getRegisteredStage } from '@/features/board/export/stageRegistry';
import { useBoardStore } from '@/stores/boardStore';

/**
 * Googleドキュメント貼付用の画像幅(ピクセル)。
 * 全シーンをHTMLに埋め込むためアップロードサイズを抑えめにする
 */
export const GDOC_IMAGE_WIDTH = 1280;

/**
 * プロジェクト内の全シーンをシーン順にPNG(data URL)としてキャプチャする。
 * 表示中のステージを使ってシーンを順に切り替えながら描画するため、
 * 実行中は画面のシーンが一時的に切り替わり、完了後に元のシーンへ戻る。
 */
export async function captureAllScenesPng(): Promise<string[]> {
  const store = useBoardStore.getState();
  const originalIndex = store.currentSceneIndex;
  const sceneCount = store.scenes.length;
  const images: string[] = [];

  try {
    for (let index = 0; index < sceneCount; index += 1) {
      useBoardStore.getState().switchScene(index);
      useBoardStore.getState().clearSelection();
      await waitForNextFrame();
      const stage = getRegisteredStage();
      if (!stage) {
        throw new Error('ボードが表示されていないため画像を生成できません');
      }
      images.push(stageToPngDataUrl(stage, GDOC_IMAGE_WIDTH));
    }
  } finally {
    // 失敗時も元のシーンへ戻す
    useBoardStore.getState().switchScene(originalIndex);
  }
  return images;
}
