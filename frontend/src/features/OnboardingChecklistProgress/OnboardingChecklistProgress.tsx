import { memo } from 'react';
import { OnboardingChecklistProgressPopoverContextProvider } from './context/OnboardingChecklistProgressPopoverContext';
import OnboardingChecklistProgressActivator from './components/OnboardingChecklistProgressActivator';
import OnboardingChecklistProgressPopover from './components/OnboardingChecklistProgressPopover';
import OnboardingChecklistProgressBody from './components/OnboardingChecklistProgressBody';
import { useOnboardingChecklistProgress } from './hooks/useOnboardingChecklistProgress';

/**
 * OnboardingChecklistProgress component displays the onboarding checklist progress
 * as a popover when the company is not yet onboarded. It only renders when necessary.
 *
 * Performance optimizations:
 * - Early returns to avoid unnecessary rendering
 * - Custom hook for business logic separation
 * - Proper dependency arrays in useEffect
 */
const OnboardingChecklistProgress = () => {
  const { shouldRender, isVisible } = useOnboardingChecklistProgress();

  // Early return for better performance - avoid rendering when not needed
  if (!shouldRender) {
    return null;
  }

  return (
    <OnboardingChecklistProgressPopoverContextProvider>
      <OnboardingChecklistProgressPopover
        activatorButton={
          <OnboardingChecklistProgressActivator visible={isVisible} />
        }
      >
        <OnboardingChecklistProgressBody />
      </OnboardingChecklistProgressPopover>
    </OnboardingChecklistProgressPopoverContextProvider>
  );
};

OnboardingChecklistProgress.displayName = 'OnboardingChecklistProgress';

export default memo(OnboardingChecklistProgress);
