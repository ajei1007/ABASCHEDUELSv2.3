import { useMemo } from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { MaterialReactTable } from 'material-react-table';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';
import { Stack, Typography, Alert, Box } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import convertStartEndTimesToDuration from 'utils/convertStartEndTimesToDuration';
import { handleEvent } from '../../utils/formatters';
import { weekdayOptions } from 'constants/recurrenceOptions';
import { useAppSelector } from 'store/hooks';
import type {
  IApiCalendarEventItem,
  IApiCalendarEventGroupItem,
  TApiEventUpdateType,
  TApiEventDeleteType,
  TApiEventUpdateLevel,
} from 'types/api';

const formatWeekdays = (weekdays: string[]) => {
  const weekdaysMap = weekdays.reduce((acc, day) => {
    acc.set(day, true);
    return acc;
  }, new Map<string, boolean>());

  return weekdayOptions.reduce((acc, option) => {
    if (weekdaysMap.has(option.value)) {
      acc.push(option.label.slice(0, 3));
    }
    return acc;
  }, [] as string[]);
};

function EventsTableUsersCell({
  users,
}: {
  users: { fullName: string; status?: 'new' | 'deleted' }[];
}) {
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: '0.5rem',
        rowGap: '0.25rem',
      }}
    >
      {users.map((user, index) => (
        <Box
          component='span'
          sx={{
            paddingX: '0.25rem',
            backgroundColor:
              user.status === 'new'
                ? '#00ff0040'
                : user.status === 'deleted'
                  ? '#ff000030'
                  : undefined,
            textDecoration:
              user.status === 'deleted' ? 'line-through' : undefined,
            borderRadius: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          {user.fullName} {index < users.length - 1 ? ',' : ''}
        </Box>
      ))}
    </Stack>
  );
}

