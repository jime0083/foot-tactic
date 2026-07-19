import type Konva from 'konva';

/** 書き出し画像の目標幅(ピクセル) */
export const EXPORT_TARGET_WIDTH = 1920;

/** 表示サイズから目標幅に合わせるpixelRatioを計算する */
export function computePixelRatio(stageWidth: number, targetWidth = EXPORT_TARGET_WIDTH): number {
  if (stageWidth <= 0) {
    return 1;
  }
  return targetWidth / stageWidth;
}

/** Stageを高解像度PNGのdata URLへ変換する */
export function stageToPngDataUrl(stage: Konva.Stage, targetWidth = EXPORT_TARGET_WIDTH): string {
  return stage.toDataURL({
    mimeType: 'image/png',
    pixelRatio: computePixelRatio(stage.width(), targetWidth),
  });
}

/** ファイル名に使えない文字を置き換える */
export function sanitizeFileName(name: string): string {
  const sanitized = name.replace(/[\\/:*?"<>|]/g, '_').trim();
  return sanitized === '' ? 'board' : sanitized;
}

/** data URLをファイルとしてダウンロードする */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** 描画の反映を待つ(選択解除後のキャプチャ用) */
export function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
