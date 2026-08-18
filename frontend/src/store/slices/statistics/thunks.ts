import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import type { AppDispatch, RootState } from '../../index';
import {
  setDashboardData,
  setDashboardLoading,
  setStatisticsCharts,
  setStatisticsChartLoading,
  setDashboardBranches,
  setSelectedDashboardBranches,
  setDashboardRoles,
  setDashboardRolesFetchStatus,
  setActivityResources,
  setActivityResourcesFetchStatus,
  setActivityResourcesFetchBranchId,
  setBranchActivitiesTableData,
  setBranchActivitiesTableLoading,
  setBranchActivitiesAllLoaded,
  setActivityTableData,
  setActivityTableLoading,
  setEfficiencyChartData,
  setEfficiencyChartLoading,
  setAuthorizationTableData,
  setAuthorizationTableLoading,
  setStaffTrackerData,
  setStaffTrackerLoading,
  setSelectedStaffTrackerBranches,
  setSelectedStaffTrackerActivities,
  setSelectedStaffTrackerRoles,
  setSelectedStaffTrackerBranchType,
  setStaffTrackerBranchTypes,
  setStaffTrackerBranchTypesFetchStatus,
  setCompanySettingsId,
  setStaffingEquilibriumOptimizerLoading,
  setStaffingEquilibriumOptimizerModal,
  setStaffingEquilibriumOptimizerData,
} from './index';
import { getWeekDayOfDate } from 'utils/weekdayGetters';

export const fetchDashboardBranches = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const usersBranches = getState().settings.settingValues.selectedBranches;
      const res = await axios.get(`/scheduler/branches`);
      const branches = res.data;

      const findUsersBranch =
        usersBranches.length > 0
          ? Object.values(branches)
              .flatMap((t: any) => t.options)
              .find((t: any) => t.value === usersBranches[0].id)
          : null;

      const selectedBranches = findUsersBranch
        ? [findUsersBranch]
        : branches[0]?.options?.[0]
          ? [branches[0]?.options?.[0]]
          : [];

      dispatch(setDashboardBranches(branches));

      const selectedDashboardBranches =
        getState().statistics.selectedDashboardBranches;
      if (
        !Array.isArray(selectedDashboardBranches) ||
        selectedDashboardBranches.length === 0
      ) {
        dispatch(setSelectedDashboardBranches(selectedBranches));
      }

      return true;
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
      return false;
    }
  };
};

export const fetchDashboardRoles = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const fetchStatus = getState().statistics.dashboardRolesFetchStatus;
    if (['loading', 'success'].includes(fetchStatus)) {
      return;
    }

    dispatch(setDashboardRolesFetchStatus('loading'));
    try {
      const response = await axios.get(`/roles/autocomplete`);
      const roles = response?.data || [];
      dispatch(setDashboardRolesFetchStatus('success'));
      dispatch(
        setDashboardRoles(
          roles.map((roles: any) => ({ ...roles, value: roles.id })),
        ),
      );
    } catch (error: any) {
      dispatch(setDashboardRolesFetchStatus('failed'));
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    }
  };
};

/* STATISTICS SERVICES */
// Dashboard
export const fetchDashboardData = (filters?: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setDashboardLoading(true));
    try {
      const selectedDate =
        filters?.selectedDate || getState().statistics.selectedDate;

      const startOfDay = moment(selectedDate).startOf('day');
      const start = startOfDay.format();
      const end = startOfDay.add(1, 'days').format();

      const weekStart = moment(selectedDate).startOf('week').add(1, 'days');
      const startWeek = weekStart.format();
      const endWeek = weekStart.add(7, 'days').format();
      let params: any = {
        start,
        end,
        startWeek,
        endWeek,
      };
      if (filters?.branches && filters?.branches?.length) {
        params.branches = filters.branches
          .map((branch: any) => branch.id)
          .join('|');
      }
      if (filters?.roles && filters?.roles?.length) {
        params.roles = filters.roles.map((role: any) => role.label).join('|');
      }
      let response = await axios.get('/statistics/dashboard', {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
      });

      const dashboard = getState().statistics.dashboard || {};
      dispatch(
        setDashboardData({
          ...dashboard,
          ...(response?.data || {}),
        }),
      );
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setDashboardLoading(false));
    }
  };
};

