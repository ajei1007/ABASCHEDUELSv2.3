import { memo, useCallback, useRef, type FC } from 'react';
import { Stack } from '@mui/material';
import CustomModal from 'components/Modal';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { selectReplaceEventsModal } from 'store/slices/solutionGenerator';
import { hideReplaceEventsModal } from 'store/slices/solutionGenerator/actions';
import SolutionGeneratorReplaceEventsModalContent from './SolutionGeneratorReplaceEventsModalContent';

/**
 * Interface for component props
 */
interface ISolutionGeneratorReplaceEventsModalProps {
  /** Optional callback to execute after successful event replacement */
  onSuccess?: () => void;
}

/**
 * Modal component for handling event replacement in the Solution Generator.
 * This modal allows users to replace conflicting events with new ones while preserving
 * non-overlapping portions of the original events.
 *
 * Key features:
 * - Displays table of events that will be replaced
 * - Splits overlapping events to preserve non-conflicting portions
 * - Handles timezone-aware event manipulation
 * - Provides confirmation interface for replacement operations
 */
const SolutionGeneratorReplaceEventsModal: FC<
  ISolutionGeneratorReplaceEventsModalProps
> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  // Modal state from Redux store
  const { isOpen } = useAppSelector(selectReplaceEventsModal);

  const actionButtonsTargetRef = useRef(null);

  const handleClose = useCallback(() => {
    dispatch(hideReplaceEventsModal());
  }, []);

  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='solution-generator-replace-events-modal-title'
      aria-describedby='solution-generator-replace-events-modal-description'
      title='Replace Events'
      maxWidth='xl'
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <SolutionGeneratorReplaceEventsModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        handleClose={handleClose}
        onSuccess={onSuccess}
      />
    </CustomModal>
  );
};

// Set display name for better debugging and development experience
SolutionGeneratorReplaceEventsModal.displayName =
  'SolutionGeneratorReplaceEventsModal';

export default memo(SolutionGeneratorReplaceEventsModal);