function EventsTable({
  events,
  changingEvent,
  action,
  actionType,
}: {
  events: IApiCalendarEventItem[];
  changingEvent?:
    | (ReturnType<typeof handleEvent>['data'] & { usersNames: string[] })
    | null;
  action: 'UPDATE' | 'DELETE';
  actionType: TApiEventUpdateType | TApiEventDeleteType;
}) {
  const newStartRecur = changingEvent?.startRecur
    ? moment(changingEvent?.startRecur)
    : null;

  const tableColumns = [
    {
      accessorFn: (row: any) => row,
      id: 'users',
      header: 'Users',
      enableSorting: false,
      Cell: (row: any) => {
        const oldUsers: {
          fullName: string;
        }[] = (row.row.original?.users || []).reduce(
          (acc: any[], item: any) => {
            if (item.lastName) {
              acc.push({
                fullName: `${item.firstName} ${item.lastName}`.trim(),
              });
            }
            return acc;
          },
          [] as any[],
        );

        if (action === 'DELETE') {
          return <EventsTableUsersCell users={oldUsers} />;
        }

        const newUsers = (changingEvent?.usersNames || []).map((item) => ({
          fullName: `${item}`.trim(),
        }));

        const users: {
          fullName: string;
          status?: 'new' | 'deleted';
        }[] = [];

        const shouldPutStatus = (() => {
          if (actionType === 'ALL') {
            return true;
          }

          const startRecur = moment(row.row.original?.startRecur);
          if (actionType === 'FUTURE' && newStartRecur) {
            return startRecur.isSameOrAfter(newStartRecur);
          }

          return false;
        })();

        for (const user of oldUsers) {
          const status =
            !newUsers.find((item) => item.fullName === user.fullName) &&
            shouldPutStatus
              ? 'deleted'
              : undefined;
          users.push({
            ...user,
            status,
          });
        }

        for (const user of newUsers) {
          const status =
            !oldUsers.find((item) => item.fullName === user.fullName) &&
            shouldPutStatus
              ? 'new'
              : undefined;

          if (status) {
            users.push({
              ...user,
              status,
            });
          }
        }

        return <EventsTableUsersCell users={users} />;
      },
      size: 210,
    },
    {
      accessorFn: (row: any) => row,
      id: 'activity',
      header: 'Activity',
      enableSorting: false,
      Cell: (row: any) => {
        const firstName = row.row.original?.activity0?.firstName;
        const activity0Id = row.row.original?.activity0Id;
        const newActivity0Id = changingEvent?.activity0Id;
        const newFirstName =
          ((changingEvent?.users || []) as any[])?.find(
            (item) => item.value === newActivity0Id && item.type === 'Activity',
          )?.label || null;

        const shouldCrossOver = (() => {
          if (action === 'UPDATE' && activity0Id !== newActivity0Id) {
            if (actionType === 'ALL') {
              return true;
            }

            const startRecur = moment(row.row.original?.startRecur);
            if (actionType === 'FUTURE' && newStartRecur) {
              return startRecur.isSameOrAfter(newStartRecur);
            }
          }
          return false;
        })();

        return (
          <>
            <Stack
              sx={{
                textDecoration: shouldCrossOver ? 'line-through' : '',
              }}
            >
              {firstName}
            </Stack>
            {shouldCrossOver && newFirstName ? (
              <Stack>{newFirstName}</Stack>
            ) : null}
          </>
        );
      },
      size: 130,
    },
    {
      accessorFn: (row: any) => row,
      id: 'startRecur',
      header: 'Start Date',
      Cell: (row: any) => {
        const date = row.row.original?.startRecur;
        const dateMoment = moment(date);
        return dateMoment.format('MM-DD-YYYY');
      },
      size: 130,
    },
    {
      accessorFn: (row: any) => row,
      id: 'endRecur',
      header: 'End Date',
      Cell: (row: any) => {
        const date = row.row.original?.endRecur;
        const dateMoment = moment(date);
        return dateMoment.format('MM-DD-YYYY');
      },
      size: 130,
    },
    {
      accessorFn: (row: any) => row,
      id: 'days',
      header: 'Weekdays',
      enableSorting: false,
      Cell: (row: any) => {
        const filteredDaysArray = formatWeekdays(row.row.original.daysOfWeek);
        if (filteredDaysArray) {
          return (
            <>
              <Stack direction='row' spacing='5px'>
                {filteredDaysArray.map((day: any, index) => (
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {day} {index < filteredDaysArray.length - 1 ? ',' : ''}
                  </span>
                ))}
              </Stack>
            </>
          );
        }
      },
      minSize: 230,
    },
    {
      accessorFn: (row: any) => moment(row.start).format('hh:mm a'),
      id: 'start',
      header: 'Start Time',
      enableSorting: false,
      Cell: (row: any) => {
        const startTime = row.row.original?.start;
        if (!startTime) {
          return;
        }

        const timezone = row.row.original?.timezone;
        let formattedStartTime = moment(startTime).format('hh:mm a');
        if (timezone) {
          formattedStartTime = momentTimezone
            .tz(startTime, timezone)
            .format('hh:mm a');
        }

        const newStartTime = changingEvent?.start;
        const newTimezone = changingEvent?.timezone;
        let formattedNewStartTime = newStartTime
          ? moment(newStartTime).format('hh:mm a')
          : null;
        if (newStartTime && newTimezone) {
          formattedNewStartTime = momentTimezone
            .tz(newStartTime, newTimezone)
            .format('hh:mm a');
        }

        const shouldCrossOver = (() => {
          if (
            action === 'UPDATE' &&
            formattedStartTime !== formattedNewStartTime
          ) {
            if (actionType === 'ALL') {
              return true;
            }

            const startRecur = moment(row.row.original?.startRecur);
            if (actionType === 'FUTURE' && newStartRecur) {
              return startRecur.isSameOrAfter(newStartRecur);
            }
          }
          return false;
        })();

        return (
          <>
            <Stack
              sx={{
                textDecoration: shouldCrossOver ? 'line-through' : '',
              }}
            >
              {formattedStartTime}
            </Stack>
            {shouldCrossOver && formattedNewStartTime ? (
              <Stack>{formattedNewStartTime}</Stack>
            ) : null}
          </>
        );
      },
      size: 120,
    },
    {
      accessorFn: (row: any) => moment(row.end).format('hh:mm a'),
      id: 'end',
      header: 'End Time',
      enableSorting: false,
      Cell: (row: any) => {
        const endTime = row.row.original?.end;
        if (!endTime) {
          return;
        }

        const timezone = row.row.original?.timezone;
        let formattedEndTime = moment(endTime).format('hh:mm a');
        if (timezone) {
          formattedEndTime = momentTimezone
            .tz(endTime, timezone)
            .format('hh:mm a');
        }

        const newEndTime = changingEvent?.end;
        const newTimezone = changingEvent?.timezone;
        let formattedNewEndTime = newEndTime
          ? moment(newEndTime).format('hh:mm a')
          : null;
        if (newEndTime && newTimezone) {
          formattedNewEndTime = momentTimezone
            .tz(newEndTime, newTimezone)
            .format('hh:mm a');
        }

        const shouldCrossOver = (() => {
          if (action === 'UPDATE' && formattedEndTime !== formattedNewEndTime) {
            if (actionType === 'ALL') {
              return true;
            }

            const startRecur = moment(row.row.original?.startRecur);
            if (actionType === 'FUTURE' && newStartRecur) {
              return startRecur.isSameOrAfter(newStartRecur);
            }
          }
          return false;
        })();

        return (
          <>
            <Stack
              sx={{
                textDecoration: shouldCrossOver ? 'line-through' : '',
              }}
            >
              {formattedEndTime}
            </Stack>
            {shouldCrossOver && formattedNewEndTime ? (
              <Stack>{formattedNewEndTime}</Stack>
            ) : null}
          </>
        );
      },
      size: 120,
    },
    {
      accessorFn: (row: any) => row.timezone,
      id: 'timezone',
      header: 'Timezone',
      enableSorting: false,
      Cell: (row: any) => {
        const timezone = row.row?.original?.timezone;
        const newTimezone = changingEvent?.timezone;

        const shouldCrossOver = (() => {
          if (action === 'UPDATE' && timezone !== newTimezone) {
            if (actionType === 'ALL') {
              return true;
            }

            const startRecur = moment(row.row.original?.startRecur);
            if (actionType === 'FUTURE' && newStartRecur) {
              return startRecur.isSameOrAfter(newStartRecur);
            }
          }
          return false;
        })();

        return (
          <>
            <Stack
              sx={{
                textDecoration: shouldCrossOver ? 'line-through' : '',
              }}
            >
              {timezone}
            </Stack>
            {shouldCrossOver && newTimezone ? (
              <Stack>{newTimezone}</Stack>
            ) : null}
          </>
        );
      },
    },
    {
      id: 'duration',
      header: 'Duration',
      enableSorting: false,
      Cell: (row: any) => {
        const duration = convertStartEndTimesToDuration(
          row.row.original?.start,
          row.row.original?.end,
        );
        const newDuration =
          changingEvent?.start && changingEvent?.end
            ? convertStartEndTimesToDuration(
                changingEvent?.start,
                changingEvent?.end,
              )
            : null;

        const shouldCrossOver = (() => {
          if (action === 'UPDATE' && duration !== newDuration) {
            if (actionType === 'ALL') {
              return true;
            }

            const startRecur = moment(row.row.original?.startRecur);
            if (actionType === 'FUTURE' && newStartRecur) {
              return startRecur.isSameOrAfter(newStartRecur);
            }
          }
          return false;
        })();

        return (
          <>
            <Stack
              sx={{
                textDecoration: shouldCrossOver ? 'line-through' : '',
              }}
            >
              {duration}
            </Stack>
            {shouldCrossOver && newDuration ? (
              <Stack>{newDuration}</Stack>
            ) : null}
          </>
        );
      },
      size: 110,
    },
    {
      id: 'isCancelled',
      header: 'Cancelled',
      enableSorting: false,
      Cell: (row: any) => {
        const cancelled = row.row?.original?.isCancelled;
        const newCancelled = changingEvent?.isCancelled;

        const shouldCrossOver = (() => {
          if (action === 'UPDATE' && cancelled !== newCancelled) {
            if (actionType === 'ALL') {
              return true;
            }

            const startRecur = moment(row.row.original?.startRecur);
            if (actionType === 'FUTURE' && newStartRecur) {
              return startRecur.isSameOrAfter(newStartRecur);
            }
          }
          return false;
        })();

        return (
          <>
            <Stack
              sx={{
                textDecoration: shouldCrossOver ? 'line-through' : '',
              }}
            >
              {cancelled ? 'Yes' : 'No'}
            </Stack>
            {shouldCrossOver && typeof newCancelled === 'boolean' ? (
              <Stack>{newCancelled ? 'Yes' : 'No'}</Stack>
            ) : null}
          </>
        );
      },
      size: 100,
    },
  ];

  return (
    <MaterialReactTable
      columns={tableColumns}
      data={events}
      manualPagination
      enablePagination={false}
      rowCount={events.length}
      enableColumnActions={false}
      enableColumnFilters={false}
      enableHiding={false}
      manualSorting
      enableColumnPinning={false}
      initialState={{
        columnPinning: {
          left: ['mrt-row-expand', 'id', 'name', 'firstName', 'lastName'],
        },
      }}
      enableTopToolbar={false}
      enableBottomToolbar={false}
      // Props
      muiTableProps={{ sx: { tableLayout: 'fixed' } }}
      muiTableHeadRowProps={{ sx: { boxShadow: 'none' } }}
      muiSkeletonProps={{ sx: { minHeight: '30px' } }}
      muiTableHeadProps={{
        sx: () => ({
          '& th': {
            border: 'none',
            boxShadow: 'none',

            color: '#16365f',
            fontWeight: '600',
            fontSize: '0.875rem',
          },
          '& th[data-pinned]:before': {
            display: 'none',
          },
        }),
      }}
      muiTableBodyRowProps={({ row }) => {
        const shouldMarkAsDeleted = (() => {
          if (action === 'DELETE') {
            if (actionType === 'ALL') {
              return true;
            }

            const startRecur = moment(row.original?.startRecur);
            if (actionType === 'FUTURE' && newStartRecur) {
              return startRecur.isSameOrAfter(newStartRecur);
            }
          }

          return false;
        })();

        return {
          sx: {
            transition: 'none',
            '& td': {
              border: 'none',
              color: '#16365f',
              boxShadow: 'none !important',
              backgroundColor: '#ffffff !important',
            },
            '&:nth-of-type(odd)': {
              backgroundColor: '#F7F8FB !important',
              boxShadow: 'none',
              '& td': {
                backgroundColor: '#F7F8FB !important',
                boxShadow: 'none',
              },
            },
            '&.deleted': {
              backgroundColor: '#F7F8FB !important',
              '& td': {
                backgroundColor: '#ff000030 !important',
                boxShadow: 'none !important',
                textDecoration: 'line-through',
                textDecorationColor: '#ff000099',
              },
            },
            '& td[data-pinned]:before': {
              display: 'none',
            },
          },
          className: shouldMarkAsDeleted ? 'deleted' : undefined,
        };
      }}
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '0',
          border: '1px solid #ced4da',
        },
      }}
    />
  );
}

