import { useCallback, useEffect, useMemo } from 'react';
import { useMatch } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { fetchOnboardingChecklist } from 'store/slices/onboardingChecklist/actions';
import { useOnboardingChecklist } from '@/features/OnboardingChecklist/hooks/useOnboardingChecklist';
import { useOnboardingChecklistViewAccess } from '@/features/OnboardingChecklist/hooks/useOnboardingChecklistViewAccess';
import { useOnboardingChecklistSyncWithInterval } from '@/features/OnboardingChecklist/hooks/useOnboardingChecklistSyncWithInterval';

/**
 * Custom hook that manages the onboarding checklist progress logic.
 * Encapsulates the component's business logic for better testability and reusability.
 *
 * @returns {Object} Object containing visibility state and loading states
 */
export const useOnboardingChecklistProgress = () => {
  const dispatch = useAppDispatch();

  // Memoized selectors to prevent unnecessary re-renders
  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const companyOnboarded = useMemo(
    () => currentUser?.company?.onboarded ?? false,
    [currentUser?.company?.onboarded],
  );

  const hasAccessViewChecklist = useOnboardingChecklistViewAccess();
  const { isEmpty, isLoading, hasError, getLastFetchingStatus } =
    useOnboardingChecklist();

  // Memoized route match to prevent unnecessary recalculations
  const isDashboardRoute = useMatch('/app/dashboard');
  const isVisible = useMemo(() => !isDashboardRoute, [isDashboardRoute]);

  // Memoized dispatch callback to prevent unnecessary re-renders of child components
  const fetchChecklistData = useCallback(() => {
    dispatch(fetchOnboardingChecklist());
  }, [dispatch]);

  useEffect(() => {
    if (!companyOnboarded && hasAccessViewChecklist) {
      fetchChecklistData();
    }
  }, [companyOnboarded, hasAccessViewChecklist, fetchChecklistData]);

  // Determine if the component should render
  const shouldRender = useMemo(() => {
    if (companyOnboarded || !hasAccessViewChecklist) {
      return false;
    }

    const lastFetchingStatus = getLastFetchingStatus();

    if (
      ((isLoading || hasError) && lastFetchingStatus !== 'success') ||
      isEmpty
    ) {
      return false;
    }

    return true;
  }, [
    hasAccessViewChecklist,
    companyOnboarded,
    isLoading,
    hasError,
    isEmpty,
    getLastFetchingStatus,
  ]);

  useOnboardingChecklistSyncWithInterval({
    disabled: !isVisible || companyOnboarded || !hasAccessViewChecklist,
  });

  return {
    shouldRender,
    isVisible,
    companyOnboarded,
    isLoading,
    hasError,
    isEmpty,
  };
};
