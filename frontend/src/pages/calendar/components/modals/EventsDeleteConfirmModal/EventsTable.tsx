import { memo } from 'react';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { Stack, Box } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import convertStartEndTimesToDuration from 'utils/convertStartEndTimesToDuration';
import { weekdayOptions } from 'constants/recurrenceOptions';
import { handleEvent } from '../../../utils/formatters';
import type { IApiCalendarEventItem, TApiEventDeleteType } from 'types/api';

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

const EventsTable = ({
  events,
  toBeDeletedEvent,
  actionType,
}: {
  events: IApiCalendarEventItem[];
  toBeDeletedEvent?:
    | (ReturnType<typeof handleEvent>['data'] & { usersNames: string[] })
    | null;
  actionType: TApiEventDeleteType;
}) => {
  const newStartRecur = toBeDeletedEvent?.startRecur
    ? moment(toBeDeletedEvent?.startRecur)
    : null;

  const tableColumns = [
    {
      accessorFn: (row: any) => row,
      id: 'users',
      header: 'Users',
      enableSorting: false,
      Cell: (row: any) => {
        const users: {
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
                key={user.fullName}
                sx={{
                  paddingX: '0.25rem',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.fullName} {index < users.length - 1 ? ',' : ''}
              </Box>
            ))}
          </Stack>
        );
      },
      size: 180,
    },
    {
      accessorFn: (row: any) => row,
      id: 'activity',
      header: 'Activity',
      enableSorting: false,
      Cell: (row: any) => {
        const firstName = row.row.original?.activity0?.firstName;
        return <Stack>{firstName}</Stack>;
      },
      size: 130,
    },
    {
      accessorFn: (row: any) => row,
      id: 'startRecur',
      header: 'Start Date',
      enableSorting: false,
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
      enableSorting: false,
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
            <Stack direction='row' spacing='5px'>
              {filteredDaysArray.map((day: any, index) => (
                <span
                  key={day}
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day} {index < filteredDaysArray.length - 1 ? ',' : ''}
                </span>
              ))}
            </Stack>
          );
        }
        return <Stack></Stack>;
      },
      minSize: 190,
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

        return <Stack>{formattedStartTime}</Stack>;
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

        return <Stack>{formattedEndTime}</Stack>;
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
        return <Stack>{timezone}</Stack>;
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

        return <Stack>{duration}</Stack>;
      },
      size: 110,
    },
    {
      id: 'isCancelled',
      header: 'Cancelled',
      enableSorting: false,
      Cell: (row: any) => {
        const cancelled = row.row?.original?.isCancelled;
        return <Stack>{cancelled ? 'Yes' : 'No'}</Stack>;
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
        density: 'compact',
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
            fontSize: '0.75rem',
          },
          '& th[data-pinned]:before': {
            display: 'none',
          },
        }),
      }}
      muiTableBodyRowProps={({ row }) => {
        const shouldMarkAsDeleted = (() => {
          if (actionType === 'ALL') {
            return true;
          }

          const startRecur = moment(row.original?.startRecur);
          if (actionType === 'FUTURE' && newStartRecur) {
            return startRecur.isSameOrAfter(newStartRecur);
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
              fontSize: '0.75rem',
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
          borderRadius: '3px',
          border: '1px solid #ced4da',
        },
      }}
    />
  );
};

export default memo(EventsTable);