// Charts
export const fetchStatisticsCharts = (filters?: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setStatisticsChartLoading(true));
    try {
      const selectedDate =
        filters?.selectedDate || getState().statistics.selectedDate;

      const startOfDay = moment(selectedDate).startOf('day');
      const start = startOfDay.format();
      const end = startOfDay.add(1, 'days').format();

      const weekStart = moment(selectedDate).startOf('week').add(1, 'days');
      const startWeek = weekStart.format();
      const endWeek = weekStart.add(7, 'days').format();
      let params: any = {
        start,
        end,
        startWeek,
        endWeek,
      };
      if (filters?.branches && filters?.branches?.length) {
        params.branches = filters.branches
          .map((branch: any) => branch.id)
          .join('|');
      }
      if (filters?.roles && filters?.roles?.length) {
        params.roles = filters.roles.map((role: any) => role.label).join('|');
      }
      const response = await axios.get('/statistics/charts', {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
      });

      let chartData = response.data;
      dispatch(setStatisticsCharts(chartData));
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setStatisticsChartLoading(false));
    }
  };
};

// Efficiency and Productivity
export const fetchEfficiencyCharts = (filters?: any, filtered = false) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setEfficiencyChartLoading(true));
    try {
      const selectedDate =
        filters?.selectedDate || getState().statistics.selectedDate;

      const startOfDay = moment(selectedDate).startOf('day');
      const start = startOfDay.format();
      const end = startOfDay.add(1, 'days').format();

      const weekStart = moment(selectedDate).startOf('week').add(1, 'days');
      const startWeek = weekStart.format();
      const endWeek = weekStart.add(7, 'days').format();
      let params: any = {
        start,
        end,
        startWeek,
        endWeek,
      };
      if (filters?.branches && filters?.branches?.length) {
        params.branches = filters.branches
          .map((branch: any) => branch.id)
          .join('|');
      }
      if (filters?.roles && filters?.roles?.length) {
        params.roles = filters.roles.map((role: any) => role.label).join('|');
      }
      const response = await axios.get(
        '/statistics/prodcutivity-efficiency-branch',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params,
        },
      );
      const efficiency = response.data.efficiency;
      const efficiencyChartData = getState().statistics.efficiencyChartData;

      let branchEfficencyData = {
        branchId: filters.branches[0].id,
        branchLabel: filters.branches[0].label,
        series: efficiency.series,
      };

      let data = [];
      if (filtered) {
        data = [branchEfficencyData];
      } else {
        data = efficiencyChartData
          ? [...efficiencyChartData.data, branchEfficencyData]
          : [branchEfficencyData];
      }

      const efficiencyData = {
        dates: efficiency.dates,
        data,
      };
      dispatch(setEfficiencyChartData(efficiencyData));

      // Productivity for dashboard
      const productivityOfWeek = efficiency.series.productivity?.data;
      const weekDay = moment(start).isoWeekday() - 1;
      const productivityOfDay = productivityOfWeek[weekDay];
      if (productivityOfDay !== null) {
        const dashboard = getState().statistics.dashboard || {};
        dispatch(
          setDashboardData({
            ...dashboard,
            productivity: productivityOfDay,
          }),
        );
      }
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setEfficiencyChartLoading(false));
    }
  };
};

// Activity Table
export const fetchStatisticsActivityTable = (filters: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setActivityTableLoading(true));
    try {
      const selectedStartDate =
        filters?.selectedStartDate || getState().statistics.selectedStartDate;
      const selectedEndDate =
        filters?.selectedEndDate || getState().statistics.selectedEndDate;
      const selectedRoles =
        filters?.roles || getState().statistics.selectedDashboardRoles;

      // I set the time part to 12:00:00 because i want to keep the date part same
      // while converting to +X timezones and -X timezones (server is in UTC 0 timezon)
      const timezone = getState().settings?.settingValues?.timezone;
      const start = moment(selectedStartDate)
        .set({ hour: 12, minute: 0, second: 0 })
        .tz(timezone)
        .startOf('day')
        .format();
      const end = moment(selectedEndDate)
        .set({ hour: 12, minute: 0, second: 0 })
        .tz(timezone)
        .startOf('day')
        .add(1, 'days')
        .format();

      let params: any = {
        start,
        end,
      };
      if (filters?.branches && filters?.branches?.length) {
        params.branches = filters.branches
          .map((branch: any) => branch.id)
          .join('|');
      }
      if (selectedRoles?.length) {
        params.roles = selectedRoles.map((role: any) => role.label).join('|');
      }
      if (filters?.type) {
        params.type = filters.type;
      }
      let response = await axios(
        '/events/activity-table/statistics-activity-table',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params,
        },
      );

      let activityTableData = response.data;
      dispatch(setActivityTableData(activityTableData));
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setActivityTableLoading(false));
    }
  };
};

