import { useMemo, useState, memo, useCallback } from 'react';
import moment from 'moment';
import { Stack, Typography, Box } from '@mui/material';
import CustomButton, { type ICustomButtonProps } from 'components/Button';
import CustomInput from 'components/CustomInputModal/CustomInput';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomModal from 'components/Modal';
import { getEventDeleteType } from '../../../utils/getEventDeleteType';
import { prepareToBeDeletedEvents } from '../../../utils/prepareToBeDeletedEvents';
import { eventOptions } from '../../../constants';
import { isDateRangeRecurring } from 'utils/isDateRangeRecurring';
import type {
  IApiCalendarEventItem,
  IApiCalendarEventGroupItem,
  TApiEventDeleteType,
} from 'types/api';

import EventsTable from './EventsTable';
import RecurringEventsGroup from './RecurringEventsGroup';

export interface IEventsDeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  confirmButtonText: string;
  confirmButtonColor: ICustomButtonProps['color'];
  enableTypeToConfirm?: boolean;
  showSelectInput: boolean;
  options: {
    value: string;
    label: string;
  }[];
  events: {
    event: any;
    isRecurring: boolean;
  }[];
  eventGroups: IApiCalendarEventGroupItem[];
  calendarStartDate: any;
  calendarEndDate: any;
  timezone: any;
  useCalendarDateRangeForFuture: boolean;
  handleClose: () => void;
  handleConfirm: (payload: {
    items: any[];
    deleteType: TApiEventDeleteType;
  }) => void;
}

export interface IEventsDeleteConfirmModalPropsForRef
  extends Pick<
    IEventsDeleteConfirmModalProps,
    | 'options'
    | 'showSelectInput'
    | 'events'
    | 'eventGroups'
    | 'calendarStartDate'
    | 'calendarEndDate'
    | 'timezone'
    | 'useCalendarDateRangeForFuture'
  > {}

