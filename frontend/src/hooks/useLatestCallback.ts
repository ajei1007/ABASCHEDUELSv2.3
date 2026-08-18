import { useRef, useLayoutEffect, useCallback } from 'react';

export function useLatestCallback<T extends (...args: any[]) => any>(
  handler: T,
): (...args: Parameters<T>) => ReturnType<T> {
  // Create a ref that maintains the handler's type
  const handlerRef = useRef<T>(handler);

  // Update the ref in render phase
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  // Return stable function that calls latest handler
  return useCallback((...args: Parameters<T>) => {
    return handlerRef.current(...args);
  }, []); // Empty deps since we want this function to be stable
}
