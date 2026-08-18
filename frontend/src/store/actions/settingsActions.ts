import axios, { AxiosError } from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import { SettingsActionTypes } from 'types/redux/settings';
import convertDateToTodaysDate from 'utils/convertDateToTodaysDate';
import { v4 as uuidv4 } from 'uuid';

/* Actions */
export const setSettingsTimezone = (payload: any) => {
  return {
    type: SettingsActionTypes.UPDATE_TIMEZONE, // type
    payload, // payload
  };
};
export const handleSettingValues = (key: any, value: any) => {
  return (dispatch: any) => {
    dispatch({
      type: SettingsActionTypes.SETTING_VALUES,
      settingValues: { [key]: value },
    });
  };
};
export const setSettingsCompanyLoading = (payload: boolean) => {
  return (dispatch: any) => {
    dispatch({
      type: SettingsActionTypes.SET_SETTINGS_COMPANY_LOADING,
      payload,
    });
  };
};
export const setSchedulerLocked = (
  schedulerLocked: boolean,
  lockedParents: Array<any> = [],
) => {
  return (dispatch: any) => {
    dispatch({
      type: SettingsActionTypes.SET_SCHEDULER_LOCKED,
      schedulerLocked,
      lockedParentBranches: lockedParents,
    });
  };
};

/* Operations */
export const fetchUserSettings = () => {
  return async (dispatch: any, getState: any) => {
    try {
      const currentUser = getState().auth.currentUser;
      const response = await axios.get(`/settings`);

      const data = response.data.rows[0];
      const usersDefaultBranch = data.branchDefaultId;
      let usersDefaultBranchName = '';

      if (usersDefaultBranch) {
        try {
          const branchResponse = await axios.get(
            `/branches/${usersDefaultBranch}`,
          );
          usersDefaultBranchName =
            branchResponse.data?.name || 'Unknown Branch';
        } catch (error) {
          console.error('Error fetching branch name:', error);
        }
      }

      const selectedBranches = usersDefaultBranch
        ? [{ id: usersDefaultBranch, label: usersDefaultBranchName }]
        : currentUser.branches;

      const timezone =
        data?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const businessStartTime = data?.businessStartTime
        ? convertDateToTodaysDate(data?.businessStartTime)
        : moment().tz(timezone).startOf('day').add(6, 'hours').toDate();
      const businessEndTime = data?.businessEndTime
        ? convertDateToTodaysDate(data?.businessEndTime)
        : moment().tz(timezone).startOf('day').add(19, 'hours').toDate();

      const settingValues = {
        initialized: true,
        selectedBranches,
        subgroupsFilterLabels: data.subgroupsFilterLabels,
        resourceFilterLabels: data.resourceFilterLabels,
        hideCancelations: data.hideCancelations ?? false,
        isolateCanceled: data.isolateCanceled,
        rolesDefault: data.rolesDefault,
        timeConstraintUpperBuffer: data.timeConstraintUpperBuffer,
        timeConstraintLowerBuffer: data.timeConstraintLowerBuffer,
        timeconstraints: data.timeconstraints,
        noGaps: data.noGaps,
        driveTime: data.driveTime,
        weekends: data.weekends,
        teamSeparation: 1,
        blocks: data.blocks,
        // Orange must be always true (BUGS-168)
        orange: true,
        driveDistanceMax: data.driveDistanceMax,
        driveDistanceMaxQuantity: data.driveDistanceMaxQuantity ?? 30,
        driveDistanceMaxUnit: data.driveDistanceMaxUnit ?? 'mi',
        driveTimeQuantity: data.driveTimeQuantity,
        backgroundColorRole: data.backgroundColorRole,
        borderColorRole: data.borderColorRole,
        overbooking: data.overbooking,
        emptyAvailability: data.emptyAvailability,
        notAvailableBusy: data.notAvailableBusy,
        differentBranch: data.differentBranch,
        locationQuantity: data.locationQuantity || 2,
        branchDefault: data.branchDefaultId,
        branchDefaultName: usersDefaultBranchName,
        totalCustom: data.totalCustomId || 'total',
        defaultActivity: data.defaultActivityId,
        defaultLocation: data.defaultLocation2Id,
        timeInterval: data.timeInterval || 15,
        driveTimeUnit: 'Minutes',
        subgroupsFilter: data?.subgroupsFilterLabels?.split('|') ?? [],
        isolatedResources: (data?.resourceFilterLabels?.split('|') ?? []).map(
          (id: string) => ({
            value: id,
            label: id,
            type: 'Resource',
          }),
        ),
        roleFilter: data?.rolesFilterLabels?.split('|') ?? [],
        businessStartTime,
        businessEndTime,
        quickStatFilter: data.statsFilterLabels
          ? data.statsFilterLabels.split('|')
          : [],
        timezone,
        highlightRecentlyChanged: false,
        highlightRecentlyChangedHideOtherEvents: false,
        highlightRecentlyChangedTimeWindow: null,
      };
      dispatch({
        type: SettingsActionTypes.SETTING_VALUES,
        settingValues,
      });
    } catch (error) {
      const err = error as AxiosError;
      const errMsg = err?.response?.data as any;
      if (errMsg) {
        toast.error(errMsg);
      }
    }
  };
};

