import { useRef, useMemo } from 'react';
import { Stack, Typography } from '@mui/material';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomAsyncSelect from 'components/CustomAsyncSelect/CustomAsyncSelect';
import CustomCheckboxBlock from 'components/CustomCheckboxBlock/CustomCheckboxBlock';
import { REACT_SELECT_OPTION_DISABLED } from 'constants/symbols';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useLoadResourceOptions } from 'pages/calendar/hooks/useLoadResourceOptions';
import { checkIsCurrentBranchLevelHighest } from 'pages/calendar/utils/formatters';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { handleSettingValues } from 'store/actions/settingsActions';
import { isOptimizerResultsPreviewModeSelector } from 'store/selectors/optimizerSelectors';
import {
  updateFilter,
  updateAllFilters,
  updateFilterLocations,
  updateAllFiltersLocations,
  setEventsLoading,
  setIncludeDeleted,
  setActive,
} from 'store/slices/calendar/actions';
import {
  handleSetDisplayedUser,
  fetchEvents,
  fetchStatistics,
  changeBranch,
} from 'store/slices/calendar/thunks';
import FiltersSection from './FiltersSection';

const MainTabActivities = ({
  activeDay,
  activeView,
}: {
  activeDay: string;
  activeView: string;
}) => {
  const dispatch = useAppDispatch();
  const loadDataTimer = useRef<number>(-1);
  const lastState = useRef(null);
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const storeLazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
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

  const storeBranches = useAppSelector((state) => state.calendar.branches);

  const storeDisplayedUser = useAppSelector(
    (state) => state.calendar.displayedUser,
  );
  const calendar_start = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const calendar_end = useAppSelector((state) => state.calendar.calendar_end);
  const includeDeleted = useAppSelector(
    (state) => state.calendar.includeDeleted,
  );
  const settingValuesStatsViewEnabled = useAppSelector(
    (state) => state.settings.settingValues.statsViewEnabled,
  );
  const settingValuesHideCancelations = useAppSelector(
    (state) => state.settings.settingValues.hideCancelations,
  );
  const activeCheckbox = useAppSelector((state) => state.calendar.active);
  const isOptimizerResultsPreviewMode = useAppSelector(
    isOptimizerResultsPreviewModeSelector,
  );

  const handleChangeActive = useLatestCallback((event) => {
    const isChecked = event.target.checked;
    dispatch(setActive(isChecked));
  });

  const handleChangeIncludeDeleted = useLatestCallback(async (event) => {
    const isChecked = event.target.checked;

    dispatch(setIncludeDeleted(isChecked));

    window.clearTimeout(loadDataTimer.current);

    loadDataTimer.current = window.setTimeout(() => {
      if (lastState.current === isChecked) {
        return;
      }

      lastState.current = isChecked;

      dispatch(setEventsLoading(true));

      dispatch(
        fetchEvents({
          bol: false,
        }),
      )
        .then(() => {
          if (settingValuesStatsViewEnabled) {
            return dispatch(
              fetchStatistics({
                start: calendar_start,
                end: calendar_end,
              }),
            );
          }
        })
        .finally(() => {
          dispatch(setEventsLoading(false));
        });
    }, 300);
  });

  const handleClickCanceled = useLatestCallback(async (event) => {
    const isChecked = event.target.checked;

    dispatch(handleSettingValues('hideCancelations', !isChecked));

    window.clearTimeout(loadDataTimer.current);

    loadDataTimer.current = window.setTimeout(() => {
      if (lastState.current === isChecked) {
        return;
      }

      lastState.current = isChecked;

      dispatch(handleSettingValues('hideCancelations', !isChecked));
    }, 300);
  });

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
      postLoadFilter: (data) => data.filter((t) => !t?.calendarhide),
      transformData: (data) =>
        data.map((item) => ({
          value: item.id,
          label: item.title,
        })),
    });

  const branchOptions = useMemo(() => {
    const branches = Array.isArray(storeBranches) ? storeBranches : [];
    return branches.map((group: any) => ({
      label: group.label,
      options: Array.isArray(group.options)
        ? group.options.map((option: any) => {
            const isHeighest = checkIsCurrentBranchLevelHighest(
              branches,
              option.level,
            );
            return {
              id: option.id,
              label: option.label,
              value: option.value,
              bol: option.bol,
              level: option.level,
              ...(activeView !== 'Timeline' && !isHeighest
                ? {
                    [REACT_SELECT_OPTION_DISABLED]: true,
                  }
                : {}),
            };
          })
        : [],
    }));
  }, [storeBranches, activeView]);

  return (
    <>
      <Stack spacing={1}>
        <Stack>
          <CustomSelect
            options={branchOptions}
            value={storeCurrentBranches?.[0]}
            isDisabled={isOptimizerResultsPreviewMode}
            isOptionDisabled={(option: any) =>
              Object.hasOwn(option, REACT_SELECT_OPTION_DISABLED)
            }
            onChange={(data: any) => {
              dispatch(changeBranch(data));
            }}
          />
        </Stack>
        {activeDay === 'Month' && (
          <Stack>
            <label>Displayed User</label>
            <CustomAsyncSelect
              loadOptions={loadResourceOptions}
              defaultOptions={shouldShowDefaultOptions}
              value={storeDisplayedUser}
              isDisabled={isOptimizerResultsPreviewMode}
              onChange={(data: any) => {
                dispatch(
                  handleSetDisplayedUser({
                    user: data,
                    doFetchEvents: true,
                  }),
                );
              }}
            />
          </Stack>
        )}
      </Stack>
      <Stack>
        <Typography margin='0.5rem 0 0.5rem 0' fontSize={'0.85rem'}>
          Appointment Details
        </Typography>
        <CustomCheckboxBlock
          color='#4d53e0'
          label='Active'
          checked={activeCheckbox}
          disabled={isOptimizerResultsPreviewMode}
          onChange={(e) => handleChangeActive(e)}
          dataQa='sidebar-type-checkbox'
        />
        <CustomCheckboxBlock
          color='#4d53e0'
          label='Canceled'
          checked={!settingValuesHideCancelations}
          disabled={isOptimizerResultsPreviewMode}
          onChange={(e) => handleClickCanceled(e)}
          dataQa='sidebar-type-checkbox'
        />
        <CustomCheckboxBlock
          color='#4d53e0'
          label='Deleted'
          checked={includeDeleted}
          disabled={isOptimizerResultsPreviewMode}
          onChange={(e) => handleChangeIncludeDeleted(e)}
          dataQa='sidebar-type-checkbox'
        />
        <Stack></Stack>
      </Stack>
      <FiltersSection
        updateFilter={updateFilter}
        updateAllFilters={updateAllFilters}
        cancel={true}
        type='activity'
        disabled={isOptimizerResultsPreviewMode}
        filters={storeActivityResources.map((resource) => {
          return {
            value: resource.id,
            label: resource.title,
            type: resource.type,
            color: resource.color,
            className: 'styled mb-1',
          };
        })}
      />
      <FiltersSection
        updateFilter={updateFilterLocations}
        updateAllFilters={updateAllFiltersLocations}
        type='location'
        cancel={false}
        disabled={isOptimizerResultsPreviewMode}
        filters={storeLocationResources.map((resource) => {
          return {
            value: resource.id,
            label: resource.title,
            type: resource.type,
            color: resource.color,
            className: 'styled mb-1',
          };
        })}
        animationTimeout={2000}
      />
    </>
  );
};

export default MainTabActivities;
