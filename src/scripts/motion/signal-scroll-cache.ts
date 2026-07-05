export interface SignalLayoutCache<TLayout> {
  read: () => TLayout;
  invalidate: () => void;
}

export function createSignalLayoutCache<TLayout>(
  readLayout: () => TLayout,
): SignalLayoutCache<TLayout> {
  let cached: TLayout | null = null;

  return {
    read() {
      cached ??= readLayout();
      return cached;
    },
    invalidate() {
      cached = null;
    },
  };
}
