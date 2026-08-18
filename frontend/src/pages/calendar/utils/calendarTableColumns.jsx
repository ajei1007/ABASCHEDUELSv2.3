import { Chip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import moment from 'moment';
import convertStartEndTimesToDuration from 'utils/convertStartEndTimesToDuration';
import CONSTRAINT_TYPES_WITH_ICONS from './constraintTypesWithIcons';

export const optimizerResultsColumns = [
  {
    accessorFn: (row) => row.type,
    id: 'type',
    header: 'Type',
    Cell: (row) => {
      const type = row.row.original?.type;
      if (type) {
        // const typeColor = type === 'delete' ? '#ff4b23' : '#43bc13';
        // const typeLabel = type === 'delete' ? 'Replacing' : 'Creating';
        let typeColor = '#ff4b23';
        let typeLabel = 'Replacing';
        if (type === 'create') {
          typeColor = '#43bc13';
          typeLabel = 'Creating';
        } else if (type === 'update') {
          typeColor = '#1616FF';
          typeLabel = 'Updating';
        }
        return <p style={{ color: typeColor }}>{typeLabel}</p>;
      }
      return;
    },
    size: 80,
  },
  {
    id: 'date',
    header: 'Date',
    Cell: (row) => {
      const startRecur = row.row.original?.startRecur;
      const date = moment(startRecur).format('MM-DD-YYYY');
      return (
        <Typography fontSize='0.875rem' fontWeight='600'>
          {date}
        </Typography>
      );
    },
    size: 100,
  },
  {
    accessorKey: 'activity',
    header: 'Activity',
  },
  {
    accessorKey: 'employee',
    header: 'Employees',
  },
  {
    accessorKey: 'client',
    header: 'Clients',
  },
  {
    id: 'start',
    header: 'Start',
    Cell: (row) => {
      const start = moment(row.row.original?.start).format('HH:mm A');
      return start;
    },
    size: 80,
  },
  {
    id: 'end',
    header: 'End',
    Cell: (row) => {
      const end = moment(row.row.original?.end).format('HH:mm A');
      return end;
    },
    size: 80,
  },
  {
    id: 'duration',
    header: 'Duration',
    Cell: (row) => {
      const start = row.row.original?.start;
      const end = row.row.original?.end;
      const duration = convertStartEndTimesToDuration(start, end);
      return duration;
    },
    size: 100,
  },
];

export const overbookingColumns = [
  {
    accessorKey: 'activity',
    header: 'Activity',
  },
  {
    accessorKey: 'employee',
    header: 'Employees',
  },
  {
    accessorKey: 'client',
    header: 'Clients',
  },
  {
    accessorKey: 'intersection',
    header: 'User Conflicts',
  },
  {
    accessorKey: 'time',
    header: 'Time Conflict',
  },
  {
    accessorKey: 'start',
    header: 'Start',
  },
  {
    accessorKey: 'end',
    header: 'End',
  },
];

export const orangeSolutionsTableColumns = [
  {
    accessorKey: 'conflict',
    header: 'Conflict',
  },
];

export const flaggingTableGapColumns = [
  {
    accessorKey: 'user',
    header: 'User',
    Cell: (row) => {
      const user = row?.row.original?.user;
      return `${user?.firstName} ${user?.lastName ?? ''}`;
    },
  },
  {
    accessorFn: (row) => row.event?.startTime,
    id: 'start',
    header: 'Start',
    enableSorting: false,
    Cell: (row) => {
      const startTime = row.row.original?.startTime;
      if (startTime) {
        return startTime;
      }
      return;
    },
  },
  {
    accessorFn: (row) => row.event?.endTime,
    id: 'end',
    header: 'End',
    enableSorting: false,
    Cell: (row) => {
      const endTime = row.row.original?.endTime;
      if (endTime) {
        return endTime;
      }
      return;
    },
  },
];
export const flaggingTableColumns = [
  {
    accessorKey: 'broken',
    header: 'Status',
    Cell: (row) => {
      const brokenConstraint = row.row?.original?.broken;
      if (brokenConstraint) {
        return <Chip label='Broken' color='error' sx={{ color: '#fff' }} />;
      }
      return <Chip label='Non Broken' variant='outlined' />;
    },
    size: 140,
  },
  {
    accessorKey: 'userId',
    header: 'User',
    Cell: (row) => {
      const user = row?.row.original?.user;
      return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`;
    },
  },
  {
    accessorKey: 'constraintType',
    header: 'Constraint Type',
    Cell: (row) => {
      const constraintType = row?.row.original?.constraintType;
      const constraintTypeObj = CONSTRAINT_TYPES_WITH_ICONS.find(
        (type) => type.value === constraintType,
      );
      return (
        <Chip
          icon={constraintTypeObj?.icon}
          label={constraintTypeObj?.label}
          variant='outlined'
        />
      );
    },
    size: 200,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    Cell: (row) => {
      const description = row?.row.original?.description;
      return <div dangerouslySetInnerHTML={{ __html: description }} />;
    },
    size: 450,
  },
  {
    accessorKey: 'actual',
    header: 'Actual',
    Cell: (row) => {
      const rowData = row?.row.original;
      if (rowData.consequenceTypeEachOrAll === 'each') {
        const consequenceUsers = rowData?.each?.consequenceUsers;
        if (consequenceUsers) {
          return consequenceUsers.map((user) => (
            <Typography fontSize={'0.875rem'}>
              {user?.firstName} {user?.lastName ?? ''}:{' '}
              <strong>{user?.actual}</strong>
            </Typography>
          ));
        }
        return '';
      }
      const actual = rowData.all?.actual;
      return actual ?? '';
    },
    size: 200,
  },
  {
    accessorKey: 'min',
    header: 'Min',
    Cell: (row) => {
      const min = row?.row.original?.min;
      let unit = row?.row.original?.unit;
      if (unit) {
        if (min <= 1) {
          unit = unit.replace('s', '');
        }
        return `${min} ${unit}`;
      }
      return '';
    },
    size: 100,
  },
  {
    accessorKey: 'max',
    header: 'Max',
    Cell: (row) => {
      const max = row?.row.original?.max;
      let unit = row?.row.original?.unit;
      if (unit) {
        if (max <= 1) {
          unit = unit.replace('s', '');
        }
        return `${max} ${unit}`;
      }
      return '';
    },
    size: 100,
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
  },
  {
    accessorKey: 'antecedentTeams',
    header: 'Antecedent Teams',
    Cell: (row) => {
      const antecedentUserSubgroups =
        row?.row.original?.antecedentUserSubgroups;
      if (antecedentUserSubgroups?.length) {
        return (
          <Stack direction='row' gap='5px' flexWrap='wrap'>
            {antecedentUserSubgroups.map((s) => (
              <Chip label={s.name} variant='outlined' />
            ))}
          </Stack>
        );
      }
      return '';
    },
  },
  {
    accessorKey: 'consequenceTeams',
    header: 'Consequence Teams',
    Cell: (row) => {
      const brokenSessions = row?.row.original?.brokenSessions;
      if (brokenSessions?.length) {
        let consequenceUserSubgroups = [];
        brokenSessions.forEach((session) => {
          const breakingUsers = session.breakingUsers;
          if (breakingUsers?.length) {
            breakingUsers.forEach((user) => {
              const subgroups = user.subgroups;
              if (subgroups?.length) {
                subgroups.forEach((subgroup) => {
                  consequenceUserSubgroups = [
                    ...consequenceUserSubgroups,
                    subgroup,
                  ];
                });
              }
            });
          }
        });
        if (consequenceUserSubgroups.length) {
          return (
            <Stack direction='row' gap='5px' flexWrap='wrap'>
              {consequenceUserSubgroups.map((s) => (
                <Chip label={s.name} variant='outlined' />
              ))}
            </Stack>
          );
        }
      }
      return '';
    },
  },
];
export const eventFlaggingTableOverbookingColumns = [
  {
    accessorFn: (row) => row.user,
    id: 'user',
    header: 'User',
    Cell: (row) => {
      const user = row?.row.original?.user;
      return `${user?.firstName} ${user?.lastName ?? ''}`;
    },
    size: 80,
  },
  {
    accessorFn: (row) => row.conflict,
    id: 'startTime',
    header: 'Start',
    Cell: (row) => {
      return row.row.original?.conflict.startTime;
    },
    size: 80,
  },
  {
    accessorFn: (row) => row.conflict,
    id: 'endTime',
    header: 'End',
    Cell: (row) => {
      return row.row.original?.conflict.endTime;
    },
    size: 80,
  },
  {
    id: 'date',
    header: 'Date',
    Cell: (row) => {
      const date = moment(row.row.original?.date).format('YYYY-MM-DD');
      return date;
    },
    size: 80,
  },
];

const formatWeekdays = (data) => {
  const weekdayMappings = {
    F: 'Friday',
    M: 'Monday',
    R: 'Thursday',
    S: 'Saturday',
    T: 'Tuesday',
    U: 'Sunday',
    W: 'Wednesday',
  };
  const selectedWeekdays = [];
  Object.keys(data).forEach((code) => {
    if (data[code]) {
      selectedWeekdays.push(weekdayMappings[code]);
    }
  });
  const filteredDays = selectedWeekdays.filter((item) => item !== undefined);
  return filteredDays.map((item) => item.slice(0, 3));
};

/* Approvals Modal */
export const requestCancellationsTableColumns = [
  {
    accessorFn: (row) => row.requestedBy,
    id: 'requestedBy',
    header: 'Requested By',
    enableSorting: false,
    Cell: (row) => {
      const user = row.row.original?.user;
      if (user) {
        const title = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`;
        return title;
      }
      return;
    },
    enableEditing: false,
  },
  {
    accessorFn: (row) => row.updatedBy,
    id: 'updatedBy',
    header: 'Updated By',
    enableSorting: false,
    Cell: (row) => {
      const user = row.row.original?.updatedBy;
      if (user) {
        const title = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`;
        return title;
      }
      return;
    },
    enableEditing: false,
  },
  {
    accessorFn: (row) => row.reason?.name,
    id: 'reason',
    header: 'Reason',
    enableSorting: false,
    Cell: (row) => {
      const name = row.row.original?.reason?.name;
      if (name) {
        return name;
      }
      return;
    },
    enableEditing: false,
  },
  {
    accessorFn: (row) => row.eventResources?.name,
    id: 'eventResources',
    header: 'Event Resources',
    enableSorting: false,
    Cell: (row) => {
      const eventResources = row.row.original?.event?.users ?? [];
      if (eventResources?.length) {
        return eventResources
          .map((user) => `${user?.firstName ?? ''} ${user?.lastName ?? ''}`)
          .join(', ');
      }
      return;
    },
    enableEditing: false,
  },
  {
    accessorFn: (row) => row.event?.start,
    id: 'start',
    header: 'Start',
    enableSorting: false,
    Cell: (row) => {
      const startTime = row.row.original?.event?.start;
      if (startTime) {
        return moment(startTime).format('hh:mm a');
      }
      return;
    },
    enableEditing: false,
  },
  {
    accessorFn: (row) => row.event?.end,
    id: 'end',
    header: 'End',
    enableSorting: false,
    Cell: (row) => {
      const endTime = row.row.original?.event?.end;
      if (endTime) {
        return moment(endTime).format('hh:mm a');
      }
      return;
    },
    enableEditing: false,
  },
  {
    id: 'date',
    header: 'Date',
    enableSorting: false,
    Cell: (row) => {
      const startdatetime = row.row.original?.startdatetime;
      if (startdatetime) {
        return moment(startdatetime).format('hh:mm a, YYYY-MM-DD');
      }
      return;
    },
    enableEditing: false,
  },
  {
    id: 'duration',
    header: 'Duration',
    enableSorting: false,
    Cell: (row) => {
      const start = row.row.original?.event?.start;
      const end = row.row.original?.event?.end;
      if (start && end) {
        return convertStartEndTimesToDuration(start, end);
      }
      return;
    },
    size: 110,
    enableEditing: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableEditing: false,
  },
  {
    accessorKey: 'note',
    header: 'Note',
    enableEditing: false,
  },
  {
    accessorKey: 'noteadmin',
    header: 'Note admin',
    enableEditing: true,
  },
  {
    id: 'requestedAt',
    header: 'Requested At',
    enableSorting: false,
    Cell: (row) => {
      const updatedAt = row.row.original?.updatedAt;
      if (updatedAt) {
        return moment(updatedAt).format('hh:mm a, YYYY-MM-DD');
      }
      return;
    },
    enableEditing: false,
  },
  {
    accessorKey: 'decidedAt',
    header: 'Decided At',
    enableEditing: false,
  },
];
export const requestAvailabilitiesTableColumns = [
  {
    accessorKey: 'user',
    header: 'User',
    Cell: (row) => {
      const user = row?.row.original?.user;
      return `${user?.firstName} ${user?.lastName ?? ''}`;
    },
    size: 160,
  },
  {
    accessorFn: (row) => moment(row.start).format('hh:mm a'),
    id: 'start',
    header: 'Start Time',
    enableSorting: false,
    Cell: (row) => {
      const startTime = row.row.original?.startTime;
      if (startTime) {
        return moment(startTime).format('hh:mm a');
      }
      return;
    },
    size: 120,
  },
  {
    accessorFn: (row) => moment(row.end).format('hh:mm a'),
    id: 'end',
    header: 'End Time',
    enableSorting: false,
    Cell: (row) => {
      const endTime = row.row.original?.endTime;
      if (endTime) {
        return moment(endTime).format('hh:mm a');
      }
      return;
    },
    size: 120,
  },
  {
    id: 'startRange',
    header: 'Start Range',
    enableSorting: false,
    Cell: (row) => {
      const startRange = row.row.original?.startRange;
      if (startRange) {
        return moment(startRange).format('YYYY-MM-DD');
      }
      return;
    },
    size: 120,
  },
  {
    id: 'endRange',
    header: 'End Range',
    enableSorting: false,
    Cell: (row) => {
      const endRange = row.row.original?.endRange;
      if (endRange) {
        return moment(endRange).format('YYYY-MM-DD');
      }
      return;
    },
    size: 120,
  },
  {
    accessorFn: (row) => row,
    id: 'days',
    header: 'Days',
    enableSorting: false,
    Cell: (row) => {
      const days = row.row.original.days;
      if (days) {
        return (
          <Stack direction='row' spacing='5px'>
            {days.map((day, index) => (
              <Typography key={index}>{day.name.substr(0, 2)}</Typography>
            ))}
          </Stack>
        );
      }
    },
    size: 200,
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
  },
  {
    accessorKey: 'statusType',
    header: 'Status Type',
    size: 100,
  },
  {
    accessorFn: (row) => row,
    id: 'notes',
    header: 'Notes',
    enableSorting: false,
    Cell: (row) => {
      return row.row.original?.notes ?? '';
    },
  },
  {
    id: 'requestedAt',
    header: 'Requested At',
    enableSorting: false,
    Cell: (row) => {
      const requestedAt = row.row.original?.requestedAt;
      if (requestedAt) {
        return moment(requestedAt).format('YYYY-MM-DD hh:mm a');
      }
      return;
    },
  },
  {
    accessorKey: 'decidedAt',
    header: 'Decided At',
  },
];
export const requestTimeOffTableColumns = [
  {
    accessorKey: 'user',
    header: 'User',
    Cell: (row) => {
      const grouping = row?.row.original?.user;
      return `${grouping?.firstName} ${grouping?.lastName ?? ''}`;
    },
  },
  {
    accessorFn: (row) => moment(row.start).format('hh:mm a'),
    id: 'start',
    header: 'Start Time',
    enableSorting: false,
    Cell: (row) => {
      const startTime = row.row.original?.startTime;
      if (startTime) {
        return moment(startTime).format('hh:mm a');
      }
      return;
    },
    size: 120,
  },
  {
    accessorFn: (row) => moment(row.end).format('hh:mm a'),
    id: 'end',
    header: 'End Time',
    enableSorting: false,
    Cell: (row) => {
      const endTime = row.row.original?.endTime;
      if (endTime) {
        return moment(endTime).format('hh:mm a');
      }
      return;
    },
  },
  {
    id: 'startRange',
    header: 'Start Range',
    enableSorting: false,
    Cell: (row) => {
      const startRange = row.row.original?.startRange;
      if (startRange) {
        return moment(startRange).format('YYYY-MM-DD');
      }
      return;
    },
    size: 120,
  },
  {
    id: 'endRange',
    header: 'End Range',
    enableSorting: false,
    Cell: (row) => {
      const endRange = row.row.original?.endRange;
      if (endRange) {
        return moment(endRange).format('YYYY-MM-DD');
      }
      return;
    },
  },
  {
    accessorFn: (row) => row,
    id: 'days',
    header: 'Days',
    enableSorting: false,
    Cell: (row) => {
      const days = row.row.original.days;
      if (days) {
        return (
          <Stack direction='row' spacing='5px'>
            {days.map((day) => (
              <Typography>{day.name.substr(0, 2)}</Typography>
            ))}
          </Stack>
        );
      }
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'Paid',
    header: 'paid',
  },
  {
    accessorKey: 'statusType',
    header: 'Status Type',
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
  },
  {
    accessorFn: (row) => row,
    id: 'notes',
    header: 'Notes',
    enableSorting: false,
    Cell: (row) => {
      return row.row.original?.notes ?? '';
    },
  },
  {
    id: 'requestedAt',
    header: 'Requested At',
    enableSorting: false,
    Cell: (row) => {
      const requestedAt = row.row.original?.requestedAt;
      if (requestedAt) {
        return moment(requestedAt).format('YYYY-MM-DD hh:mm a');
      }
      return;
    },
  },
  {
    accessorKey: 'decidedAt',
    header: 'Decided At',
  },
];
export const requestConfirmationTableColumns = [
  {
    accessorFn: (row) => row.user,
    id: 'status',
    header: 'Status',
    Cell: (row) => {
      const status = row?.row.original?.status;
      return `${status}`;
    },
    size: 150,
  },
  {
    id: 'activity',
    header: 'Activity',
    enableSorting: false,
    Cell: (row) => {
      return row.row.original?.event.activity0?.firstName;
    },
  },
  {
    id: 'users',
    header: 'Users',
    enableSorting: false,
    Cell: (row) => {
      return `${row.row.original?.user?.firstName} ${row.row.original?.user?.lastName}`;
    },
  },
  // {
  // id: 'users',
  // header: 'Users',
  // enableSorting: false,
  // Cell: (row) => {
  // return row.row.original?.event.users.map((user) => (
  // <Typography>{`${user?.firstName ?? ''} ${
  // user.lastName ?? ''
  // }`}</Typography>
  // ));
  // },
  // },
  {
    id: 'start',
    header: 'Start Time',
    enableSorting: false,
    Cell: (row) => {
      const startTime = row.row.original?.event.start;
      if (startTime) {
        return moment(startTime).format('hh:mm a');
      }
      return;
    },
    size: 120,
  },
  {
    id: 'end',
    header: 'End Time',
    enableSorting: false,
    Cell: (row) => {
      const endTime = row.row.original?.event.end;
      if (endTime) {
        return moment(endTime).format('hh:mm a');
      }
      return;
    },
  },
  {
    id: 'duration',
    header: 'Duration',
    enableSorting: false,
    Cell: (row) => {
      const start = row.row.original?.event.start;
      const end = row.row.original?.event.end;
      return convertStartEndTimesToDuration(start, end);
    },
    size: 110,
  },
  // {
  // id: 'startRecur',
  // header: 'Start Recur',
  // Cell: (row) => {
  // const date = row.row.original?.event.startRecur;
  // const dateMoment = moment(date);
  // return dateMoment.format('MM-DD-YYYY');
  // },
  // size: 140,
  // },
  // {
  // id: 'endRecur',
  // header: 'End Recur',
  // Cell: (row) => {
  // const date = row.row.original?.event.endRecur;
  // const dateMoment = moment(date);
  // return dateMoment.format('MM-DD-YYYY');
  // },
  // size: 140,
  // },
  {
    accessorFn: (row) => row,
    id: 'notes',
    header: 'Notes',
    enableSorting: false,
    Cell: (row) => {
      return '';
    },
  },
  {
    id: 'days',
    header: 'Days',
    enableSorting: false,
    Cell: (row) => {
      const data = row.row.original.event;
      const filteredDaysArray = formatWeekdays(data);

      if (filteredDaysArray) {
        return (
          <Stack direction='row' spacing='5px'>
            {filteredDaysArray.map((day) => (
              <Typography>{day}</Typography>
            ))}
          </Stack>
        );
      }
    },
  },
  // {
  // id: 'frequency',
  // header: 'Frequency',
  // enableSorting: false,
  // Cell: (row) => {
  // return row.row.original?.event.frequency ?? '';
  // },
  // size: 120,
  // },
  // {
  // id: 'bysetpos',
  // header: 'Bysetpos',
  // enableSorting: false,
  // Cell: (row) => {
  // return row.row.original?.event.bysetpos ?? '';
  // },
  // size: 120,
  // },
];
export const requesLateTableColumns = [];

