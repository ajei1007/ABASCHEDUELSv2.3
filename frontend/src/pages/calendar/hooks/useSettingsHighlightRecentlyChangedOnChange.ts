import { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { setEventsLoading } from 'store/slices/calendar/actions';
import { fetchEvents } from 'store/slices/calendar/thunks';

export function useSettingsHighlightRecentlyChangedOnChange() {
  const dispatch = useAppDispatch();
  const settingsInitialized = useAppSelector(
    (state) => state.settings.settingValues.initialized,
  );
  const settingsHighlightRecentlyChanged = useAppSelector(
    (state) => state.settings.settingValues.highlightRecentlyChanged,
  );

  const lastInitialized = useRef(settingsInitialized);
  const lastHighlightRecentlyChanged = useRef(false);
  const debounceTimer = useRef(-1);

  const handleHighlightRecentlyChangedValueChange = useLatestCallback(
    async (_: boolean) => {
      const fetch = async () => {
        dispatch(setEventsLoading(true));
        try {
          await dispatch(
            fetchEvents({
              bol: false,
            }),
          );
        } catch {
          // empty catch to handle any errors
        } finally {
          dispatch(setEventsLoading(false));
        }
      };

      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(fetch, 300);
    },
  );

  useEffect(() => {
    if (settingsInitialized !== lastInitialized.current) {
      lastInitialized.current = settingsInitialized;
      lastHighlightRecentlyChanged.current = settingsHighlightRecentlyChanged;
    }

    if (
      settingsHighlightRecentlyChanged !== lastHighlightRecentlyChanged.current
    ) {
      lastHighlightRecentlyChanged.current = settingsHighlightRecentlyChanged;
      handleHighlightRecentlyChangedValueChange(
        settingsHighlightRecentlyChanged,
      );
    }
  }, [
    settingsInitialized,
    settingsHighlightRecentlyChanged,
    handleHighlightRecentlyChangedValueChange,
  ]);
}
