import { Grid2 as Grid, Box } from '@mui/material';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomAsyncSelect from 'components/CustomAsyncSelect/CustomAsyncSelect';
import { handleSettingValues } from 'store/actions/settingsActions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useLoadResourceOptions } from 'pages/calendar/hooks/useLoadResourceOptions';
import { useEffect, useMemo } from 'react';
import { useCalendarSelectedResourcesContext } from 'pages/calendar/context/CalendarSelectedResourcesContext';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';

export default function Filters({ subgroupBol, gridCol = 6 }) {
  const dispatch = useAppDispatch();
  const storeFrontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );
  const storeSubgroups = useAppSelector((state) => state.calendar.subgroups);
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

  const settingValuesSubgroupsFilter = useAppSelector(
    (state) => state.settings.settingValues.subgroupsFilter,
  );
  const settingValuesIsolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );
  const settingValuesRoleFilter = useAppSelector(
    (state) => state.settings.settingValues.roleFilter,
  );
  const settingsValuesHideUsersWithNoAvailability = useAppSelector(
    (state) => state.settings.settingValues.hideUsersWithNoAvailability,
  );

  const roleFilterOptions = Object.keys(storeFrontendRolesHierarchy).map(
    (e) => ({
      value: e,
      label: e,
    }),
  );
  const subgroupFilterOptions = Object.values(storeSubgroups).flatMap((e) =>
    e.flatMap((t) => ({ value: t, label: t })),
  );

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
          email: item.email,
          email1: item.email1,
          email2: item.email2,
        })),
    });

  return (
    <Grid container columnSpacing={{ sm: '1rem' }} spacing={1}>
      {
        <>
          <Grid size={12}>
            <label>Groups Filters</label>
            <CustomSelect
              isMulti={true}
              options={subgroupFilterOptions}
              value={subgroupFilterOptions.filter((e) =>
                settingValuesSubgroupsFilter.includes(e.value),
              )}
              onChange={(data) =>
                dispatch(
                  handleSettingValues(
                    'subgroupsFilter',
                    data.map((e) => e.value),
                  ),
                )
              }
            />
          </Grid>
        </>
      }
      <Grid size={gridCol}>
        <label>Roles Filter</label>
        <CustomSelect
          isMulti={true}
          options={roleFilterOptions}
          value={roleFilterOptions.filter((e) =>
            settingValuesRoleFilter.includes(e.value),
          )}
          onChange={(data) =>
            dispatch(
              handleSettingValues(
                'roleFilter',
                data.map((e) => e.value),
              ),
            )
          }
        />
      </Grid>
      <Grid size={gridCol}>
        <label>Users Filter</label>
        <CustomAsyncSelect
          isMulti={true}
          loadOptions={loadResourceOptions}
          defaultOptions={shouldShowDefaultOptions}
          value={settingValuesIsolatedResources}
          onChange={(data) =>
            dispatch(handleSettingValues('isolatedResources', data))
          }
        />
      </Grid>
    </Grid>
  );
}
