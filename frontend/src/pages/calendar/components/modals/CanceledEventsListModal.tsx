import moment from 'moment';
import { MaterialReactTable } from 'material-react-table';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';
import { Stack, Alert, Box } from '@mui/material';
import convertStartEndTimesToDuration from 'utils/convertStartEndTimesToDuration';
import { weekdayOptions } from 'constants/recurrenceOptions';
import type { IApiCalendarEventItem } from 'types/api';
import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';

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

function EventsTable({ events }: { events: IApiCalendarEventItem[] }) {
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );

  const tableColumns = useMemo(
    () => [
      {
        accessorKey: 'usersNames',
        header: 'Users',
        Cell: ({ row }: any) => {
          // row.original.users is an array of objects
          const users = row.original.usersNames || [];
          return (
            <Stack spacing={0.5}>
              {users.map((u: any, i: number) => (
                // flatten each user into a string
                <span key={i}>{u}</span>
              ))}
            </Stack>
          );
        },
        size: 130,
      },
      {
        accessorFn: (row: any) => row,
        id: 'activity',
        header: 'Activity',
        enableSorting: false,
        Cell: (row: any) => {
          const id = row?.row?.original?.activity0Id;
          const resource = storeActivityResources.find(
            (r) => `${r.id}` === `${id}`,
          );
          return <Stack>{resource.name}</Stack>;
        },
        size: 130,
      },
      {
        accessorKey: 'startRecur',
        header: 'Start Date',
        Cell: ({ cell }: any) => {
          const raw = cell.getValue() ?? '';
          return raw ? moment(raw).format('MM-DD-YYYY') : '—';
        },
        size: 130,
      },
      {
        accessorKey: 'endRecur',
        header: 'End Date',
        Cell: ({ cell }: any) => {
          const raw = cell.getValue() ?? '';
          return raw ? moment(raw).format('MM-DD-YYYY') : '—';
        },
        size: 130,
      },
      {
        accessorKey: 'daysOfWeek',
        header: 'Weekdays',
        Cell: ({ cell }: any) => {
          const days = cell.getValue() || [];
          if (!days.length) return '—';
          return (
            <Stack direction='row' spacing={0.5}>
              {formatWeekdays(days).map((d: string, i: number) => (
                <span key={i} style={{ whiteSpace: 'nowrap' }}>
                  {d}
                  {i < days.length - 1 ? ',' : ''}
                </span>
              ))}
            </Stack>
          );
        },
        minSize: 230,
      },
      {
        accessorKey: 'start',
        header: 'Start Time',
        Cell: ({ cell, row }: any) => {
          const raw = cell.getValue() ?? '';
          if (!raw) return '—';
          return row.original.timezone
            ? moment.tz(raw, row.original.timezone).format('hh:mm a')
            : moment(raw).format('hh:mm a');
        },
        size: 120,
      },
      {
        accessorKey: 'end',
        header: 'End Time',
        Cell: ({ cell, row }: any) => {
          const raw = cell.getValue() ?? '';
          if (!raw) return '—';
          return row.original.timezone
            ? moment.tz(raw, row.original.timezone).format('hh:mm a')
            : moment(raw).format('hh:mm a');
        },
        size: 120,
      },
      {
        accessorKey: 'timezone',
        header: 'Timezone',
        Cell: ({ cell }: any) => cell.getValue() || '—',
        size: 100,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        Cell: ({ row }: any) => {
          const { start, end } = row.original;
          return start && end
            ? convertStartEndTimesToDuration(start, end)
            : '—';
        },
        size: 110,
      },
      {
        accessorKey: 'canceled',
        header: 'Cancelled',
        Cell: ({}: any) => {
          return (
            <>
              <Stack
                sx={{
                  textDecoration: 'line-through',
                }}
              >
                No
              </Stack>
              <Stack>Yes</Stack>
            </>
          );
        },
        size: 100,
      },
    ],
    [],
  );

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
      muiTableBodyRowProps={({}) => {
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

export interface ICanceledEventsListModalProps {
  isOpen: boolean;
  toBeChangedEvents: any[];
  handleClose: () => void;
  handleConfirm: (payload: any) => void;
}

export interface ICanceledEventsListModalPropsForRef
  extends Pick<ICanceledEventsListModalProps, 'toBeChangedEvents'> {}

export interface ICanceledEventsListModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: (payload: any) => void;
  toBeChangedEvents: any[];
}

const CanceledEventsListModal = ({
  isOpen,
  handleClose,
  handleConfirm,
  toBeChangedEvents,
}: ICanceledEventsListModalProps) => {
  return (
    <CustomModal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='cancel-affected-events-modal-title'
      aria-describedby='cancel-affected-events-modal-description'
      title='Cancel Affected Events'
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
          <Alert severity='warning'>
            All below listed events will be affected by change
          </Alert>
        </Box>

        <EventsTable events={toBeChangedEvents} />
      </>
    </CustomModal>
  );
};

export default CanceledEventsListModal;