function ChangeAffectedEventGroup({
  group,
  groupIndex,
  changingEventsMap,
  action,
  actionType,
  updateLevel,
  showTitle,
}: {
  group: IApiCalendarEventGroupItem;
  groupIndex: number;
  changingEventsMap: Map<string, any>;
  action: 'UPDATE' | 'DELETE';
  actionType: TApiEventUpdateType | TApiEventDeleteType;
  updateLevel?: TApiEventUpdateLevel;
  showTitle: boolean;
}) {
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const storeSettingsValuesTimezone = useAppSelector(
    (state) => state.settings.settingValues?.timezone,
  );

  const changingEvent = (() => {
    if (!changingEventsMap.has(group.eventGroupId)) {
      return null;
    }
    const notFormattedEvent = changingEventsMap.get(group.eventGroupId);
    const event = handleEvent({
      event: notFormattedEvent,
      activityResources: storeActivityResources,
      locationResources: storeLocationResources,
      fallbackTimezone: storeSettingsValuesTimezone as any,
    }).data;

    const activity0FirstName =
      ((notFormattedEvent?.users || []) as any[])?.find(
        (item) => item.value === event?.activity0Id && item.type === 'Activity',
      )?.label || null;

    return {
      ...event,
      usersNames: notFormattedEvent?.usersNames || [],
      activity0: {
        firstName: activity0FirstName,
      },
    };
  })();

  /**
   * Process events based on action type.
   * For 'FUTURE' actions, splits recurring events that span across the changing event's start point.
   *
   * @returns {Array} Processed events array
   */
  const events = useMemo(() => {
    // For non-future actions, return original events unchanged
    if (actionType !== 'FUTURE') {
      return group.events;
    }

    // If no changing event is provided, return original events
    if (!changingEvent) {
      return group.events;
    }

    // Cache the changing event start time to avoid repeated moment creation
    const changingEventStartRecur = moment(changingEvent.startRecur);

    // Transform events: split those that span the changing event's start point
    return group.events.flatMap((event) => {
      const startRecur = moment(event.startRecur);
      const endRecur = moment(event.endRecur);

      // Check if current event spans across the changing event's start point
      // This means the event starts before the changing event and ends after it
      if (
        startRecur.isBefore(changingEventStartRecur) &&
        endRecur.isAfter(changingEventStartRecur)
      ) {
        // Split the event into two parts:
        // 1. Part before the changing event (original start → changing event start)
        // 2. Part after the changing event (changing event start → changing event end)
        return [
          {
            ...event,
            endRecur: changingEvent.startRecur, // End at changing event start point
          },
          {
            ...event,
            startRecur: changingEvent.startRecur, // Start at changing event start point
            endRecur: changingEvent.endRecur, // End at changing event end point
          },
        ];
      }

      // Event doesn't span the changing event's start point, return unchanged
      return event;
    });
  }, [group.events, actionType, changingEvent]);

  return (
    <Box sx={{ mb: 4 }} key={group.eventGroupId}>
      {showTitle ? (
        <Box sx={{ px: 0, pb: 1, borderBottom: 1, borderColor: 'grey.300' }}>
          <Typography variant='h5' component='h5'>
            Recurring Event: #{groupIndex + 1}
          </Typography>
        </Box>
      ) : null}
      {updateLevel === 'RRULE' ? (
        <>
          <EventsTable
            events={events}
            changingEvent={changingEvent}
            action={'DELETE'}
            actionType={'ALL'}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: '1rem',
              py: '0.5rem',
            }}
          >
            <ArrowDownwardIcon fontSize='large' htmlColor='#787878' />
          </Box>
          <EventsTable
            events={
              [
                {
                  ...changingEvent,
                  users: (changingEvent?.usersNames || []).map(
                    (item: string) => ({
                      firstName: item,
                      lastName: ' ',
                    }),
                  ),
                },
              ] as any[]
            }
            changingEvent={changingEvent}
            action={'UPDATE'}
            actionType={'ONLY'}
          />
        </>
      ) : (
        <EventsTable
          events={events}
          changingEvent={changingEvent}
          action={action}
          actionType={actionType}
        />
      )}
    </Box>
  );
}