/* Partial requesting utils */
function getDateRanges(
  startDate: any,
  endDate: any,
  period: 'week' | 'month' = 'week',
) {
  const start = moment(startDate);
  const end = moment(endDate);
  const ranges = [];

  while (start.isBefore(end)) {
    let currentStart = start.clone();
    let currentEnd = start.clone().endOf(period);

    // Ensure the range does not go beyond the end date
    if (currentEnd.isAfter(end)) {
      currentEnd = end.clone();
    }

    ranges.push({
      start: currentStart.format(),
      end: currentEnd.format(),
    });

    // Move start to the first of the next month
    start.add(1, period).startOf(period);
  }

  return ranges;
}
function mergeSumRows(existingRows: any, newRows: any) {
  const merged = JSON.parse(JSON.stringify(existingRows)); // Start with a copy of the existing rows

  // console.log('newRows', newRows);
  newRows.forEach((newRow: any) => {
    // Find the index of the existing row with the same id as the new row
    const existingIndex = merged.findIndex((row: any) => row.id === newRow.id);
    // console.log('existingIndex', existingIndex);
    if (existingIndex !== -1) {
      // If found, merge and sum the properties
      const existingRow = merged[existingIndex];

      merged[existingIndex] = mergeSumObjects(existingRow, newRow);
    } else {
      // If not found, simply add the new row to the merged array
      merged.push(newRow);
    }
  });

  return merged;
}
function mergeSumObjects(obj1: any, obj2: any) {
  const result = { ...obj1 }; // Start with a copy of the first object

  Object.keys(obj2).forEach((key) => {
    if (key in result) {
      if (typeof obj2[key] === 'number' && typeof result[key] === 'number') {
        // Sum numeric values
        result[key] += obj2[key];
      } else if (Array.isArray(obj2[key]) && Array.isArray(result[key])) {
        // Merge arrays, especially for 'subRows'
        result[key] = [...result[key], ...obj2[key]];
      } else if (
        typeof obj2[key] === 'object' &&
        typeof result[key] === 'object' &&
        obj2[key] !== null &&
        result[key] !== null
      ) {
        // Recursive merge for nested objects
        result[key] = mergeSumObjects(result[key], obj2[key]);
      } else {
        // If types differ or not both are objects, replace with new object's value
        result[key] = obj2[key];
      }
    } else {
      // If the key doesn't exist in the result, add it
      result[key] = obj2[key];
    }
  });
  // Productivity/Efficiency Updating:
  if (result.subRows) {
    const len = result.subRows?.length;
    if (len) {
      let allProductivity = 0;
      let allEfficiency = 0;
      let allCancellationRate = 0;
      let allSupervisionRate = 0;
      result.subRows.forEach((s: any) => {
        allProductivity += s.productivity;
        allEfficiency += s.efficiency;
        allCancellationRate += s.cancellationRate;
        allSupervisionRate += s.supervisionRate;
      });
      result['productivity'] =
        allProductivity > 0 ? (allProductivity / len).toFixed(2) : 0;
      result['efficiency'] =
        allEfficiency > 0 ? (allEfficiency / len).toFixed(2) : 0;
      result['cancellationRate'] =
        allCancellationRate > 0 ? (allCancellationRate / len).toFixed(2) : 0;
      result['supervisionRate'] =
        allSupervisionRate > 0 ? (allSupervisionRate / len).toFixed(2) : 0;
    }
  }
  return result;
}

