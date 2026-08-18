/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import actions from 'store/actions/events/eventsListActions';
import { useAppDispatch } from 'store/hooks';
import Widget from 'components/Widget/Widget';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { Chip, Stack, Typography } from '@mui/material';
import DynamicTable from 'components/Table/NewTable/DynamicTable';
import moment from 'moment';
import axios from 'axios';
import Loader from 'components/Loader/Loader';
import ExportTableButton from 'components/ExportTableButton/ExportTableButton';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import getWeekdaysInRange from 'utils/getWeekdaysInRange';
import convertStartEndTimesToDuration from 'utils/convertStartEndTimesToDuration';
import moment2 from 'moment-timezone';

const formatWeekdays = (data: any) => {
  type WeekdayCode = 'F' | 'M' | 'R' | 'S' | 'T' | 'U' | 'W';
  const weekdayMappings: Record<WeekdayCode, string> = {
    F: 'Friday',
    M: 'Monday',
    R: 'Thursday',
    S: 'Saturday',
    T: 'Tuesday',
    U: 'Sunday',
    W: 'Wednesday',
  };
  const selectedWeekdays: string[] = [];
  (Object.keys(data) as WeekdayCode[]).forEach((code: WeekdayCode) => {
    if (data[code]) {
      selectedWeekdays.push(weekdayMappings[code]);
    }
  });
  const filteredDays = selectedWeekdays.filter(
    (item: any) => item !== undefined,
  );
  return filteredDays.map((item: any) => item.slice(0, 3));
};

const statusOptions = [
  {
    id: 0,
    value: 'showActive',
    label: 'Show Active',
  },
  {
    id: 1,
    value: 'showDeleted',
    label: 'Show Deleted',
  },
  {
    id: 2,
    value: 'showCanceled',
    label: 'Show Canceled',
  },
];
// Function to determine status from backend fields
const determineStatus = (data: any) => {
  if (data.deletedAt !== null) {
    return 'deletedAt';
  }
  if (data.isCancelled !== false) {
    return 'isCancelled';
  }
  return 'active';
};

const getStatusChip = (status: any) => {
  switch (status) {
    case 'deletedAt':
      return { label: 'Deleted', color: 'error' as const };
    case 'active':
      return { label: 'Active', color: 'success' as const };
    case 'isCancelled':
      return { label: 'Canceled', color: 'warning' as const };
    default:
      return { label: status, color: 'default' as const };
  }
};

