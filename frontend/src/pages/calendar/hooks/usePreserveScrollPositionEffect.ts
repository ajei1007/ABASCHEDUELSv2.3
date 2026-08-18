import { useEffect, useRef, useLayoutEffect } from 'react';
import { useAppSelector } from 'store/hooks';
import { selectEventFormDrawerOpen } from 'store/slices/calendarOverlayingPanels';

/**
 * WORKAROUND: Preserves scroll position when event form drawer state changes
 *
 * This hook is a workaround solution to handle unwanted scroll position resets
 * that occur when the event form drawer or related UI components cause the page
 * to scroll back to the top. This commonly happens when:
 * - Components re-render and reset document scroll
 * - Layout changes trigger automatic scroll resets
 * - Event form drawer state changes cause unwanted side effects on scroll position
 *
 * The hook monitors the event form drawer state from Redux and preserves the
 * scroll position when the drawer closes to prevent jarring scroll jumps.
 *
 * @example
 * usePreserveScrollPositionEffect();
 */
export function usePreserveScrollPositionEffect() {
  const eventFormDrawerOpen = useAppSelector(selectEventFormDrawerOpen);

  // Store the last known scroll position to restore it later
  const lastScrollTop = useRef(0);

  // WORKAROUND: Capture scroll position before event form drawer state changes
  // useLayoutEffect runs synchronously before DOM mutations to prevent flickering
  useLayoutEffect(() => {
    if (eventFormDrawerOpen) {
      return;
    }

    const scrollTop = document.documentElement.scrollTop;
    lastScrollTop.current = scrollTop;
  }, [eventFormDrawerOpen]);

  // WORKAROUND: Restore scroll position after other components reset it
  // This effect runs after the DOM has been updated and checks if scroll
  // position was unexpectedly changed by other components
  useEffect(() => {
    if (eventFormDrawerOpen) {
      return;
    }

    const currentScrollTop = document.documentElement.scrollTop;

    // If scroll position was reset by another component, restore it
    if (currentScrollTop !== lastScrollTop.current) {
      document.documentElement.scrollTop = lastScrollTop.current;
    }
  }, [eventFormDrawerOpen]);
}