// User Activities Table
export const fetchStatisticsBranchActivitiesTable = (filters: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setBranchActivitiesAllLoaded(true));
    dispatch(setBranchActivitiesTableLoading(true));
    try {
      const selectedStartDate =
        filters?.selectedBranchActivitiesStartDate ||
        getState().statistics.selectedBranchActivitiesStartDate;
      const selectedEndDate =
        filters?.selectedBranchActivitiesEndDate ||
        getState().statistics.selectedBranchActivitiesEndDate;
      const selectedPeriod =
        filters?.selectedPeriod || getState().statistics.selectedPeriod?.value;
      const selectedRoles =
        filters?.roles || getState().statistics.selectedDashboardRoles;

      const start = moment(selectedStartDate).startOf('day').format();
      const end = moment(selectedEndDate)
        .startOf('day')
        .add(1, 'days')
        .format();

      const period = selectedPeriod === 'weekly' ? 'week' : 'month';
      const dateRanges = getDateRanges(start, end, period);

      let params: any = {
        start,
        end,
        period: selectedPeriod,
      };
      if (filters?.branches && filters?.branches?.length) {
        params.branches = filters.branches
          .map((branch: any) => branch.id)
          .join('|');
      }
      if (selectedRoles?.length) {
        params.roles = selectedRoles.map((role: any) => role.label).join('|');
      }

      /* Req */
      let activityTableData: any = { rows: [], columns: [] };
      let prevRows: any = [];
      let prevCols: any = [];
      for (let i = 0; i < dateRanges.length; i++) {
        const range = dateRanges[i];
        let response = await axios('/statistics/activity-table-grouped', {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            ...params,
            start: moment(range.start).startOf('day').format(),
            end: moment(range.end).startOf('day').format(),
          },
        });
        // await new Promise(resolve => setTimeout(resolve, 3000));

        const rows = (response.data as any).rows;
        const mergedRows = mergeSumRows(prevRows, rows);
        prevRows = mergedRows;

        const columns = (response.data as any).columns;
        const mergedCols = mergeSumRows(prevCols, columns);
        prevCols = mergedCols;

        activityTableData = {
          rows: mergedRows,
          columns: mergedCols,
        };
        dispatch(setBranchActivitiesTableData(activityTableData));
        if (i === dateRanges.length - 1) {
          dispatch(setBranchActivitiesAllLoaded(false));
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setBranchActivitiesTableLoading(false));
    }
  };
};

// Authorization Table
export const fetchStatisticsAuthorizationTable = (filters: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setAuthorizationTableLoading(true));
    try {
      const selectedAuthorizationStartDate =
        filters?.selectedAuthorizationStartDate ||
        getState().statistics.selectedAuthorizationStartDate;
      const selectedAuthorizationEndDate =
        filters?.selectedAuthorizationEndDate ||
        getState().statistics.selectedAuthorizationEndDate;

      const start = moment(selectedAuthorizationStartDate)
        .startOf('day')
        .format();
      const end = moment(selectedAuthorizationEndDate)
        .startOf('day')
        .add(1, 'days')
        .format();

      let params: any = {
        start,
        end,
      };
      if (filters?.branches && filters?.branches?.length) {
        params.branches = filters.branches
          .map((branch: any) => branch.id)
          .join('|');
      }
      if (filters?.roles && filters?.roles?.length) {
        params.roles = filters.roles.map((role: any) => role.label).join('|');
      }
      if (filters?.type) {
        params.type = filters.type;
      }

      let response = await axios('/statistics/authorization-table', {
        headers: {
          'Content-Type': 'application/json',
        },
        params,
      });
      let authorizationTableData = response.data;
      dispatch(setAuthorizationTableData(authorizationTableData));
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setAuthorizationTableLoading(false));
    }
  };
};

// Staff Tracker Data
export const fetchStaffTrackerSettings = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { companyId, branches } = getState().auth.currentUser;
    let settingsCompany = null;

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
          settingsCompany = newSettingsCompany.data;
        }
      }
    }
    dispatch(
      setSelectedStaffTrackerBranches(
        settingsCompany?.staffTrackerBranches ?? [],
      ),
    );
    dispatch(
      setSelectedStaffTrackerRoles(settingsCompany?.staffTrackerRoles ?? []),
    );
    dispatch(
      setSelectedStaffTrackerBranchType(
        settingsCompany?.staffTrackerBranchType ?? null,
      ),
    );
    dispatch(
      setSelectedStaffTrackerActivities(
        (settingsCompany?.staffTrackerActivities || []).map(
          (activity: any, index: number) => ({
            id: activity?.id ?? `Unknown ${index}`,
            value: activity?.value ?? `Unknown ${index}`,
            label: activity?.label ?? `Unknown ${index}`,
          }),
        ),
      ),
    );
    dispatch(setCompanySettingsId(settingsCompany?.id));
    return settingsCompany;
  };
};

