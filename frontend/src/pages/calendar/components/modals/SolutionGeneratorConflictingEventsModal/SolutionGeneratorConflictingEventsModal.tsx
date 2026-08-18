import { memo, useRef, useCallback, type FC } from 'react';
import { Stack } from '@mui/material';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectConflictingEventsModal } from 'store/slices/solutionGenerator';
import { hideConflictingEventsModal } from 'store/slices/solutionGenerator/actions';
import SolutionGeneratorConflictingEventsModalContent from './SolutionGeneratorConflictingEventsModalContent';

/**
 * Interface for component props
 */
interface ISolutionGeneratorConflictingEventsModalProps {
  /** Optional callback to execute after successful event replacement */
  onSuccess?: () => void;
}

/**
 * Modal component for handling conflicting events in the Solution Generator.
 * This modal displays conflicts that occur when trying to schedule a new event
 * that overlaps with existing events. It provides users with the ability to
 * either proceed with scheduling despite conflicts or cancel the operation.
 *
 * Key features:
 * - Displays table of conflicting events with reasons for conflicts
 * - Allows users to schedule events even when conflicts exist
 * - Provides timezone-aware event scheduling
 * - Handles user confirmation workflow for conflict resolution
 *
 * @param props - Component props
 * @param props.onSuccess - Optional callback executed after successful event scheduling
 */
const SolutionGeneratorConflictingEventsModal: FC<
  ISolutionGeneratorConflictingEventsModalProps
> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  // Modal state from Redux store
  const { isOpen } = useAppSelector(selectConflictingEventsModal);

  const actionButtonsTargetRef = useRef(null);

  const handleClose = useCallback(() => {
    dispatch(hideConflictingEventsModal());
  }, []);

  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='Popup Window Modal'
      aria-describedby='Popup Window Modal For Scheduler'
      title={'Conflicts'}
      maxWidth='xl'
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <SolutionGeneratorConflictingEventsModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        handleClose={handleClose}
        onSuccess={onSuccess}
      />
    </CustomModal>
  );
};

// Set display name for better debugging and development experience
SolutionGeneratorConflictingEventsModal.displayName =
  'SolutionGeneratorConflictingEventsModal';

export default memo(SolutionGeneratorConflictingEventsModal);
