import { memo, useEffect, useMemo, type FC } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { Stack, Grid2 as Grid } from '@mui/material';
import CustomAsyncSelect from 'components/CustomAsyncSelect/CustomAsyncSelect';
import CustomButton from 'components/Button';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import InternalPortal from 'components/InternalPortal';
import SectionTitle from './SectionTitle';
import role_permissions from 'helpers/role_permissions';
import { useLatestCallback } from 'hooks/useLatestCallback';
import incrementBy from 'pages/calendar/utils/incrementBy';
import { useCalendarTotalTypeOptions } from '../../../hooks/useCalendarTotalTypeOptions';
import { useLoadResourceOptions } from 'pages/calendar/hooks/useLoadResourceOptions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  fetchFlaggingData,
  setFlaggingData,
} from 'store/slices/flagging/actions';
import {
  handleSettingValues,
  saveDefaultSettings,
} from 'store/actions/settingsActions';
import { fetchStatistics } from 'store/slices/calendar/thunks';
import { selectInputControlStyles } from 'utils/selectInputControlStyles';
import {
  distance_units,
  settings_organized,
  highlightRecentlyChangedTimeWindowOptions,
} from '../../../constants';
import Tooltip from '@mui/material/Tooltip';

export interface ISettingsModalContentProps {
  actionButtonsTargetRef: React.RefObject<HTMLElement>;
  toggleModalOpen: () => void;
}

