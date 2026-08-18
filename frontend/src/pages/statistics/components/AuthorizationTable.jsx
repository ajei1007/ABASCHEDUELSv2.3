import { useMemo, useState } from 'react';
import UndynamicTable from 'pages/calendar/components/UndynamicTable';
import { Stack, Tooltip } from '@mui/material';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setSelectedAuthorizationActivities,
  fetchActivityResources,
} from 'store/slices/statistics/actions';
import CustomInput from 'components/CustomInputModal/CustomInput';

const columns = [
  {
    accessorFn: (row) => row.user,
    id: 'name',
    header: 'Name',
    Cell: (row) => {
      const user = row.row.original.user;
      return `${user?.firstName} ${user?.lastName || ''}`;
    },
  },
  {
    accessorFn: (row) => row.activity,
    id: 'activity',
    header: 'Activity',
    Cell: (row) => {
      const activity = row.row.original.activity;
      return `${activity?.firstName}`;
    },
  },
  {
    accessorKey: 'timeUsed',
    header: 'Time Used',
    Header: () => (
      <Tooltip
        title='The number of units that has been scheduled for up to date'
        arrow
        placement='top-start'
      >
        <span>Time Used</span>
      </Tooltip>
    ),
    Cell: (row) => {
      return `${row.row.original.timeUsed + ' ' + row.row.original.units}`;
    },
    size: 120,
  },
  {
    accessorKey: 'timeRemaining',
    header: 'Time Remaining',
    Cell: (row) => {
      return `${row.row.original.timeRemaining + ' ' + row.row.original.units}`;
    },
    Header: () => (
      <Tooltip
        title='The number of units that has not been rendered'
        arrow
        placement='top-start'
      >
        <span>Time Remaining</span>
      </Tooltip>
    ),
    size: 120,
  },
  {
    accessorKey: 'rollOver',
    header: 'Makeup hours',
    Cell: (row) => {
      return `${row.row.original.rollOver + ' ' + row.row.original.units}`;
    },
    Header: () => (
      <Tooltip
        title='Any units that would be available for makeup hours'
        arrow
        placement='top-start'
      >
        <span>Makeup hours</span>
      </Tooltip>
    ),
    size: 120,
  },
  {
    accessorKey: 'authUtilization',
    header: 'Authorization Utilization',
    Cell: (row) => {
      return `${row.row.original.authUtilization}`;
    },
    Header: () => (
      <Tooltip
        title='The percentage of the authorization that you have utilized'
        arrow
        placement='top-start'
      >
        <span>Authorization Utilization</span>
      </Tooltip>
    ),
    size: 120,
  },
  {
    accessorKey: 'timeUtilization',
    header: 'Time Utilization',
    Cell: (row) => {
      return `${row.row.original.timeUtilization}`;
    },
    Header: () => (
      <Tooltip
        title='The percentage of the auth that has passed (Ideally this number is very close to Authorization utilization)'
        arrow
        placement='top-start'
      >
        <span>Time Utilization</span>
      </Tooltip>
    ),
    size: 120,
  },
  {
    accessorKey: 'utilizationDifference',
    header: 'Utilization Difference',
    Cell: (row) => {
      return `${row.row.original.utilizationDifference}`;
    },
    Header: () => (
      <Tooltip
        title='The percentage you are over/under on your units authorized.'
        arrow
        placement='top-start'
      >
        <span>Utilization Difference</span>
      </Tooltip>
    ),
    size: 120,
  },
];

const AuthorizationTable = ({ response }) => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const selectedAuthorizationActivities = useAppSelector(
    (state) => state.statistics.selectedAuthorizationActivities,
  );
  const activityResources = useAppSelector(
    (state) => state.statistics.activityResources,
  );
  const activityResourcesFetchStatus = useAppSelector(
    (state) => state.statistics.activityResourcesFetchStatus,
  );
  const selectedDashboardBranches = useAppSelector(
    (state) => state.statistics.selectedDashboardBranches,
  );

  const handleSelectActivities = (val) =>
    dispatch(setSelectedAuthorizationActivities(val));

  const filteredRows = useMemo(() => {
    const activityIds = selectedAuthorizationActivities.map((a) => a.value);

    let filteredRowsByActivities = [];
    if (activityIds.length) {
      filteredRowsByActivities = response.filter((r) =>
        activityIds.includes(r.activity.id),
      );
    } else {
      filteredRowsByActivities = response;
    }

    return filteredRowsByActivities.filter((r) => {
      const label = `${r.user?.firstName} ${r.user?.lastName || ''}`;
      const isSearched = label.toLowerCase().includes(search.toLowerCase());
      return isSearched;
    });
  }, [response, selectedAuthorizationActivities, search]);

  const handleFocusActivities = () => {
    dispatch(fetchActivityResources(selectedDashboardBranches?.[0]?.id));
  };

  return (
    <>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Stack width='300px'>
          <CustomInput
            name='search'
            placeholder='Search'
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            data-qa='reports-search'
          />
        </Stack>
        <Stack width='300px'>
          <CustomSelect
            isLoading={activityResourcesFetchStatus === 'loading'}
            placeholder={
              activityResourcesFetchStatus === 'loading'
                ? 'Loading Activities...'
                : 'Select Activities...'
            }
            noOptionsMessage={() =>
              activityResourcesFetchStatus === 'success' &&
              activityResources.length === 0
                ? 'No Activities available'
                : 'Click to load Activities'
            }
            options={
              activityResourcesFetchStatus === 'success'
                ? activityResources
                : []
            }
            value={selectedAuthorizationActivities}
            onFocus={handleFocusActivities}
            onChange={handleSelectActivities}
            isMulti
            data-qa='reports-filter-dropdown'
          />
        </Stack>
      </Stack>
      <UndynamicTable
        columns={columns}
        rows={filteredRows}
        enableSorting
        dataQa='reports'
      />
    </>
  );
};

export default AuthorizationTable;
