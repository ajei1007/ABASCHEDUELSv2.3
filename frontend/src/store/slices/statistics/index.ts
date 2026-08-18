import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { typeFieldOptions } from 'pages/statistics/constants/selectOptions';
import { periodOptions } from 'constants/statistics';

// ** Initial State
const initialState = {
  dashboard: null as any | null,
  dashboardLoading: false,

  dashboardBranches: [] as any[],
  selectedDashboardBranches: [] as any[],

  dashboardRoles: [] as any[],
  dashboardRolesFetchStatus: 'initial' as
    | 'initial'
    | 'loading'
    | 'success'
    | 'failed',
  selectedDashboardRoles: [] as any[],

  activityResources: [] as any[],
  activityResourcesFetchStatus: 'initial' as
    | 'initial'
    | 'loading'
    | 'success'
    | 'failed',
  activityResourcesFetchBranchId: null as string | null,

  // Statistics page
  selectedType: typeFieldOptions[0],
  selectedDate: new Date(),
  selectedStartDate: new Date(),
  selectedEndDate: new Date(),

  selectedBranchActivitiesStartDate: new Date(),
  selectedBranchActivitiesEndDate: new Date(),
  branchActivitiesTableData: null as any | null,
  branchActivitiesTableLoading: false,
  branchActivitiesAllLoaded: false,
  selectedPeriod: periodOptions[0],

  selectedAuthorizationStartDate: new Date(),
  selectedAuthorizationEndDate: new Date(),
  statisticsCharts: null as any | null,
  statisticsChartLoading: false,
  activityTableData: null as any | null,
  activityTableLoading: false,

  efficiencyChartData: null as any | null,
  efficiencyChartLoading: false,
  efficiencyCompareBranches: false,
  selectedEfficiencyBranches: [] as any[],

  authorizationTableData: null as any | null,
  authorizationTableLoading: false,
  selectedAuthorizationActivities: [] as any[],

  staffTrackerData: null as any | null,
  staffTrackerLoading: false,
  selectedStaffTrackerBranches: [] as any[],
  selectedStaffTrackerActivities: [] as any[],
  selectedStaffTrackerRoles: [] as any[],
  selectedStaffTrackerBranchType: null as any | null,
  selectedStaffTrackerDate: new Date(),
  staffTrackerBranchTypes: [] as any[],
  staffTrackerBranchTypesFetchStatus: 'initial' as
    | 'initial'
    | 'loading'
    | 'success'
    | 'failed',
  companySettingsId: '',
  staffingEquilibriumOptimizerLoading: false,
  staffingEquilibriumOptimizerModal: false,
  staffingEquilibriumOptimizerData: null as any | null,
  staffTrackerView: false,
};

