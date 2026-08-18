import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect if the current browser tab is active/visible
 * Handles all visibility scenarios and returns a simple boolean
 *
 * @returns {boolean} true if tab is active/visible, false otherwise
 */
export function useBrowserTabVisibility() {
  // Initialize with current visibility state
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === 'undefined') return true; // SSR safety
    return !document.hidden && document.visibilityState !== 'hidden';
  });

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Helper function to determine visibility from multiple sources
    const determineVisibility = () => {
      if (typeof document === 'undefined') return true;

      // Check Page Visibility API (most reliable)
      if (document.hidden) return false;
      if (document.visibilityState === 'hidden') return false;

      return true;
    };

    // Update visibility state safely
    const updateVisibility = () => {
      if (isMountedRef.current) {
        const newVisibility = determineVisibility();
        setIsVisible(newVisibility);
      }
    };

    // Set initial state
    updateVisibility();

    // Event handlers
    const handleVisibilityChange = () => updateVisibility();
    const handleFocus = () => updateVisibility();
    const handleBlur = () => updateVisibility();
    const handlePageShow = () => updateVisibility();
    const handlePageHide = () => updateVisibility();

    // Add all relevant event listeners
    const events = [
      // Page Visibility API events
      ['visibilitychange', handleVisibilityChange],
      // Legacy browser support
      ['webkitvisibilitychange', handleVisibilityChange],
      ['mozvisibilitychange', handleVisibilityChange],
      ['msvisibilitychange', handleVisibilityChange],
      // Window focus events
      ['focus', handleFocus],
      ['blur', handleBlur],
      // Page lifecycle events
      ['pageshow', handlePageShow],
      ['pagehide', handlePageHide],
    ] as const;

    // Attach event listeners
    events.forEach(([event, handler]) => {
      if (event.includes('visibility')) {
        document.addEventListener(event, handler);
      } else {
        window.addEventListener(event, handler);
      }
    });

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      events.forEach(([event, handler]) => {
        if (event.includes('visibility')) {
          document.removeEventListener(event, handler);
        } else {
          window.removeEventListener(event, handler);
        }
      });
    };
  }, []);

  // Mark component as unmounted when it unmounts
// Removed redundant useEffect that duplicated cleanup logic.

  return isVisible;
}