export interface IChangeAffectedEventGroupsConfirmModalProps {
  isOpen: boolean;
  eventGroups: IApiCalendarEventGroupItem[];
  action: 'UPDATE' | 'DELETE';
  actionType: TApiEventUpdateType | TApiEventDeleteType;
  toBeChangedEvents: any[];
  updateLevel?: TApiEventUpdateLevel;
  handleClose: () => void;
  handleConfirm: (payload: any) => void;
}

export interface IChangeAffectedEventGroupsConfirmModalPropsForRef
  extends Pick<
    IChangeAffectedEventGroupsConfirmModalProps,
    | 'eventGroups'
    | 'action'
    | 'actionType'
    | 'toBeChangedEvents'
    | 'updateLevel'
  > {}

const ChangeAffectedEventGroupsConfirmModal = ({
  isOpen,
  eventGroups,
  action,
  actionType,
  toBeChangedEvents,
  updateLevel,
  handleClose,
  handleConfirm,
}: IChangeAffectedEventGroupsConfirmModalProps) => {
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

  const changingEventsMap = useMemo(
    () =>
      toBeChangedEvents.reduce((acc, event) => {
        acc.set(event.eventGroupId, event);
        return acc;
      }, new Map<string, any>()) as Map<string, any>,
    [toBeChangedEvents],
  );

  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='Change Affected Event Groups Confirm Modal'
      aria-describedby='Change Affected Event Groups Confirm Modal For Scheduler'
      title='Change Affected Recurring Events'
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
          <CustomButton onClick={handleConfirm} data-qa='dialog-confirm'>
            Confirm
          </CustomButton>
        </>
      }
    >
      <>
        <Box sx={{ mb: 3 }}>
          <Alert severity='error'>
            All below listed events will be affected by change
          </Alert>
        </Box>

        {sortedEventGroups.map((group, index) => (
          <ChangeAffectedEventGroup
            group={group}
            groupIndex={index}
            changingEventsMap={changingEventsMap}
            action={action}
            actionType={actionType}
            updateLevel={updateLevel}
            showTitle={sortedEventGroups.length > 1}
          />
        ))}
      </>
    </CustomModal>
  );
};

export default ChangeAffectedEventGroupsConfirmModal;
