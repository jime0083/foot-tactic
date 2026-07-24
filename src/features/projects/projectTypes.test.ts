import { createInitialSnapshot, normalizeSnapshot } from './projectTypes';
import { createObjectAt } from '@/features/board/objects/createObject';

describe('createInitialSnapshot', () => {
  it('空のシーン1つを持つ初期スナップショットを作る', () => {
    const snapshot = createInitialSnapshot('futsal');
    expect(snapshot.sportType).toBe('futsal');
    expect(snapshot.scenes).toHaveLength(1);
    expect(snapshot.scenes[0].objects).toHaveLength(0);
    expect(snapshot.layoutId).toBe('full-landscape');
  });
});

describe('normalizeSnapshot', () => {
  it('正常なデータはそのまま復元される', () => {
    const ball = createObjectAt('ball', 50, 34);
    const raw = {
      sportType: 'soccer8',
      layoutId: 'full-portrait',
      aspect: '9:16',
      fieldColors: { background: '#123456' },
      playerDisplay: { bodyRadius: 2 },
      scenes: [{ id: 's1', objects: [ball] }],
    };

    const snapshot = normalizeSnapshot(raw);

    expect(snapshot.sportType).toBe('soccer8');
    expect(snapshot.layoutId).toBe('full-portrait');
    expect(snapshot.aspect).toBe('9:16');
    expect(snapshot.fieldColors.background).toBe('#123456');
    expect(snapshot.fieldColors.line).toBeTruthy(); // 欠損は既定値で補完
    expect(snapshot.playerDisplay.bodyRadius).toBe(2);
    expect(snapshot.scenes[0].objects[0]).toEqual(ball);
  });

  it('旧既定サイズ(1.2)で保存された選手サイズは新既定値(2.4)へ引き上げられる', () => {
    const snapshot = normalizeSnapshot({ playerDisplay: { bodyRadius: 1.2 } });
    expect(snapshot.playerDisplay.bodyRadius).toBe(2.4);
  });

  it('独自に調整した選手サイズ(旧既定値以外)はそのまま保持される', () => {
    const snapshot = normalizeSnapshot({ playerDisplay: { bodyRadius: 1.8 } });
    expect(snapshot.playerDisplay.bodyRadius).toBe(1.8);
  });

  it('不正なデータは既定値に置き換えられる', () => {
    const snapshot = normalizeSnapshot({
      sportType: 'invalid',
      layoutId: 'unknown-layout',
      aspect: 'weird',
      scenes: 'not-an-array',
    });

    expect(snapshot.sportType).toBe('soccer11');
    expect(snapshot.layoutId).toBe('full-landscape');
    expect(snapshot.aspect).toBe('16:9');
    expect(snapshot.scenes).toHaveLength(1);
  });

  it('シーン内の不正なオブジェクトは除外される', () => {
    const ball = createObjectAt('ball', 50, 34);
    const snapshot = normalizeSnapshot({
      scenes: [{ id: 's1', objects: [ball, 'broken', { noId: true }] }],
    });
    expect(snapshot.scenes[0].objects).toHaveLength(1);
  });

  it('null/undefinedでも破綻しない', () => {
    expect(normalizeSnapshot(null).scenes).toHaveLength(1);
    expect(normalizeSnapshot(undefined).sportType).toBe('soccer11');
  });
});