export const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setDashboardData(state, action: PayloadAction<any>) {
      state.dashboard = action.payload;
    },
    setDashboardLoading(state, action: PayloadAction<boolean>) {
      state.dashboardLoading = action.payload;
    },
    setDashboardBranches(state, action: PayloadAction<any[]>) {
      state.dashboardBranches = action.payload;
    },
    setSelectedDashboardBranches(state, action: PayloadAction<any[]>) {
      state.selectedDashboardBranches = action.payload;
    },
    setDashboardRoles(state, action: PayloadAction<any[]>) {
      state.dashboardRoles = action.payload;
    },
    setDashboardRolesFetchStatus(
      state,
      action: PayloadAction<'loading' | 'success' | 'failed'>,
    ) {
      state.dashboardRolesFetchStatus = action.payload;
    },
    setSelectedDashboardRoles(state, action: PayloadAction<any[]>) {
      state.selectedDashboardRoles = action.payload;
    },
    setActivityResources(state, action: PayloadAction<any[]>) {
      state.activityResources = action.payload;
    },
    setActivityResourcesFetchStatus(
      state,
      action: PayloadAction<'loading' | 'success' | 'failed'>,
    ) {
      state.activityResourcesFetchStatus = action.payload;
    },
    setActivityResourcesFetchBranchId(
      state,
      action: PayloadAction<string | null>,
    ) {
      state.activityResourcesFetchBranchId = action.payload;
    },
    setSelectedType(state, action: PayloadAction<any>) {
      state.selectedType = action.payload;
    },
    setSelectedDate(state, action: PayloadAction<any>) {
      state.selectedDate = action.payload;
    },
    setSelectedStartDate(state, action: PayloadAction<any>) {
      state.selectedStartDate = action.payload;
    },
    setSelectedEndDate(state, action: PayloadAction<any>) {
      state.selectedEndDate = action.payload;
    },
    setSelectedBranchActivitiesStartDate(state, action: PayloadAction<any>) {
      state.selectedBranchActivitiesStartDate = action.payload;
    },
    setSelectedBranchActivitiesEndDate(state, action: PayloadAction<any>) {
      state.selectedBranchActivitiesEndDate = action.payload;
    },
    setBranchActivitiesTableData(state, action: PayloadAction<any>) {
      state.branchActivitiesTableData = action.payload;
    },
    setBranchActivitiesTableLoading(state, action: PayloadAction<boolean>) {
      state.branchActivitiesTableLoading = action.payload;
    },
    setBranchActivitiesAllLoaded(state, action: PayloadAction<boolean>) {
      state.branchActivitiesAllLoaded = action.payload;
    },
    setSelectedPeriod(state, action: PayloadAction<any>) {
      state.selectedPeriod = action.payload;
    },
    setSelectedAuthorizationStartDate(state, action: PayloadAction<any>) {
      state.selectedAuthorizationStartDate = action.payload;
    },
    setSelectedAuthorizationEndDate(state, action: PayloadAction<any>) {
      state.selectedAuthorizationEndDate = action.payload;
    },
    setStatisticsCharts(state, action: PayloadAction<any>) {
      state.statisticsCharts = action.payload;
    },
    setStatisticsChartLoading(state, action: PayloadAction<boolean>) {
      state.statisticsChartLoading = action.payload;
    },
    setActivityTableData(state, action: PayloadAction<any>) {
      state.activityTableData = action.payload;
    },
    setActivityTableLoading(state, action: PayloadAction<boolean>) {
      state.activityTableLoading = action.payload;
    },
    setEfficiencyChartData(state, action: PayloadAction<any>) {
      state.efficiencyChartData = action.payload;
    },
    setEfficiencyChartLoading(state, action: PayloadAction<boolean>) {
      state.efficiencyChartLoading = action.payload;
    },
    setEfficiencyCompareBranches(state, action: PayloadAction<boolean>) {
      state.efficiencyCompareBranches = action.payload;
    },
    setSelectedEfficiencyBranches(state, action: PayloadAction<any[]>) {
      state.selectedEfficiencyBranches = action.payload;
    },
    setAuthorizationTableData(state, action: PayloadAction<any>) {
      state.authorizationTableData = action.payload;
    },
    setAuthorizationTableLoading(state, action: PayloadAction<boolean>) {
      state.authorizationTableLoading = action.payload;
    },
    setSelectedAuthorizationActivities(state, action: PayloadAction<any[]>) {
      state.selectedAuthorizationActivities = action.payload;
    },
    setStaffTrackerData(state, action: PayloadAction<any>) {
      state.staffTrackerData = action.payload;
    },
    setStaffTrackerLoading(state, action: PayloadAction<boolean>) {
      state.staffTrackerLoading = action.payload;
    },
    setSelectedStaffTrackerBranches(state, action: PayloadAction<any[]>) {
      state.selectedStaffTrackerBranches = action.payload;
    },
    setSelectedStaffTrackerActivities(state, action: PayloadAction<any[]>) {
      state.selectedStaffTrackerActivities = action.payload;
    },
    setSelectedStaffTrackerRoles(state, action: PayloadAction<any[]>) {
      state.selectedStaffTrackerRoles = action.payload;
    },
    setSelectedStaffTrackerBranchType(state, action: PayloadAction<any>) {
      state.selectedStaffTrackerBranchType = action.payload;
    },
    setSelectedStaffTrackerDate(state, action: PayloadAction<any>) {
      state.selectedStaffTrackerDate = action.payload;
    },
    setStaffTrackerBranchTypes(state, action: PayloadAction<any[]>) {
      state.staffTrackerBranchTypes = action.payload;
    },
    setStaffTrackerBranchTypesFetchStatus(
      state,
      action: PayloadAction<'loading' | 'success' | 'failed'>,
    ) {
      state.staffTrackerBranchTypesFetchStatus = action.payload;
    },
    setCompanySettingsId(state, action: PayloadAction<string>) {
      state.companySettingsId = action.payload;
    },
    clearAllStates(state) {
      state.activityTableData = null;
      state.branchActivitiesTableData = null;
      state.authorizationTableData = null;
      state.staffTrackerData = null;
    },
    setStaffingEquilibriumOptimizerLoading(
      state,
      action: PayloadAction<boolean>,
    ) {
      state.staffingEquilibriumOptimizerLoading = action.payload;
    },
    setStaffingEquilibriumOptimizerModal(
      state,
      action: PayloadAction<boolean>,
    ) {
      state.staffingEquilibriumOptimizerModal = action.payload;
    },
    setStaffingEquilibriumOptimizerData(state, action: PayloadAction<any>) {
      state.staffingEquilibriumOptimizerData = action.payload;
    },
    setStaffTrackerView(state, action: PayloadAction<boolean>) {
      state.staffTrackerView = action.payload;
    },
  },
});

export const {
  setDashboardData,
  setDashboardLoading,
  setDashboardBranches,
  setSelectedDashboardBranches,
  setDashboardRoles,
  setDashboardRolesFetchStatus,
  setSelectedDashboardRoles,
  setActivityResources,
  setActivityResourcesFetchStatus,
  setActivityResourcesFetchBranchId,
  setSelectedType,
  setSelectedDate,
  setSelectedStartDate,
  setSelectedEndDate,
  setSelectedBranchActivitiesStartDate,
  setSelectedBranchActivitiesEndDate,
  setBranchActivitiesTableData,
  setBranchActivitiesTableLoading,
  setBranchActivitiesAllLoaded,
  setSelectedPeriod,
  setSelectedAuthorizationStartDate,
  setSelectedAuthorizationEndDate,
  setStatisticsCharts,
  setStatisticsChartLoading,
  setActivityTableData,
  setActivityTableLoading,
  setEfficiencyChartData,
  setEfficiencyChartLoading,
  setEfficiencyCompareBranches,
  setSelectedEfficiencyBranches,
  setAuthorizationTableData,
  setAuthorizationTableLoading,
  setSelectedAuthorizationActivities,
  setStaffTrackerData,
  setStaffTrackerLoading,
  setSelectedStaffTrackerBranches,
  setSelectedStaffTrackerActivities,
  setSelectedStaffTrackerRoles,
  setSelectedStaffTrackerBranchType,
  setSelectedStaffTrackerDate,
  setStaffTrackerBranchTypes,
  setStaffTrackerBranchTypesFetchStatus,
  setCompanySettingsId,
  clearAllStates,
  setStaffingEquilibriumOptimizerLoading,
  setStaffingEquilibriumOptimizerModal,
  setStaffingEquilibriumOptimizerData,
  setStaffTrackerView,
} = statisticsSlice.actions;

export default statisticsSlice.reducer;
