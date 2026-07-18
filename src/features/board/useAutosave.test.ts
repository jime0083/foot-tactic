import { act, renderHook } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { AUTOSAVE_DEBOUNCE_MS, useAutosave } from './useAutosave';
import { createObjectAt } from './objects/createObject';
import { saveProjectSnapshot } from '@/features/projects/projectService';
import { useBoardStore } from '@/stores/boardStore';

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('@/features/projects/projectService', () => ({
  saveProjectSnapshot: vi.fn(),
}));

describe('useAutosave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useBoardStore.setState({
      objects: [],
      selectedIds: [],
      past: [],
      future: [],
      lastUpdateKey: null,
      scenes: [{ id: 'scene-1', objects: [] }],
      currentSceneIndex: 0,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('変更後にデバウンス時間が経過すると自動保存される', async () => {
    (saveProjectSnapshot as Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutosave('u1', 'p1', true));

    act(() => {
      useBoardStore.getState().addObject(createObjectAt('ball', 10, 10));
    });
    expect(result.current.saveState).toBe('dirty');
    expect(saveProjectSnapshot).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);
      await Promise.resolve();
    });

    expect(saveProjectSnapshot).toHaveBeenCalledTimes(1);
    expect(result.current.saveState).toBe('saved');
  });

  it('連続した変更はデバウンスされ1回だけ保存される', async () => {
    (saveProjectSnapshot as Mock).mockResolvedValue(undefined);
    renderHook(() => useAutosave('u1', 'p1', true));

    act(() => {
      useBoardStore.getState().addObject(createObjectAt('ball', 10, 10));
    });
    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS / 2);
      useBoardStore.getState().addObject(createObjectAt('marker', 20, 20));
    });
    await act(async () => {
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);
      await Promise.resolve();
    });

    expect(saveProjectSnapshot).toHaveBeenCalledTimes(1);
  });

  it('手動保存(saveNow)で即時保存される', async () => {
    (saveProjectSnapshot as Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutosave('u1', 'p1', true));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(saveProjectSnapshot).toHaveBeenCalledTimes(1);
    expect(result.current.saveState).toBe('saved');
  });

  it('保存に失敗するとerror状態になる', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (saveProjectSnapshot as Mock).mockRejectedValue(new Error('permission-denied'));
    const { result } = renderHook(() => useAutosave('u1', 'p1', true));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.saveState).toBe('error');
    consoleError.mockRestore();
  });

  it('無効(enabled=false)の間は変更を監視しない', () => {
    renderHook(() => useAutosave('u1', 'p1', false));

    act(() => {
      useBoardStore.getState().addObject(createObjectAt('ball', 10, 10));
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS * 2);
    });

    expect(saveProjectSnapshot).not.toHaveBeenCalled();
  });
});