export const updateStaffTrackerSettings = (filters: any) => {
  return async (_: AppDispatch, getState: () => RootState) => {
    try {
      const { companyId } = getState().auth.currentUser;
      const { companySettingsId } = getState().statistics;

      let formData: any = {
        id: companySettingsId,
        company: companyId,
        branches: filters.branches.map((b: any) => b.id),
      };
      if (filters.branchType) {
        formData.branchType = filters.branchType?.value;
      }
      if (filters.activities && filters.activities.length) {
        formData.activities = filters.activities.map(
          (activity: any) => activity.value,
        );
      }
      if (filters.roles && filters.roles.length) {
        formData.roles = filters.roles.map((r: any) => r.value);
      }
      await axios.put(`/settingscompany/${companySettingsId}`, {
        id: companySettingsId,
        data: formData,
      });
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    }
  };
};

export const fetchActivityResources = (branchId: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const fetchStatus = getState().statistics.activityResourcesFetchStatus;
    if (fetchStatus === 'loading' || !branchId) {
      return;
    }

    const fetchBranchId = getState().statistics.activityResourcesFetchBranchId;
    if (fetchStatus === 'success' && fetchBranchId === branchId) {
      return;
    }

    dispatch(setActivityResourcesFetchStatus('loading'));
    try {
      const response = await axios.post(
        `/scheduler/resources`,
        {
          resourceTypes: 'Activity',
        },
        {
          params: {
            branches: branchId,
          },
        },
      );
      const resources = response?.data || [];
      dispatch(setActivityResourcesFetchStatus('success'));
      dispatch(setActivityResourcesFetchBranchId(branchId));
      dispatch(
        setActivityResources(
          resources.map((r: any) => ({
            id: r?.id,
            value: r?.id,
            type: r?.type,
            label: r?.title,
          })),
        ),
      );
    } catch (error: any) {
      dispatch(setActivityResourcesFetchStatus('failed'));
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    }
  };
};

export const fetchStaffTrackerBranchTypes = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const fetchStatus =
      getState().statistics.staffTrackerBranchTypesFetchStatus;
    if (['loading', 'success'].includes(fetchStatus)) {
      return;
    }

    dispatch(setStaffTrackerBranchTypesFetchStatus('loading'));
    try {
      const response = await axios.get(`/branchtype/autocomplete`);
      const branchTypes = response?.data || [];
      dispatch(setStaffTrackerBranchTypesFetchStatus('success'));
      dispatch(
        setStaffTrackerBranchTypes(
          branchTypes.map((val: any) => ({
            ...val,
            value: val.id,
          })),
        ),
      );
    } catch (error: any) {
      dispatch(setStaffTrackerBranchTypesFetchStatus('failed'));
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    }
  };
};

export const fetchStaffTrackerData = (filters?: any) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setStaffTrackerLoading(true));

    const selectedStaffTrackerDate =
      filters?.selectedStaffTrackerDate ||
      getState().statistics.selectedStaffTrackerDate;
    const branches =
      filters?.branches || getState().statistics.selectedStaffTrackerBranches;
    const activities =
      filters?.activities ||
      getState().statistics.selectedStaffTrackerActivities;
    const roles =
      filters?.roles || getState().statistics.selectedStaffTrackerRoles;
    const branchType =
      filters?.branchType ||
      getState().statistics.selectedStaffTrackerBranchType;

    const startOfDay = moment(selectedStaffTrackerDate).startOf('day');
    const start = startOfDay.format('YYYY-MM-DD');
    const end = startOfDay.add(1, 'days').format('YYYY-MM-DD');

    const weekStart = moment(selectedStaffTrackerDate)
      .startOf('week')
      .add(1, 'days');
    const startWeek = weekStart.format();
    const endWeek = weekStart.add(7, 'days').format();

    const token = localStorage.getItem('token');
    let formData: any = {
      header: {
        Authorization: `Bearer ${token}`,
      },
      start_date: start,
      end_date: end,
      startWeek,
      endWeek,
      offset: new Date().getTimezoneOffset(),
      branch: branches?.[0]?.id || '',
      activities: activities?.length
        ? activities.map(
            (activity: any) => activity?.id ?? activity?.value ?? '',
          )
        : [],
    };
    if (roles) {
      formData.roles = roles.map((role: any) => role.label).join('|');
    }
    if (branchType) {
      formData.branchType = branchType?.value;
    }

    try {
      let optimizerURL = 'http://127.0.0.1:4000/optimizer/staff_tracker';
      if (!import.meta.env.DEV)
        optimizerURL = '/lambda/optimizer/staff_tracker';

      const response = await axios.post(optimizerURL, {
        data: formData,
      });
      const data = response.data;
      dispatch(setStaffTrackerData(data));
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setStaffTrackerLoading(false));
    }
  };
};

