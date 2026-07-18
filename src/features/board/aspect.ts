import type { BoardAspect } from '@/stores/boardStore';

export interface AspectBox {
  width: number;
  height: number;
}

const ASPECT_RATIOS: Record<BoardAspect, number> = {
  '16:9': 16 / 9,
  '9:16': 9 / 16,
};

/** コンテナ内に指定アスペクト比のボックスを最大サイズで収める */
export function fitAspectBox(
  containerWidth: number,
  containerHeight: number,
  aspect: BoardAspect,
): AspectBox {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { width: 0, height: 0 };
  }
  const ratio = ASPECT_RATIOS[aspect];
  const containerRatio = containerWidth / containerHeight;
  if (containerRatio > ratio) {
    return { width: containerHeight * ratio, height: containerHeight };
  }
  return { width: containerWidth, height: containerWidth / ratio };
}
