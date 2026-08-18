import moment from 'moment';
import { memo, type FC } from 'react';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { selectReplaceEventsModal } from 'store/slices/solutionGenerator';
import { operateSelectedEvents } from 'store/slices/calendar/thunks';
import CustomButton from 'components/Button';
import InternalPortal from 'components/InternalPortal';
import UndynamicTable from '../../UndynamicTable';
import { overbookingColumns } from '../../../utils/calendarTableColumns';
import { handleEvent } from '../../../utils/formatters';
import { prepareToBeDeletedEvents } from '../../../utils/prepareToBeDeletedEvents';
import { prepareObjectForUpdate } from 'utils/prepareObjectForUpdateRequest';

// Constants for date and time formatting
const DATE_FORMAT = 'MM/DD/YYYY HH:mm';
const RECUR_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Interface for component props
 */
interface ISolutionGeneratorReplaceEventsModalContentProps {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  handleClose: () => void;
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
const SolutionGeneratorReplaceEventsModalContent: FC<
  ISolutionGeneratorReplaceEventsModalContentProps
> = ({ actionButtonsTargetRef, handleClose, onSuccess }) => {
  const dispatch = useAppDispatch();

  // Modal state from Redux store
  const { replaceReasons, toBeAddedEvent, toBeDeletedEvents } = useAppSelector(
    selectReplaceEventsModal,
  );

  // Calendar configuration from Redux store
  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const storeCalendarEnd = useAppSelector(
    (state) => state.calendar.calendar_end,
  );

  // Resource data for event processing
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );

  // User's timezone setting
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  /**
   * Calculate event replacement data.
   * This processes the events to be added and deleted for the replacement operation.
   */
  const getReplacementData = () => {
    if (!toBeAddedEvent || !Array.isArray(toBeDeletedEvents)) {
      return {
        toBeAdded: [] as any[],
        toBeDeleted: [] as any[],
      };
    }

    // Prepare the new event with timezone information
    const extracted_event = {
      ...toBeAddedEvent,
      timezone: storeSettingsValuesTimezone,
    };

    // Format the new event for API consumption
    const newEvent = handleEvent({
      event: extracted_event,
      activityResources: storeActivityResources,
      locationResources: storeLocationResources,
      fallbackTimezone: extracted_event.timezone,
    });

    // Prepare overlapping events for processing
    const overlappingEvents = toBeDeletedEvents.map((ev: any) =>
      prepareObjectForUpdate(ev),
    );

    // Calculate time boundaries for event splitting
    const clickedEventStartTime = moment(extracted_event.start).format(
      DATE_FORMAT,
    );
    const clickedEventEndTime = moment(extracted_event.end).format(DATE_FORMAT);
    const startDate = moment(extracted_event.start);
    const startDatePlusOne = moment(extracted_event.start).add(1, 'days');

    // Process overlapping events to preserve non-conflicting portions
    const notOverlappingEventParts: any[] = [];

    overlappingEvents.forEach((ev) => {
      const eventStartTime = moment(ev.start).format(DATE_FORMAT);
      const eventEndTime = moment(ev.end).format(DATE_FORMAT);

      // Create event portion before the new event (if it exists)
      if (moment(eventStartTime).isBefore(clickedEventStartTime)) {
        notOverlappingEventParts.push({
          ...ev,
          startRecur: startDate.format(RECUR_DATE_FORMAT),
          endRecur: startDatePlusOne.format(RECUR_DATE_FORMAT),
          start: moment(ev.start).format(),
          end: moment(extracted_event.start).format(),
          timezone: storeSettingsValuesTimezone,
        });
      }

      // Create event portion after the new event (if it exists)
      if (moment(eventEndTime).isAfter(clickedEventEndTime)) {
        notOverlappingEventParts.push({
          ...ev,
          startRecur: startDate.format(RECUR_DATE_FORMAT),
          endRecur: startDatePlusOne.format(RECUR_DATE_FORMAT),
          start: moment(extracted_event.end).format(),
          end: moment(ev.end).format(),
          timezone: storeSettingsValuesTimezone,
        });
      }
    });

    // Prepare final lists for addition and deletion
    const toBeAdded = [newEvent.data, ...notOverlappingEventParts];
    const toBeDeleted = overlappingEvents.map((ev) => ({
      ...ev,
      startRecur: startDate.format(RECUR_DATE_FORMAT),
      endRecur: startDatePlusOne.format(RECUR_DATE_FORMAT),
    }));

    return {
      toBeAdded,
      toBeDeleted,
    };
  };

  /**
   * Executes the event replacement operation.
   * This function dispatches the necessary actions to add new events and remove conflicting ones.
   */
  const replaceEvents = async () => {
    const { toBeAdded, toBeDeleted } = getReplacementData();

    // Dispatch the operation to replace events
    const result = await dispatch(
      operateSelectedEvents({
        operations: {
          toBeAdded: {
            items: toBeAdded,
          },
          toBeDeleted: prepareToBeDeletedEvents({
            events: toBeDeleted,
            deleteType: 'ONLY',
            calendarStartDate: storeCalendarStart,
            calendarEndDate: storeCalendarEnd,
            timezone: storeSettingsValuesTimezone,
          }),
        },
        formatted: true,
        skipValidation: true,
      }),
    );

    // Execute success callback if operation was successful
    if (result.success) {
      onSuccess?.();
    }

    return result;
  };

  /**
   * Handles form submission - replaces events and closes modal
   */
  const handleSubmit = async () => {
    replaceEvents();
    handleClose();
  };

  return (
    <>
      <UndynamicTable
        columns={overbookingColumns}
        rows={replaceReasons as any}
      />
      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={handleSubmit} variant='contained'>
          Replace
        </CustomButton>
        <CustomButton onClick={handleClose} variant='outlined'>
          Cancel
        </CustomButton>
      </InternalPortal>
    </>
  );
};

// Set display name for better debugging and development experience
SolutionGeneratorReplaceEventsModalContent.displayName =
  'SolutionGeneratorReplaceEventsModalContent';

export default memo(SolutionGeneratorReplaceEventsModalContent);
