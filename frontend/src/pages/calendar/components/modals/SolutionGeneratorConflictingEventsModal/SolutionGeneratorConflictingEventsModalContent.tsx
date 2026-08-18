import { memo, type FC } from 'react';
import CustomButton from 'components/Button';
import InternalPortal from 'components/InternalPortal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { operateSelectedEvents } from 'store/slices/calendar/thunks';
import { selectConflictingEventsModal } from 'store/slices/solutionGenerator';
import UndynamicTable from '../../UndynamicTable';
import { orangeSolutionsTableColumns } from '../../../utils/calendarTableColumns';

/**
 * Interface for component props
 */
interface ISolutionGeneratorConflictingEventsModalContentProps {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  handleClose: () => void;
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
const SolutionGeneratorConflictingEventsModalContent: FC<
  ISolutionGeneratorConflictingEventsModalContentProps
> = ({ actionButtonsTargetRef, handleClose, onSuccess }) => {
  const dispatch = useAppDispatch();

  // Modal state from Redux store - contains visibility, conflict data, and event to be added
  const { conflictReasons, toBeAddedEvent } = useAppSelector(
    selectConflictingEventsModal,
  );

  // User's timezone setting for proper event scheduling
  const timezone = useAppSelector(
    (state) => state.settings.settingValues.timezone,
  );

  /**
   * Schedules the event despite conflicts.
   * This function prepares the event data with timezone information
   * and dispatches the operation to add the event to the calendar.
   *
   * @returns Promise resolving to the operation result
   */
  const scheduleEvent = async () => {
    let toBeAdded: any[] = [];

    // Prepare the event with timezone information if it exists
    if (toBeAddedEvent) {
      toBeAdded = [
        {
          ...toBeAddedEvent,
          timezone,
        },
      ];
    }

    // Dispatch the operation to add the event (skip validation to allow conflicts)
    const result = await dispatch(
      operateSelectedEvents({
        operations: {
          toBeAdded: {
            items: toBeAdded,
          },
        },
        skipValidation: true, // Skip validation to allow scheduling despite conflicts
      }),
    );

    // Execute success callback if operation was successful
    if (result.success) {
      onSuccess?.();
    }

    return result;
  };

  /**
   * Handles form submission - schedules the event and closes the modal
   */
  const handleSubmit = async () => {
    scheduleEvent();
    handleClose();
  };

  return (
    <>
      <UndynamicTable
        columns={orangeSolutionsTableColumns}
        rows={conflictReasons as any}
      />
      <InternalPortal targetRef={actionButtonsTargetRef}>
        {/* Primary action button to proceed with scheduling despite conflicts */}
        <CustomButton onClick={handleSubmit}>Schedule</CustomButton>
        {/* Secondary action button to cancel the operation */}
        <CustomButton onClick={handleClose} variant='outlined'>
          Cancel
        </CustomButton>
      </InternalPortal>
    </>
  );
};

// Set display name for better debugging and development experience
SolutionGeneratorConflictingEventsModalContent.displayName =
  'SolutionGeneratorConflictingEventsModalContent';

export default memo(SolutionGeneratorConflictingEventsModalContent);
