import { type FC } from 'react';
import { Stack, Collapse } from '@mui/material';
import { useIsOnboardingCompleted } from '../../hooks/useOnboardingProgress';
import { useChecklistItemToggleAccess } from '../../hooks/useChecklistItemToggleAccess';
import { useOnboardingChecklistWithExpansion } from '../../hooks/useOnboardingChecklistWithExpansion';
import OnboardingChecklistPhase from '../OnboardingChecklistPhase/OnboardingChecklistPhase';
import OnboardingChecklistItem from '../OnboardingChecklistItem/OnboardingChecklistItem';
import OnboardingChecklistSuccessMessage from '../OnboardingChecklistSuccessMessage';
import type { IApiOnboardingChecklistPhaseItem } from 'types/api';

export interface IChecklistBodySuccessProps {
  checklist: IApiOnboardingChecklistPhaseItem[];
}

/**
 * Success state component for displaying the onboarding checklist.
 * Renders phases and items from the provided checklist data.
 */
const ChecklistBodySuccess: FC<IChecklistBodySuccessProps> = ({
  checklist,
}) => {
  const isOnboardingCompleted = useIsOnboardingCompleted();
  const hasAccessToggleItem = useChecklistItemToggleAccess();
  const expandedChecklist = useOnboardingChecklistWithExpansion(checklist);

  return (
    <Stack
      flexDirection='column'
      pt={2}
      rowGap='1rem'
      role='main'
      aria-label='Onboarding checklist items'
    >
      <Collapse in={isOnboardingCompleted}>
        <OnboardingChecklistSuccessMessage />
      </Collapse>
      {expandedChecklist.map((phase, index) => (
        <OnboardingChecklistPhase
          key={phase.id || index}
          index={index}
          phase={phase}
          defaultExpanded={phase.initialExpanded}
        >
          <Stack direction='column' spacing='0.75rem' px={3} pb={3} pt={1}>
            {phase.items.map((item, itemIndex) => (
              <OnboardingChecklistItem
                key={item.id || itemIndex}
                checklistItem={item}
                hasAccessToggleItem={hasAccessToggleItem}
              />
            ))}
          </Stack>
        </OnboardingChecklistPhase>
      ))}
    </Stack>
  );
};

ChecklistBodySuccess.displayName = 'ChecklistBodySuccess';

export default ChecklistBodySuccess;