const SettingsModalContent: FC<ISettingsModalContentProps> = ({
  actionButtonsTargetRef,
  toggleModalOpen,
}) => {
  const dispatch = useAppDispatch();
  const storeFrontendRolesHierarchy = useAppSelector(
    (state) => state.calendar.frontend_roles_hierarchy,
  );
  const storeCalendarStart = useAppSelector(
    (state) => state.calendar.calendar_start,
  );
  const storeCalendarEnd = useAppSelector(
    (state) => state.calendar.calendar_end,
  );
  const storeCurrentBranches = useAppSelector(
    (state) => state.calendar.current_branches,
  );
  const isCurrentBranchLevelHighest = useAppSelector(
    (state) => state.calendar.isCurrentBranchLevelHighest,
  );

  const storeActivityResources = useAppSelector(
    (state) => state.calendar.activityResources,
  );
  const storeLazyResources = useAppSelector(
    (state) => state.calendar.lazyResources,
  );
  const storeLazyResourcesFetchStatus = useAppSelector(
    (state) => state.calendar.lazyResourcesFetchStatus,
  );

  const storeSettingsValues = useAppSelector(
    (state) => state.settings.settingValues,
  );
  const flaggingEnabled = useAppSelector(
    (state) => state.flagging.flaggingEnabled,
  );

  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const {
    businessStartTime,
    businessEndTime,
    quickStatFilter,
    onboardingSelection,
    backgroundColorRole,
    borderColorRole,
    overbooking,
  } = storeSettingsValues;

  const totalTypeOptions = useCalendarTotalTypeOptions();

  const filterStartTime = (time: Date) => {
    const selectedDate = new Date(time);
    if (moment(selectedDate).format('HH:mm') === '00:00') return false;
    return businessEndTime.getTime() > selectedDate.getTime();
  };

  const filterEndTime = (time: Date) => {
    const selectedDate = new Date(time);
    if (moment(selectedDate).format('HH:mm') === '00:00') return false;
    return businessStartTime.getTime() < selectedDate.getTime();
  };
  const roleHierarchyOptions = Object.keys(storeFrontendRolesHierarchy).map(
    (e) => ({
      value: e,
      label: e,
    }),
  );

  const handleSetDefaultSettings = () => {
    const confirming = window.confirm(
      'Are You sure you want to save these settings as your default settings?',
    );
    if (confirming) {
      dispatch(saveDefaultSettings());
      toggleModalOpen();
    }
  };

  const filterResourcesOptions = storeActivityResources.map((resource) => ({
    value: resource.id,
    label: resource.title,
  }));

  const checkBoxes = settings_organized.filter(
    (setting) =>
      setting.permission === 'none' ||
      role_permissions(currentUser, setting.permission),
  );

  const onOverbookingChangeEffect = useLatestCallback((overbooking) => {
    // If flagging is enabled, it means that the flagging data is already fetched
    if (flaggingEnabled) {
      return;
    }

    // If overbooking is enabled, fetch flagging data
    if (overbooking) {
      dispatch(fetchFlaggingData());
    } else {
      dispatch(setFlaggingData({ constraints: [] }));
    }
  });

  useEffect(() => {
    onOverbookingChangeEffect(overbooking);
  }, [overbooking, onOverbookingChangeEffect]);

  useEffect(() => {
    if (
      !isCurrentBranchLevelHighest &&
      (storeSettingsValues as any)['groupResourcesByRole']
    ) {
      dispatch(handleSettingValues('groupResourcesByRole', false));
    }
  }, [isCurrentBranchLevelHighest, storeSettingsValues, dispatch]);

  const currentBranchId = storeCurrentBranches[0]?.value;
  const resourcesLoaded = [
    storeLazyResourcesFetchStatus[`${currentBranchId}:Employee`],
    storeLazyResourcesFetchStatus[`${currentBranchId}:Client`],
  ].every((status) => status === 'success');

  const {
    loadResourceOptions: loadPersonWaitlistOptions,
    shouldShowDefaultOptions: shouldShowPersonWaitlistDefaultOptions,
  } = useLoadResourceOptions({
    resourceTypes: ['Employee', 'Client'],
    resources: useMemo(
      () =>
        storeLazyResources.filter((r) =>
          ['Employee', 'Client'].includes(r.type),
        ),
      [storeLazyResources],
    ),
    resourcesLoaded,
    postLoadFilter: (data) => data.filter((item) => item.waitlisted),
    transformData: (data) =>
      data.map((item) => ({
        value: item.id,
        label: item.title,
        type: item.type,
      })),
  });

  return (
    <Stack spacing='2rem'>
      {/* Checkboxes */}
      <Grid container rowGap={4}>
        {checkBoxes.map((setting) => {
          const { title, elements } = setting;
          return (
            <Grid key={title} size={6}>
              <SectionTitle>{title}</SectionTitle>
              <Grid container rowSpacing={2} columnSpacing={{ sm: '1rem' }}>
                {elements.map((element) => {
                  const { title, value } = element;
                  return (
                    <Grid key={value} size={6}>
                      <Stack>
                        <label>{title}</label>
                        {value === 'groupResourcesByRole' ? (
                          <Tooltip
                            title={
                              !isCurrentBranchLevelHighest
                                ? 'You need to be in the Lowest Branch Type to group by resources'
                                : ''
                            }
                            placement='top'
                          >
                            <span>
                              <CustomSwitch
                                checked={(storeSettingsValues as any)[value]}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  dispatch(handleSettingValues(value, checked));
                                }}
                                disabled={!isCurrentBranchLevelHighest}
                              />
                            </span>
                          </Tooltip>
                        ) : (
                          <CustomSwitch
                            checked={(storeSettingsValues as any)[value]}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              dispatch(handleSettingValues(value, checked));
                            }}
                          />
                        )}
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          );
        })}
        <Grid size={12}>
          <SectionTitle>Highlight Recently Edited Events</SectionTitle>
          <Grid container rowSpacing={2} columnSpacing={{ sm: '1rem' }}>
            <Grid size={3}>
              <Stack>
                <label>Enable Highlighting</label>
                <CustomSwitch
                  checked={storeSettingsValues.highlightRecentlyChanged}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    dispatch(
                      handleSettingValues('highlightRecentlyChanged', checked),
                    );
                  }}
                />
              </Stack>
            </Grid>
            {storeSettingsValues.highlightRecentlyChanged && (
              <>
                <Grid size={3}>
                  <Stack>
                    <label>Hide Other Events</label>
                    <CustomSwitch
                      checked={
                        storeSettingsValues.highlightRecentlyChangedHideOtherEvents
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        dispatch(
                          handleSettingValues(
                            'highlightRecentlyChangedHideOtherEvents',
                            checked,
                          ),
                        );
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack>
                    <label>Time Window</label>
                    <CustomSelect
                      options={highlightRecentlyChangedTimeWindowOptions}
                      value={
                        highlightRecentlyChangedTimeWindowOptions.find(
                          (option) =>
                            option.value ===
                            storeSettingsValues.highlightRecentlyChangedTimeWindow,
                        ) || highlightRecentlyChangedTimeWindowOptions[0]
                      }
                      onChange={(data: any) => {
                        dispatch(
                          handleSettingValues(
                            'highlightRecentlyChangedTimeWindow',
                            data.value,
                          ),
                        );
                      }}
                      isMulti={false}
                    />
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* Business Hours */}
      <Stack>
        <SectionTitle>Business Hours</SectionTitle>
        <Grid container rowSpacing={1} columnSpacing={{ sm: '1rem' }}>
          <Grid size={6}>
            <Stack>
              <label>Start Time</label>
              <DatePicker
                className='form-control'
                selected={businessStartTime}
                onChange={(value) =>
                  dispatch(handleSettingValues('businessStartTime', value))
                }
                dateFormat={'h:mm aa'}
                timeIntervals={30}
                showTimeSelect={true}
                showTimeSelectOnly={true}
                timeCaption='Time'
                filterTime={filterStartTime}
              />
            </Stack>
          </Grid>
          <Grid size={6}>
            <Stack>
              <label>End Time</label>
              <DatePicker
                className='form-control'
                selected={businessEndTime}
                onChange={(value) =>
                  dispatch(handleSettingValues('businessEndTime', value))
                }
                dateFormat={'h:mm aa'}
                timeIntervals={30}
                showTimeSelect={true}
                showTimeSelectOnly={true}
                timeCaption='Time'
                filterTime={filterEndTime}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
      {/* General */}
      <Stack>
        <SectionTitle>General</SectionTitle>
        <Grid container rowSpacing={1} columnSpacing={{ sm: '1rem' }}>
          <Grid size={6}>
            <label>Time Increment</label>
            <CustomSelect
              onChange={(e: any) =>
                dispatch(handleSettingValues('timeInterval', e.value))
              }
              value={incrementBy(61, 1, 1)
                .filter((t) => [1, 5, 15, 30, 60].includes(t.value))
                .map((t) => ({ ...t, label: `${t.label} min` }))
                .filter((e) => e.value === storeSettingsValues['timeInterval'])}
              options={incrementBy(61, 1, 1)
                .filter((t) => [1, 5, 15, 30, 60].includes(t.value))
                .map((t) => ({ ...t, label: `${t.label} min` }))}
            />
          </Grid>
          {storeSettingsValues['driveDistanceMax'] && (
            <>
              <Grid size={3}>
                <label>Distance</label>
                <CustomSelect
                  onChange={(e: any) =>
                    dispatch(
                      handleSettingValues('driveDistanceMaxQuantity', e.value),
                    )
                  }
                  value={incrementBy(100, 1, 1).filter(
                    (e) =>
                      e.value ===
                      storeSettingsValues['driveDistanceMaxQuantity'],
                  )}
                  options={incrementBy(100, 1, 1)}
                />
              </Grid>
              <Grid size={3}>
                <label>Units</label>
                <CustomSelect
                  onChange={(e: any) =>
                    dispatch(
                      handleSettingValues('driveDistanceMaxUnit', e.value),
                    )
                  }
                  value={distance_units.filter(
                    (e) =>
                      e.value === storeSettingsValues['driveDistanceMaxUnit'],
                  )}
                  options={distance_units}
                />
              </Grid>
              <Grid size={3}>
                <label>Locations</label>
                <CustomSelect
                  styles={selectInputControlStyles(false, false, false)}
                  classNamePrefix='select'
                  onChange={(e: any) =>
                    dispatch(handleSettingValues('locationQuantity', e.value))
                  }
                  value={incrementBy(10, 1, 1).filter(
                    (e) => e.value === storeSettingsValues['locationQuantity'],
                  )}
                  options={incrementBy(10, 1, 1)}
                />
              </Grid>
            </>
          )}
          {storeSettingsValues['driveTime'] && (
            <Grid size={3}>
              <label>Time (min.)</label>
              <CustomSelect
                styles={selectInputControlStyles(false, false, false)}
                classNamePrefix='select'
                onChange={(e: any) =>
                  dispatch(handleSettingValues('driveTimeQuantity', e.value))
                }
                value={incrementBy(240, 1, 1).filter(
                  (e) => e.value === storeSettingsValues['driveTimeQuantity'],
                )}
                options={incrementBy(240, 1, 1)}
              />
            </Grid>
          )}
          {storeSettingsValues['isOnboarding'] && (
            <Grid size={12}>
              <label>Onboarding</label>
              <CustomAsyncSelect
                isMulti={true}
                loadOptions={loadPersonWaitlistOptions}
                defaultOptions={shouldShowPersonWaitlistDefaultOptions}
                value={onboardingSelection}
                onChange={(data: any) => {
                  dispatch(handleSettingValues('onboardingSelection', data));
                }}
              />
            </Grid>
          )}
        </Grid>
      </Stack>
      <Stack>
        <SectionTitle>Styling</SectionTitle>
        <Grid container rowSpacing={1} columnSpacing={{ sm: '1rem' }}>
          <Grid size={6}>
            <label>Backgroud Color Role</label>
            <CustomSelect
              isMulti={false}
              options={roleHierarchyOptions}
              value={roleHierarchyOptions.find(
                (r) => backgroundColorRole === r.value,
              )}
              onChange={(data: any) =>
                dispatch(handleSettingValues('backgroundColorRole', data.value))
              }
            />
          </Grid>
          <Grid size={6}>
            <label>Border Color Role</label>
            <CustomSelect
              isMulti={false}
              options={roleHierarchyOptions}
              value={roleHierarchyOptions.find(
                (r) => borderColorRole === r.value,
              )}
              onChange={(data: any) =>
                dispatch(handleSettingValues('borderColorRole', data.value))
              }
            />
          </Grid>
        </Grid>
      </Stack>
      {/* Filters */}
      {/* <Stack>
          <SectionTitle>Filters</SectionTitle>
          <Filters gridCol={6} subgroupBol={true} />
        </Stack> */}
      {/* Quick Statistic */}
      <Stack>
        <SectionTitle>Quick Statistics</SectionTitle>
        <Grid container rowSpacing={1}>
          {filterResourcesOptions?.length > 0 && (
            <Grid size={12}>
              <label>Activities</label>
              <CustomSelect
                menuPlacement='top'
                isMulti={true}
                options={filterResourcesOptions}
                value={storeActivityResources
                  .filter((resource) =>
                    quickStatFilter.includes(resource.title),
                  )
                  .map((resource) => ({
                    value: resource.id,
                    label: resource.title,
                  }))}
                onChange={(data: any) => {
                  dispatch(
                    handleSettingValues(
                      'quickStatFilter',
                      data.map((e: any) => e.label),
                    ),
                  );
                }}
              />
            </Grid>
          )}
          {filterResourcesOptions?.length > 0 && (
            <Grid size={12}>
              <label>Default Activity</label>
              <CustomSelect
                menuPlacement='top'
                options={filterResourcesOptions}
                value={storeActivityResources
                  .filter(
                    (resource) =>
                      resource.id === storeSettingsValues.defaultActivity,
                  )
                  .map((resource) => ({
                    value: resource.id,
                    label: resource.title,
                  }))}
                onChange={(e: any) => {
                  dispatch(handleSettingValues('defaultActivity', e.value));
                  if (storeSettingsValues.statsViewEnabled) {
                    dispatch(
                      fetchStatistics({
                        start: storeCalendarStart,
                        end: storeCalendarEnd,
                      }),
                    );
                  }
                }}
              />
            </Grid>
          )}
          <Grid size={12}>
            <label>Total Custom</label>
            <CustomSelect
              menuPlacement='top'
              options={totalTypeOptions}
              value={totalTypeOptions.filter(
                (t) => storeSettingsValues.totalCustom === t.value,
              )}
              onChange={(e: any) => {
                dispatch(handleSettingValues('totalCustom', e.value));
                if (storeSettingsValues.statsViewEnabled) {
                  dispatch(
                    fetchStatistics({
                      start: storeCalendarStart,
                      end: storeCalendarEnd,
                    }),
                  );
                }
              }}
            />
          </Grid>
        </Grid>
      </Stack>

      <InternalPortal targetRef={actionButtonsTargetRef}>
        <CustomButton onClick={handleSetDefaultSettings}>
          Save As Default
        </CustomButton>
        <CustomButton onClick={toggleModalOpen} variant='outlined'>
          Cancel
        </CustomButton>
      </InternalPortal>
    </Stack>
  );
};

export default memo(SettingsModalContent);
