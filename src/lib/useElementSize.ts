import { useEffect, useRef, useState } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/** 要素のサイズをResizeObserverで監視するフック */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    // テスト環境(jsdom)などResizeObserver非対応環境では初期サイズのみ反映する
    if (typeof ResizeObserver === 'undefined') {
      const bounds = element.getBoundingClientRect();
      setSize({ width: bounds.width, height: bounds.height });
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
