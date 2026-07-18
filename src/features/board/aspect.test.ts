import { fitAspectBox } from './aspect';

describe('fitAspectBox', () => {
  it('横長コンテナに16:9を収めると高さ基準になる', () => {
    expect(fitAspectBox(2000, 900, '16:9')).toEqual({ width: 1600, height: 900 });
  });

  it('縦長コンテナに16:9を収めると幅基準になる', () => {
    expect(fitAspectBox(1600, 2000, '16:9')).toEqual({ width: 1600, height: 900 });
  });

  it('9:16は縦長ボックスになる', () => {
    const box = fitAspectBox(1000, 1600, '9:16');
    expect(box.width).toBeCloseTo(900);
    expect(box.height).toBe(1600);
  });

  it('コンテナサイズが0なら0を返す', () => {
    expect(fitAspectBox(0, 0, '16:9')).toEqual({ width: 0, height: 0 });
  });
});