const EventsDeleteConfirmModal = ({
  isOpen,
  title,
  confirmButtonText,
  confirmButtonColor = 'primary',
  enableTypeToConfirm = false,
  showSelectInput,
  options,
  events,
  eventGroups,
  calendarStartDate,
  calendarEndDate,
  timezone,
  useCalendarDateRangeForFuture,
  handleClose,
  handleConfirm,
}: IEventsDeleteConfirmModalProps) => {
  const [text, setText] = useState('');
  const [value, setValue] = useState<(typeof eventOptions)[number]>(options[0]);

  const disabledConfirmButton = useMemo(() => {
    if (enableTypeToConfirm) {
      return text !== 'delete';
    }
    return false;
  }, [enableTypeToConfirm, text]);

  // Determine what type of deletion is being performed based on user selection
  const deleteType = useMemo(() => {
    return getEventDeleteType(
      eventOptions.findIndex((e) => e.label === value.label),
    );
  }, [value]);

  const toBeDeletedEvents = useMemo(
    () =>
      prepareToBeDeletedEvents({
        events: events.map((e) => e.event),
        deleteType,
        calendarStartDate,
        calendarEndDate,
        timezone,
        useCalendarDateRangeForFuture,
      }),
    [
      events,
      deleteType,
      calendarStartDate,
      calendarEndDate,
      timezone,
      useCalendarDateRangeForFuture,
    ],
  );

  // Sort events within each group by start date for consistent display order
  const sortedEventGroups = useMemo(
    () =>
      eventGroups.map((group) => ({
        ...group,
        events: [...group.events].sort((a, b) =>
          moment(a.startRecur).isBefore(moment(b.startRecur)) ? -1 : 1,
        ),
      })),
    [eventGroups],
  );

  // Filter event groups to get only those that are truly recurring
  // These will be displayed in the "Recurring Events" section
  const recurringEventGroups = useMemo(() => {
    // When deleting only a specific occurrence, don't show recurring events section
    if (deleteType === 'ONLY' || deleteType === 'PARTLY') {
      return [];
    }

    // Filter groups that are actually recurring
    return sortedEventGroups.filter((group) => {
      // Groups with multiple events are always recurring series
      if (group.events.length > 1) {
        return true;
      }

      // Single events can also be recurring if they have a recurrence pattern
      const startDate = moment(group.events[0].startRecur);
      const endDate = moment(group.events[0].endRecur);
      return isDateRangeRecurring(endDate, startDate);
    });
  }, [deleteType, sortedEventGroups]);

  // Create a map for quick lookup of events to be deleted by their group ID
  // This is used to find specific occurrence dates when deleting individual instances
  const toBeDeletedEventsMap = useMemo(
    () =>
      toBeDeletedEvents.items.reduce((acc, item) => {
        acc.set(item.eventGroupId, item);
        return acc;
      }, new Map<string, any>()) as Map<string, any>,
    [toBeDeletedEvents],
  );

  // Helper function to create event with updated dates from toBeDeletedEventsMap
  // This function takes a base event and updates its start/end dates if there's a corresponding
  // event in the toBeDeletedEventsMap (which contains events with specific deletion dates)
  const createEventWithUpdatedDates = useCallback(
    (
      baseEvent: IApiCalendarEventItem, // The original event to potentially update
      eventGroupId: string, // The ID to look up in the toBeDeletedEventsMap
    ): IApiCalendarEventItem => {
      // Look for a specific event instance to be deleted in the map
      const toBeDeletedEvent = toBeDeletedEventsMap.get(eventGroupId);

      // If found, create a new event with updated start/end dates from the deletion map
      if (toBeDeletedEvent) {
        return {
          ...baseEvent,
          startRecur: toBeDeletedEvent.startRecur,
          endRecur: toBeDeletedEvent.endRecur,
        };
      }

      // If no specific deletion event found, return the original event unchanged
      return baseEvent;
    },
    [toBeDeletedEventsMap],
  );

  // Helper function to process single event groups
  // Groups with only one event can be either recurring or non-recurring
  // This function determines which events should be included in the non-recurring events list
  const processSingleEventGroup = useCallback(
    (group: IApiCalendarEventGroupItem): IApiCalendarEventItem[] => {
      const firstEvent = group.events[0];
      const startDate = moment(firstEvent.startRecur);
      const endDate = moment(firstEvent.endRecur);

      // Check if this single event is actually a recurring event based on its date range
      const isRecurring = isDateRangeRecurring(endDate, startDate);

      // If it's not recurring, include it in non-recurring events
      if (!isRecurring) {
        return [firstEvent];
      }

      // If it is recurring but we're only deleting a specific occurrence ('ONLY' or 'PARTLY' mode),
      // include it with updated dates from the deletion map
      if (deleteType === 'ONLY' || deleteType === 'PARTLY') {
        return [createEventWithUpdatedDates(firstEvent, group.eventGroupId)];
      }

      // If it's recurring and we're deleting all occurrences, don't include it
      // (it will be handled by the recurring events section)
      return [];
    },
    [deleteType, createEventWithUpdatedDates],
  );

  // Helper function to process multiple event groups
  // Groups with multiple events are always recurring series
  // This function determines if any should be shown in the non-recurring events section
  const processMultipleEventGroup = useCallback(
    (group: IApiCalendarEventGroupItem): IApiCalendarEventItem[] => {
      // For recurring series, we only show individual events in the non-recurring section
      // when deleting a specific occurrence ('ONLY' or 'PARTLY' mode)
      if (deleteType === 'ONLY' || deleteType === 'PARTLY') {
        // Show the first event from the series with updated dates for the specific occurrence
        return [
          createEventWithUpdatedDates(group.events[0], group.eventGroupId),
        ];
      }

      // For 'ALL' or 'FUTURE' delete types, don't show anything here
      // (the entire series will be handled in the recurring events section)
      return [];
    },
    [deleteType, createEventWithUpdatedDates],
  );

  // Create a list of non-recurring events to display in the "Events" section
  // This includes:
  // 1. Truly non-recurring events (single events with no recurrence pattern)
  // 2. Individual occurrences from recurring series when deleteType is 'ONLY' or 'PARTLY'
  const nonRecurringEvents = useMemo(() => {
    return sortedEventGroups.reduce((acc, group) => {
      // Determine which events to add based on whether the group has single or multiple events
      const eventsToAdd =
        group.events.length === 1
          ? processSingleEventGroup(group) // Handle single event groups
          : processMultipleEventGroup(group); // Handle recurring series

      // Add the determined events to the accumulator
      acc.push(...eventsToAdd);
      return acc;
    }, [] as IApiCalendarEventItem[]);
  }, [sortedEventGroups, processSingleEventGroup, processMultipleEventGroup]);

  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby={`${title} Modal`}
      aria-describedby={`${title} Modal For Scheduler`}
      title={title}
      maxWidth='xl'
      transitionDuration={200}
      data-qa='confirmation-dialog'
      actionbuttons={
        <>
          <CustomButton
            onClick={handleClose}
            variant='outlined'
            data-qa='dialog-cancel'
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={() => handleConfirm(toBeDeletedEvents)}
            color={confirmButtonColor}
            disabled={disabledConfirmButton}
            data-qa='dialog-confirm'
          >
            {confirmButtonText}
          </CustomButton>
        </>
      }
    >
      <Stack rowGap={3.5}>
        <Stack
          flexDirection='column'
          mx='auto'
          width='100%'
          maxHeight='10rem'
          maxWidth='22rem'
          rowGap={2}
          sx={{
            mt: '-1rem',
            px: 3,
            pt: 2.25,
            pb: 3.5,
            borderRadius: '4px',
            border: '1px solid #dedede',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          <CustomInput
            label='To confirm, type "delete" in the box below'
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
          />
          {showSelectInput && (
            <CustomSelect
              isMulti={false}
              options={options}
              value={value}
              onChange={setValue}
            />
          )}
        </Stack>
        <Box
          sx={{
            border: '1px solid #dfdfdf',
            py: 1,
            borderRadius: '4px',
          }}
        >
          <Stack
            rowGap={3}
            sx={{
              maxHeight: 'calc(63vh - 8rem)',
              overflowY: 'auto',
              px: 2,
              py: 1,
              borderRadius: '4px',
            }}
          >
            {nonRecurringEvents.length > 0 && (
              <Box>
                <Box
                  sx={{
                    px: 0,
                    pb: 0.75,
                    borderColor: 'grey.300',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.15rem!important',
                    }}
                  >
                    Events
                  </Typography>
                </Box>
                <EventsTable events={nonRecurringEvents} actionType='ALL' />
              </Box>
            )}
            {recurringEventGroups.length > 0 && (
              <Box>
                <Box
                  sx={{
                    px: 0,
                    pb: 0.75,
                    borderColor: 'grey.300',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.15rem!important',
                    }}
                  >
                    Recurring Events
                  </Typography>
                </Box>
                <Box display='flex' flexDirection='column' rowGap={2}>
                  {recurringEventGroups.map((group, index) => (
                    <RecurringEventsGroup
                      key={group.eventGroupId}
                      group={group}
                      groupIndex={index}
                      toBeDeletedEventsMap={toBeDeletedEventsMap}
                      actionType={deleteType}
                      hideTitle={recurringEventGroups.length === 1}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>
    </CustomModal>
  );
};

export default memo(EventsDeleteConfirmModal);
