import { Grid2 as Grid, Stack } from '@mui/material';
import UndynamicTable from './UndynamicTable';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomAsyncSelect from 'components/CustomAsyncSelect/CustomAsyncSelect';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import { CONSTRAINT_TYPES } from 'pages/CRUD/CustomConstraints/helpers/customTypes';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLoadResourceOptions } from 'pages/calendar/hooks/useLoadResourceOptions';
import {
  setFlaggingFilterUsers,
  setFlaggingFilterConstraintTypes,
  setFlaggingFilterShowOnlyBroken,
} from 'store/slices/flagging/actions';

const FLAGGING_CONSTRAINT_TYPES = [
  ...CONSTRAINT_TYPES,
  {
    label: 'Overbooking',
    value: 'overbooking',
  },
  {
    label: 'Empty Availability',
    value: 'emptyAvailability',
  },
  {
    label: 'Not Availabile Busy',
    value: 'notAvailableBusy',
  },
];

const FlaggingTable = ({ columns, rows }) => {
  const dispatch = useAppDispatch();
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLocationResources = useAppSelector(
    (state) => state.calendar.locationResources,
  );
  const storeBlockResources = useAppSelector(
    (state) => state.calendar.blockResources,
  );
  const storeLazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
  );
  const storeSettingsValuesOverbooking = useAppSelector(
    (state) => state.settings.settingValues?.overbooking,
  );
  const storeSettingsValuesEmptyAvailability = useAppSelector(
    (state) => state.settings.settingValues?.emptyAvailability,
  );
  const storeSettingsValuesNotAvailableBusy = useAppSelector(
    (state) => state.settings.settingValues?.notAvailableBusy,
  );

  const users = useAppSelector((state) => state.flagging.flaggingFilters.users);
  const constraintTypes = useAppSelector(
    (state) => state.flagging.flaggingFilters.constraintTypes,
  );
  const showOnlyBroken = useAppSelector(
    (state) => state.flagging.flaggingFilters.showOnlyBroken,
  );

  const handleUsersChange = (value) => {
    dispatch(setFlaggingFilterUsers(value));
  };

  const handleConstraintTypesChange = (value) => {
    value = value ? value.map((option) => option.value) : [];
    dispatch(setFlaggingFilterConstraintTypes(value));
  };

  const handleShowOnlyBrokenChange = (value) => {
    dispatch(setFlaggingFilterShowOnlyBroken(value));
  };

  const filteredRows = useMemo(() => {
    let _filteredRows = JSON.parse(JSON.stringify(rows));
    const userIds = users.map((a) => a.value);

    if (constraintTypes.length) {
      _filteredRows = _filteredRows.filter((r) =>
        constraintTypes.includes(r.constraintType),
      );
    }
    if (userIds.length) {
      _filteredRows = _filteredRows.filter((r) => userIds.includes(r.userId));
    }
    if (showOnlyBroken) {
      _filteredRows = _filteredRows.filter((r) => r.broken);
    }

    const isOverbookingEnabled = storeSettingsValuesOverbooking;
    const isEmptyAvailabilityEnabled = storeSettingsValuesEmptyAvailability;
    const isNotAvailableBusyEnabled = storeSettingsValuesNotAvailableBusy;
    let ignoredConstraintTypes = [];

    if (!isOverbookingEnabled) {
      ignoredConstraintTypes.push('overbooking');
    }

    if (!isEmptyAvailabilityEnabled) {
      ignoredConstraintTypes.push('emptyAvailability');
    }

    if (!isNotAvailableBusyEnabled) {
      ignoredConstraintTypes.push('notAvailableBusy');
    }

    _filteredRows = _filteredRows.filter(
      (c) => c.broken && !ignoredConstraintTypes.includes(c.constraintType),
    );

    return _filteredRows;
  }, [
    rows,
    constraintTypes,
    users,
    showOnlyBroken,
    storeSettingsValuesOverbooking,
    storeSettingsValuesEmptyAvailability,
    storeSettingsValuesNotAvailableBusy,
  ]);

  const currentBranchId = storeCurrentBranches[0]?.value;
  const resources = useMemo(
    () => [
      ...storeLazyResources.filter((r) =>
        ['Employee', 'Client'].includes(r.type),
      ),
      ...storeActivityResources,
      ...storeLocationResources,
      ...storeBlockResources,
    ],
    [
      storeLazyResources,
      storeActivityResources,
      storeLocationResources,
      storeBlockResources,
    ],
  );
  const resourcesLoaded = [
    storeLazyResourcesFetchStatus[`${currentBranchId}:Employee`],
    storeLazyResourcesFetchStatus[`${currentBranchId}:Client`],
  ].every((status) => status === 'success');

  const { loadResourceOptions, shouldShowDefaultOptions } =
    useLoadResourceOptions({
      resources,
      resourcesLoaded,
      transformData: (data) =>
        data.map((item) => ({
          value: item.id,
          label: item.title,
          type: item.type,
        })),
    });

  return (
    <Stack spacing={2}>
      <Grid container alignItems='center' spacing={2}>
        <Grid size={5}>
          <label>Users</label>
          <CustomAsyncSelect
            isMulti
            loadOptions={loadResourceOptions}
            defaultOptions={shouldShowDefaultOptions}
            value={users}
            onChange={handleUsersChange}
          />
        </Grid>
        <Grid size={5}>
          <label>Constraint Types</label>
          <CustomSelect
            isMulti
            options={FLAGGING_CONSTRAINT_TYPES}
            value={FLAGGING_CONSTRAINT_TYPES.filter((option) =>
              constraintTypes.includes(option.value),
            )}
            onChange={handleConstraintTypesChange}
          />
        </Grid>
        <Grid size={2}>
          <Stack>
            <label>Show only broken</label>
            <CustomSwitch
              name='showOnlyBroken'
              checked={showOnlyBroken}
              onChange={(e) => handleShowOnlyBrokenChange(e.target.checked)}
            />
          </Stack>
        </Grid>
      </Grid>
      <Stack sx={{ overflowY: 'auto' }}>
        <UndynamicTable
          columns={columns}
          rows={filteredRows}
          data-qa='flagging-table'
        />
      </Stack>
    </Stack>
  );
};

export default FlaggingTable;
