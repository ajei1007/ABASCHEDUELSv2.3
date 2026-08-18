import { type FC } from 'react';
import { useOnboardingChecklist } from '../../hooks/useOnboardingChecklist';
import ChecklistBodyLoading from './ChecklistBodyLoading';
import ChecklistBodyError from './ChecklistBodyError';
import ChecklistBodySuccess from './ChecklistBodySuccess';
import ChecklistBodyEmpty from './ChecklistBodyEmpty';

/**
 * Main body component for the onboarding checklist.
 * Handles loading, error, success, and empty states.
 */
const OnboardingChecklistBody: FC = () => {
  const {
    checklist,
    isLoading,
    hasError,
    error,
    getLastFetchingStatus,
    refetchChecklist,
  } = useOnboardingChecklist();

  // Loading state
  if (isLoading && getLastFetchingStatus() !== 'success') {
    return <ChecklistBodyLoading />;
  }

  // Error state
  if (hasError && getLastFetchingStatus() !== 'success') {
    return <ChecklistBodyError error={error} onRetry={refetchChecklist} />;
  }

  // Success state with data
  if (checklist.length > 0) {
    return <ChecklistBodySuccess checklist={checklist} />;
  }

  // Empty state
  return <ChecklistBodyEmpty />;
};

OnboardingChecklistBody.displayName = 'OnboardingChecklistBody';

export default OnboardingChecklistBody;