export const fetchStaffingEquilibriumOptimizer = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setStaffingEquilibriumOptimizerLoading(true));

    const selectedStaffTrackerDate =
      getState().statistics.selectedStaffTrackerDate;
    const branches = getState().statistics.selectedStaffTrackerBranches;
    const selectedStaffTrackerActivities =
      getState().statistics.selectedStaffTrackerActivities;
    const selectedStaffTrackerBranchType =
      getState().statistics.selectedStaffTrackerBranchType;

    const startOfDay = moment(selectedStaffTrackerDate).startOf('day');
    const start = startOfDay.format('YYYY-MM-DD');
    const end = startOfDay.add(1, 'days').format('YYYY-MM-DD');
    const weekStart = moment(selectedStaffTrackerDate)
      .startOf('week')
      .add(1, 'days');
    const startWeek = weekStart.format();
    const endWeek = weekStart.add(7, 'days').format();

    const token = localStorage.getItem('token');
    let formData: any = {
      header: {
        Authorization: `Bearer ${token}`,
      },
      start_date: start,
      end_date: end,
      startWeek,
      endWeek,
      offset: new Date().getTimezoneOffset(),
      branch: branches?.[0]?.id || '',
    };
    if (selectedStaffTrackerActivities?.length) {
      formData.activities = selectedStaffTrackerActivities.map(
        (activity: any) => activity.id,
      );
    } else {
      formData.activities = [];
    }
    if (selectedStaffTrackerBranchType) {
      formData.branchType = selectedStaffTrackerBranchType?.value;
    }

    try {
      let optimizerURL = 'http://127.0.0.1:4000/optimizer/staff_equilibrium';
      if (!import.meta.env.DEV)
        optimizerURL = '/lambda/optimizer/staff_equilibrium';

      const response = await axios.post(optimizerURL, {
        data: formData,
      });
      const data = response.data;

      dispatch(setStaffingEquilibriumOptimizerData(data));
      dispatch(setStaffingEquilibriumOptimizerModal(true));
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setStaffingEquilibriumOptimizerLoading(false));
    }
  };
};

export const confirmStaffingEquilibriumOptimizer = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setStaffingEquilibriumOptimizerLoading(true));
    try {
      const staffingEquilibriumOptimizerData =
        getState().statistics.staffingEquilibriumOptimizerData;
      const timezone =
        getState().settings?.settingValues?.timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone;
      const startTime = moment
        .tz(timezone)
        .set({ hour: 4, minute: 0, second: 0, millisecond: 0 });
      const endTime = moment
        .tz(timezone)
        .set({ hour: 20, minute: 0, second: 0, millisecond: 0 });
      const startRange = staffingEquilibriumOptimizerData.startDate;
      const endRange = staffingEquilibriumOptimizerData.endDate;
      const weekday = getWeekDayOfDate(startRange).value;

      const obj = {
        startTime: startTime,
        endTime: endTime,
        timezone,
        startRange: startRange,
        endRange: endRange,
        days: [weekday],
        available: true,
        status: 'Approved',
        oncall: true,
      };
      let userIds = [];
      let reqBody = [];
      const arr = staffingEquilibriumOptimizerData.rows.filter(
        (center: any) => center.type === 'Received',
      );

      for (const center of arr) {
        for (const user of center.users) {
          reqBody.push({
            ...obj,
            user: user.emp_id,
            branch: center.original_center_id,
          });
          userIds.push(user.emp_id);
        }
      }

      await axios.delete(`/availabilities/oncall/remove`, {
        params: {
          startRange,
          users: userIds.join('|'),
        },
      });
      await axios.post(`/availabilities/create/multiple`, { data: reqBody });

      dispatch(fetchStaffTrackerData() as any);
      dispatch(setStaffingEquilibriumOptimizerModal(false));
    } catch (error: any) {
      const msg = error?.response?.data;
      const errorMessage = error?.message;
      console.log(errorMessage);
      if (msg) {
        toast.error(msg);
      } else {
        toast.error('Something went wrong. Try again');
      }
    } finally {
      dispatch(setStaffingEquilibriumOptimizerLoading(false));
    }
  };
};