const convertedFieldOptions = [
  {
    label: 'Yes',
    value: 'true',
  },
  {
    label: 'No',
    value: 'false',
  },
];
const EventsTable = () => {
  const dispatch = useAppDispatch();
  const loading = useTypedSelector((store) => store.events.list.loading);
  const rows = useTypedSelector((store) => store.events.list.rows);
  const count = useTypedSelector((store) => store.events.list.count);

  /* Table Roles Logic */
  const [selectedRolesOption, setSelectedRolesOption] = useState<any>(null);
  const [rolesOptions, setRolesOptions] = useState([
    {
      id: 1,
      value: '',
      label: 'None',
    },
  ]);
  const fetchRoles = async () => {
    const res = await axios.get('/roles/autocomplete');
    const roles = res.data;
    const mappedRoles = roles.map((roles: any) => ({
      ...roles,
      value: roles.label,
    }));
    setRolesOptions((prev) => [...prev, ...mappedRoles]);
    setSelectedRolesOption(rolesOptions[0]);
  };

  /* Table Branches Logics */
  const currentUser = useTypedSelector((store) => store.auth.currentUser);
  const [branchesOptions, setBranchesOptions] = useState([]);
  const [activityOptions, setActivityOptions] = useState([
    {
      id: 1,
      value: '',
      label: 'None',
    },
  ]);
  const [localLoading, setLocalLoading] = useState(true);
  const [selectedBranchesOption, setSelectedBranchesOption] =
    useState<any>(null);
  const [selectedActivityOption, setSelectedActivityOption] =
    useState<any>(null);
  const [populateEnabled, setPopulateEnabled] = useState(true);
  const [localFilters, setLocalFilters] = useState({});
  const [searchedUser, setSearchedUser] = useState('');

  const getUsersDefaultBranchFromSettings = async () => {
    const response = await axios.get(`/settings`);
    const data = response.data.rows[0];

    const branchDefaultId = data.branchDefaultId;
    const usersBranchId = branchDefaultId
      ? branchDefaultId
      : currentUser.branches?.[0]?.id;

    return usersBranchId;
  };
  const fetchBranches = async (currentBranchId: any) => {
    const res = await axios.get(`/scheduler/branches`);

    const branches = res.data;
    setBranchesOptions(branches);

    // Find branch
    const findUsersBranch = currentBranchId
      ? Object.values(branches)
          .flatMap((t: any) => t.options)
          .find((t: any) => t.value === currentBranchId)
      : null;
    let defaultSelectedBranch = null;
    for (const structure of branches) {
      if (structure?.options?.[0]) {
        defaultSelectedBranch = structure?.options?.[0];
        break;
      }
    }
    const selectedBranch = findUsersBranch
      ? findUsersBranch
      : defaultSelectedBranch;

    setSelectedBranchesOption(selectedBranch);
  };
  const fetchActivity = async () => {
    const res = await axios.get('/users/autocomplete/Activity');
    const activity = res.data;
    const mappedActivity = activity.map((activity: any) => ({
      label: activity.label,
      value: activity.id,
    }));
    setActivityOptions([
      { id: 1, value: '', label: 'None' },
      ...mappedActivity,
    ]);
    setSelectedActivityOption(activityOptions[0]);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLocalLoading(true);
        const currentBranchId = await getUsersDefaultBranchFromSettings();
        await Promise.all([
          fetchBranches(currentBranchId),
          fetchRoles(),
          fetchActivity(),
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setLocalLoading(false);
      }
    };
    init();
  }, []);
  /*  */

  // const actionFormatter = (cell: string) => {
  //   return (
  //     <ActionFormatter
  //       deletePermissionType='deleteBranch'
  //       deleteEvent={(event: React.MouseEvent) => openModal(event, cell)}
  //       editPermissionType='editBranch'
  //       editEvent={() => history.push(`/admin/branches/${cell}/edit`)}
  //     />
  //   );
  // };
  const columns = useMemo(
    () => [
      // {
      //   accessorKey: 'id',
      //   header: '',
      //   Cell: ({ renderedCellValue }: { renderedCellValue: any }) => {
      //     return actionFormatter(renderedCellValue);
      //   },
      //   size: 80,
      // },
      {
        accessorKey: 'status',
        header: 'Status',
        filterVariant: 'multi-select',
        filterSelectOptions: statusOptions, //custom options list (as opposed to faceted list)
        Cell: (row: any) => {
          const status = determineStatus(row?.row?.original); // or however you access the status field
          const chipProps = getStatusChip(status);

          return <Chip {...chipProps} sx={{ color: 'white' }} />;
        },
      },
      {
        accessorFn: (row: any) => row,
        id: 'activity',
        header: 'Activity',
        enableSorting: false,
        enableColumnFilter: true,
        filterVariant: 'select',
        filterSelectOptions: activityOptions,
        Cell: (row: any) => {
          return row.row.original?.activity0?.firstName;
        },
      },
      {
        accessorFn: (row: any) => row,
        id: 'location',
        header: 'Location',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          return row.row.original?.location0?.firstName;
        },
      },
      // {
      //   accessorFn: (row: any) => row,
      //   id: 'users',
      //   header: 'Users',
      //   enableSorting: false,
      //   Cell: (row: any) => {
      //     return row.row.original?.users.map((user: any) => (
      //       <Typography>{`${user?.firstName} ${
      //         user.lastName ?? ''
      //       }`}</Typography>
      //     ));
      //   },
      // },
      {
        accessorFn: (row: any) => moment(row.start).format('hh:mm a'),
        id: 'start',
        header: 'Start Time',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: (row: any) => {
          const startTime = row.row.original?.start;
          const timezone = row.row.original?.timezone;
          let startTZ = moment(startTime).format('hh:mm a');
          if (timezone) {
            startTZ = moment2.tz(startTime, timezone).format('hh:mm a');
          }

          if (startTime) {
            return startTZ;
          }
          return;
        },
        size: 120,
      },
      {
        accessorFn: (row: any) => moment(row.end).format('hh:mm a'),
        id: 'end',
        header: 'End Time',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          const endTime = row.row.original?.end;
          const timezone = row.row.original?.timezone;
          let endTZ = moment(endTime).format('hh:mm a');
          if (timezone) {
            endTZ = moment2.tz(endTime, timezone).format('hh:mm a');
          }

          if (endTime) {
            return endTZ;
          }
          return;
        },
      },
      {
        accessorFn: (row: any) => row.converted?.name,
        id: 'converted',
        header: 'Converted',
        filterVariant: 'select',
        filterSelectOptions: convertedFieldOptions,
        Cell: (row: any) => {
          const data = row.row.original.converted;
          return <Typography>{data ? 'Yes' : 'No'}</Typography>;
        },
        size: 150,
      },
      {
        accessorFn: (row: any) => row.startActual,
        id: 'startActual',
        header: 'Start Actual',
        Cell: ({ row }: any) => {
          const converted = row.original.converted;
          if (!converted) {
            return '';
          }

          const startTime = row.original?.startActual;
          if (!startTime) {
            return '';
          }
          const startTimeMoment = moment2(startTime).tz(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            true,
          );
          if (!startTimeMoment.isValid()) {
            return '';
          }

          let startTZ = startTimeMoment.format('hh:mm a');
          const timezone = row.original?.timezone;
          if (timezone) {
            startTZ = moment2(startTime).tz(timezone, true).format('hh:mm a');
          }

          return startTZ;
        },
        size: 160,
      },
      {
        accessorFn: (row: any) => row.endActual,
        id: 'endActual',
        header: 'End Actual',
        Cell: ({ row }: any) => {
          const converted = row.original.converted;
          if (!converted) {
            return '';
          }

          const endTime = row.original?.endActual;
          if (!endTime) {
            return '';
          }

          const endTimeMoment = moment2(endTime).tz(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            true,
          );
          if (!endTimeMoment.isValid()) {
            return '';
          }

          let endTZ = endTimeMoment.format('hh:mm a');
          const timezone = row.original?.timezone;
          if (timezone) {
            endTZ = moment2(endTime).tz(timezone, true).format('hh:mm a');
          }

          return endTZ;
        },
        size: 160,
      },
      {
        accessorFn: (row: any) => row.timezone,
        id: 'timezone',
        header: 'Timezone',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          return row.row?.original?.timezone;
        },
      },
      {
        id: 'duration',
        header: 'Duration',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: (row: any) => {
          const start = row.row.original?.start;
          const end = row.row.original?.end;
          return convertStartEndTimesToDuration(start, end);
        },
        size: 110,
      },
      {
        accessorFn: (row: any) => row,
        id: 'notes',
        header: 'Notes',
        enableColumnFilter: false,
        enableSorting: false,
        Cell: (row: any) => {
          return row.row.original?.notes ?? '';
        },
      },
      {
        accessorFn: (row: any) => row,
        id: 'startRecur',
        enableColumnFilter: false,
        header: 'Start Recur',
        Cell: (row: any) => {
          const date = row.row.original?.startRecur;
          const dateMoment = moment(date);
          return dateMoment.format('MM-DD-YYYY');
        },
        size: 140,
      },
      {
        accessorFn: (row: any) => row,
        id: 'endRecur',
        enableColumnFilter: false,
        header: 'End Recur',
        Cell: (row: any) => {
          const date = row.row.original?.endRecur;
          const dateMoment = moment(date);
          return dateMoment.format('MM-DD-YYYY');
        },
        size: 140,
      },
      {
        accessorFn: (row: any) => row,
        id: 'days',
        header: 'Days',
        enableSorting: false,
        enableColumnFilter: false,
        size: 250,
        Cell: (row: any) => {
          const data = row.row.original;
          const filteredDaysArray = formatWeekdays(data);

          if (filteredDaysArray) {
            return (
              <Stack direction='row' spacing='5px'>
                {filteredDaysArray.map((day: any) => (
                  <Typography>{day}</Typography>
                ))}
              </Stack>
            );
          }
        },
      },
      // {
      //   accessorFn: (row: any) => row.frequency,
      //   id: 'frequency',
      //   header: 'Frequency',
      //   enableSorting: false,
      //   Cell: (row: any) => {
      //     return row.row.original?.frequency ?? '';
      //   },
      //   size: 120,
      // },
      {
        accessorFn: (row: any) => row.description,
        id: 'description',
        header: 'Description',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: (row: any) => {
          return row.row.original?.description ?? '';
        },
        size: 300,
      },
    ],
    [activityOptions],
  );

  const handleExportEventsTable = async () => {
    let filter: any = localFilters;

    if (filter.limit) delete filter.limit;
    if (filter.page) delete filter.page;

    if (populateEnabled) {
      filter.populate = populateEnabled;
    } else {
      delete filter.populate;
    }

    if (filter.start && filter.end) {
      const weekdays = getWeekdaysInRange(filter.start, filter.end);
      filter.weekdays = weekdays.join('|');
    }
    if (filter.firstName) {
      filter.lastName = filter.firstName;
    }

    const response = await axios.get('/events', {
      params: filter,
    });
    const data = response.data.rows;
    if (data?.length > 0) {
      const formattedData = data.map((event: any) => {
        const employees = event?.users
          ?.filter((u: any) => u?.resourceType === 'Employee')
          ?.map((user: any) => `${user.firstName} ${user.lastName ?? ''}`);
        const clients = event?.users
          ?.filter((u: any) => u?.resourceType === 'Client')
          ?.map((user: any) => `${user.firstName} ${user.lastName ?? ''}`);

        const statusKey = determineStatus(event);
        const statusLabel = getStatusChip(statusKey).label;

        return {
          Status: statusLabel,
          Activity: event?.activity0?.firstName,
          Employees: employees.join(', '),
          Clients: clients.join(', '),
          Location: event?.location0?.firstName,
          Date: event?.date ?? '',
          'Start Time': moment(event.start).format('hh:mm a'),
          'End Time': moment(event.end).format('hh:mm a'),
          Duration: convertStartEndTimesToDuration(event.start, event.end),
          'Start Recur': moment(event.startRecur).format('MM-DD-YYYY'),
          'End Recur': moment(event.endRecur).format('MM-DD-YYYY'),
          Days: formatWeekdays(event).join(', '),
          Frequency: event?.frequency,
          BySetPos: event?.bysetpos,
          Notes: event?.notes,
        };
      });
      return formattedData;
    }
    return;
  };

  const selectFields = useMemo(() => {
    return [
      {
        name: 'branches',
        label: 'Branches',
        value: selectedBranchesOption,
        onChange: (val: any) => {
          setSelectedBranchesOption(val);
        },
        options: branchesOptions,
      },
      {
        name: 'role',
        label: 'Role',
        value: selectedRolesOption,
        onChange: (val: any) => setSelectedRolesOption(val),
        options: rolesOptions,
      },
    ];
  }, [
    branchesOptions,
    rolesOptions,
    selectedBranchesOption,
    selectedRolesOption,
  ]);

  const searchFields = useMemo(() => {
    let userField: {
      name: string;
      value: string;
      label: string;
      onChange: (val: any) => any;
    }[] = [];
    if (userField) {
      userField = [
        {
          name: 'user',
          label: 'User',
          onChange: (val: any) => setSearchedUser(val),
          value: searchedUser,
        },
      ];
    }
    return userField;
  }, [searchedUser, searchedUser]);
  return (
    <div>
      <Widget className='widget-p-md' title={<h4>Events</h4>}>
        <Stack direction='row' justifyContent='flex-end' spacing={2}>
          <Stack direction='row' alignItems='center' spacing='0.5rem'>
            <CustomSwitch
              name='populate-events'
              checked={populateEnabled}
              onChange={(e) => setPopulateEnabled(e.target.checked)}
            />
            <label htmlFor='canceled'>Populate Events For Export</label>
          </Stack>
          <ExportTableButton
            name='Events'
            handleExport={handleExportEventsTable}
          />
        </Stack>
        {/* Table */}
        {localLoading ? (
          <Loader />
        ) : (
          <>
            <DynamicTable
              columns={columns}
              rows={rows}
              count={count}
              loading={loading}
              fetchData={(filterObj: any) => {
                setLocalFilters(filterObj);
                dispatch(actions.doFetch(filterObj));
              }}
              enabledDateRange
              isExpandable
              expandedInitially={true}
              selectFields={selectFields as any}
              searchFields={searchFields as any}
            />
          </>
        )}
      </Widget>
    </div>
  );
};

export default EventsTable;