export const saveDefaultSettings = () => {
  return async (_: any, getState: any) => {
    let settingValues = getState().settings.settingValues;
    let data = {
      ...settingValues,
      defaultLocation2: settingValues.defaultLocation,
      totalCustom:
        settingValues.totalCustom === 'total'
          ? null
          : settingValues.totalCustom,
      subgroupsFilterLabels: settingValues.subgroupsFilter.join('|'),
      resourceFilterLabels: settingValues.isolatedResources
        .map((item: any) => item.value)
        .join('|'),
      rolesFilterLabels: settingValues.roleFilter.join('|'),
      statsFilterLabels: settingValues.quickStatFilter.join('|'),
    };
    await axios.put(`/settings`, { data });
  };
};

export const fetchCompanySettings = () => {
  return async (dispatch: any, getState: any) => {
    const { companyId, branches } = getState().auth.currentUser;
    let settingsCompany = null;

    dispatch(setSettingsCompanyLoading(true));
    try {
      const res = await axios.get(`/settingscompany/company/${companyId}`);
      settingsCompany = res.data;
    } catch (error: any) {
      if (error?.response) {
        if (error.response.status === 404) {
          // Then create
          const id = uuidv4();
          const newSettingsCompany = await axios.post(`/settingscompany`, {
            data: {
              id,
              company: companyId,
              branches: branches.map((b: any) => b.id),
            },
          });
          settingsCompany = {
            ...newSettingsCompany.data,
            membership: newSettingsCompany?.data?.membership ?? 'basic',
          };
        }
      }
    } finally {
      dispatch(setSettingsCompanyLoading(false));
    }

    dispatch({
      type: 'SET_SETTINGS_COMPANY',
      settingsCompany,
    });

    // const isSchedulerLocked = settingsCompany?.schedulerLocked ?? false;
    // dispatch({
    //   type: 'SET_SCHEDULER_LOCKED',
    //   schedulerLocked: isSchedulerLocked,
    // });
    // if (timeoutId !== null) {
    //   clearTimeout(timeoutId);
    // }
    // if (isSchedulerLocked) {
    //   timeoutId = setTimeout(
    //     () => dispatch(getCompanySchedulerLockedRecursively()),
    //     GET_SCHEDULER_LOCKED_INTERVAL,
    //   );
    // }
  };
};

export const updateAlias = (
  alias: boolean,
  aliasFormatType?: string | null,
): any => {
  return async (dispatch: any, getState: any) => {
    const { id } = getState().settings.settingsCompany;
    try {
      await axios.put(`/settingscompany/${id}/update-alias`, {
        alias,
        aliasFormatType: aliasFormatType ?? null,
      });
      dispatch({
        type: SettingsActionTypes.UPDATE_ALIAS_SUCCESS,
        alias,
        aliasFormatType: aliasFormatType ?? null,
      });
    } catch (error: any) {
      const err = error as AxiosError;
      const errMsg = err?.response?.data as any;
      if (errMsg) {
        toast.error(errMsg);
      }
    }
  };
};

/* Locking feature */

const GET_SCHEDULER_LOCKED_INTERVAL = 10000;
let timeoutId: any = null;

export const getCompanySchedulerLockedRecursively = (branch = null) => {
  return async (dispatch: any, getState: any) => {
    const { branches: userBranches } = getState().auth.currentUser;
    const currentBranch =
      branch ??
      getState().calendar.current_branches?.map((y: any) => y.value)?.[0] ??
      userBranches[0]?.id;

    let isSchedulerLocked = false;
    try {
      const response = await axios.get(
        `/branches/is-scheduler-locked/branch/${currentBranch}`,
      );
      isSchedulerLocked = response.data.schedulerLocked;
      const lockedParents = response.data?.lockedParents;

      dispatch(setSchedulerLocked(isSchedulerLocked, lockedParents));
    } catch (error) {
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (isSchedulerLocked) {
        timeoutId = setTimeout(
          () => dispatch(getCompanySchedulerLockedRecursively()),
          GET_SCHEDULER_LOCKED_INTERVAL,
        );
      }
    }
  };
};

export const updateSchedulerLocked = () => {
  return async (dispatch: any, getState: any) => {
    const { schedulerLocked } = getState().settings;
    const { branches } = getState().auth.currentUser;
    const currentBranch =
      getState().calendar.current_branches?.map((y: any) => y.value)?.[0] ??
      branches[0]?.id;
    try {
      dispatch(setSettingsCompanyLoading(true));

      await axios.put(`/branches/scheduler-lock-switch/${currentBranch}`);
      const isSchedulerLocked = !schedulerLocked;

      dispatch(setSchedulerLocked(isSchedulerLocked));
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      if (isSchedulerLocked) {
        timeoutId = setTimeout(
          () => dispatch(getCompanySchedulerLockedRecursively()),
          GET_SCHEDULER_LOCKED_INTERVAL,
        );
      }
    } catch (error) {
      console.log('Err', error);
    } finally {
      dispatch(setSettingsCompanyLoading(false));
    }
  };
};
