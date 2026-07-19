import { vi } from 'vitest';
import type Konva from 'konva';
import {
  computePixelRatio,
  downloadDataUrl,
  sanitizeFileName,
  stageToPngDataUrl,
  EXPORT_TARGET_WIDTH,
} from './exportPng';
import { getRegisteredStage, registerStage } from './stageRegistry';

describe('computePixelRatio', () => {
  it('目標幅に合わせた倍率を返す', () => {
    expect(computePixelRatio(960)).toBe(EXPORT_TARGET_WIDTH / 960);
    expect(computePixelRatio(1920)).toBe(1);
  });

  it('幅が0以下の場合は1を返す', () => {
    expect(computePixelRatio(0)).toBe(1);
    expect(computePixelRatio(-10)).toBe(1);
  });
});

describe('sanitizeFileName', () => {
  it('ファイル名に使えない文字を置き換える', () => {
    expect(sanitizeFileName('vs FC東京 3/15 前半:分析')).toBe('vs FC東京 3_15 前半_分析');
  });

  it('空文字はboardになる', () => {
    expect(sanitizeFileName('')).toBe('board');
    expect(sanitizeFileName('///')).toBe('___');
  });
});

describe('stageToPngDataUrl', () => {
  it('Stageの幅から計算したpixelRatioでtoDataURLを呼ぶ', () => {
    const toDataURL = vi.fn(() => 'data:image/png;base64,xxx');
    const stage = { width: () => 960, toDataURL } as unknown as Konva.Stage;

    const result = stageToPngDataUrl(stage);

    expect(result).toBe('data:image/png;base64,xxx');
    expect(toDataURL).toHaveBeenCalledWith({
      mimeType: 'image/png',
      pixelRatio: 2,
    });
  });
});

describe('downloadDataUrl', () => {
  it('アンカー要素を生成してクリックする', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadDataUrl('data:image/png;base64,xxx', 'test.png');

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });
});

describe('stageRegistry', () => {
  it('Stageの登録と取得・解除ができる', () => {
    const stage = {} as Konva.Stage;
    registerStage(stage);
    expect(getRegisteredStage()).toBe(stage);
    registerStage(null);
    expect(getRegisteredStage()).toBeNull();
  });
});
