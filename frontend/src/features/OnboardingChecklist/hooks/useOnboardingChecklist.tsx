import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { fetchOnboardingChecklist } from 'store/slices/onboardingChecklist/actions';
import {
  selectOnboardingChecklist,
  selectOnboardingChecklistFetchingStatus,
  selectOnboardingChecklistError,
} from 'store/slices/onboardingChecklist/selectors';

/**
 * Custom hook for managing onboarding checklist state and actions.
 * Provides optimized selectors and memoized callbacks.
 */
export function useOnboardingChecklist() {
  const dispatch = useAppDispatch();

  const checklist = useAppSelector(selectOnboardingChecklist);
  const fetchingStatus = useAppSelector(
    selectOnboardingChecklistFetchingStatus,
  );
  const error = useAppSelector(selectOnboardingChecklistError);

  const isLoading = fetchingStatus === 'loading';
  const hasError = fetchingStatus === 'error';
  const isEmpty = useMemo(
    () =>
      !checklist ||
      checklist.length === 0 ||
      !checklist.some((item) => item.items.length > 0),
    [checklist],
  );

  const fetchChecklist = useCallback(() => {
    dispatch(fetchOnboardingChecklist({ skipCache: true }));
  }, [dispatch]);

  const refetchChecklist = fetchChecklist;

  const lastFetchingStatus = useRef(fetchingStatus);

  useEffect(() => {
    // If the fetching status has changed, we can log or handle it
    if (lastFetchingStatus.current !== fetchingStatus) {
      lastFetchingStatus.current = fetchingStatus;
    }
  }, [fetchingStatus]);

  const getLastFetchingStatus = useCallback(
    () => lastFetchingStatus.current,
    [],
  );

  return {
    checklist,
    fetchingStatus,
    isLoading,
    isEmpty,
    hasError,
    error,
    fetchChecklist,
    refetchChecklist,
    getLastFetchingStatus,
  };
}
