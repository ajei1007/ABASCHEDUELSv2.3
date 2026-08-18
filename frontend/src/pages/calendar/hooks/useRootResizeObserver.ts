import { useRef, useEffect } from 'react';

export function useRootResizeObserver({
  handleResize,
}: {
  handleResize: () => void;
}) {
  const rootElRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const rootEl = rootElRef.current;
    const resizeObserver = new ResizeObserver(handleResize);

    if (rootEl) {
      resizeObserver.observe(rootEl);
    }

    return () => {
      if (rootEl) {
        resizeObserver.unobserve(rootEl);
      }
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  return {
    rootElRef,
  };
}
