import moment from 'moment';
import { useMemo, memo } from 'react';
import { Typography, Box } from '@mui/material';
import EventsTable from './EventsTable';
import type {
  IApiCalendarEventGroupItem,
  TApiEventDeleteType,
} from 'types/api';

const RecurringEventsGroup = ({
  group,
  groupIndex,
  toBeDeletedEventsMap,
  actionType,
  hideTitle = false,
}: {
  group: IApiCalendarEventGroupItem;
  groupIndex: number;
  toBeDeletedEventsMap: Map<string, any>;
  actionType: TApiEventDeleteType;
  hideTitle: boolean;
}) => {
  const toBeDeletedEvent = useMemo(() => {
    if (!toBeDeletedEventsMap.has(group.eventGroupId)) {
      return null;
    }
    return toBeDeletedEventsMap.get(group.eventGroupId);
  }, [group, toBeDeletedEventsMap]);

  /**
   * Process events based on deletion action type.
   * For 'FUTURE' actions, splits recurring events that span across the deletion point.
   *
   * @returns {Array} Processed events array
   */
  const events = useMemo(() => {
    // For non-future deletions, return original events unchanged
    if (actionType !== 'FUTURE') {
      return group.events;
    }

    // If no event is being deleted, return original events
    if (!toBeDeletedEvent) {
      return group.events;
    }

    // Cache the deletion start time to avoid repeated moment creation
    const toBeDeletedStartRecur = moment(toBeDeletedEvent.startRecur);

    // Transform events: split those that span the deletion point
    return group.events.flatMap((event) => {
      const startRecur = moment(event.startRecur);
      const endRecur = moment(event.endRecur);

      // Check if current event spans across the deletion point
      // This means the event starts before deletion and ends after deletion
      if (
        startRecur.isBefore(toBeDeletedStartRecur) &&
        endRecur.isAfter(toBeDeletedStartRecur)
      ) {
        // Split the event into two parts:
        // 1. Part before deletion (original start → deletion start)
        // 2. Part after deletion (deletion start → deletion end)
        return [
          {
            ...event,
            endRecur: toBeDeletedEvent.startRecur, // End at deletion point
          },
          {
            ...event,
            startRecur: toBeDeletedEvent.startRecur, // Start at deletion point
            endRecur: toBeDeletedEvent.endRecur, // End at deletion end
          },
        ];
      }

      // Event doesn't span deletion point, return unchanged
      return event;
    });
  }, [group.events, actionType, toBeDeletedEvent]);

  return (
    <Box>
      {!hideTitle && (
        <Typography
          sx={{
            fontSize: '0.875rem!important',
            pb: '0.15rem',
            px: '1px',
          }}
        >
          Group: #{groupIndex + 1}
        </Typography>
      )}
      <EventsTable
        events={events}
        toBeDeletedEvent={toBeDeletedEvent}
        actionType={actionType}
      />
    </Box>
  );
};

export default memo(RecurringEventsGroup);
