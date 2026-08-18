import { useState, useCallback, type FC } from 'react';
import ChecklistPhaseAccordion from './ChecklistPhaseAccordion';
import ChecklistPhaseHeader from './ChecklistPhaseHeader';
import type { IApiOnboardingChecklistPhaseItem } from 'types/api';

export interface IOnboardingChecklistPhaseProps {
  /** Zero-based index of the phase */
  index: number;
  /** Phase data containing checklist items */
  phase: IApiOnboardingChecklistPhaseItem;
  /** Child components to render in the accordion content */
  children?: React.ReactNode;
  /** Initial expanded state - defaults to true */
  defaultExpanded?: boolean;
  /** Callback fired when expansion state changes */
  onExpandedChange?: (expanded: boolean) => void;
}

const OnboardingChecklistPhase: FC<IOnboardingChecklistPhaseProps> = ({
  index,
  phase,
  children,
  defaultExpanded = true,
  onExpandedChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const newState = !prev;
      onExpandedChange?.(newState);
      return newState;
    });
  }, [onExpandedChange]);

  return (
    <ChecklistPhaseAccordion
      isExpanded={isExpanded}
      toggleExpanded={toggleExpanded}
      headerElement={
        <ChecklistPhaseHeader
          index={index}
          phase={phase}
          isExpanded={isExpanded}
          toggleExpanded={toggleExpanded}
        />
      }
      contentElement={children}
    />
  );
};

OnboardingChecklistPhase.displayName = 'OnboardingChecklistPhase';

export default OnboardingChecklistPhase;
