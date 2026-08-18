import { useEffect, useMemo, memo, useCallback } from 'react';
import {
  Chip,
  Stack,
  Typography,
  Grid2 as Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PercentIcon from '@mui/icons-material/Percent';
import RefreshIcon from '@mui/icons-material/Refresh';
import DataBox from 'components/DataBox/DataBox';
import TodaysActivityDurationsLineChart from 'components/Charts/TodaysActivityDurationsLineChart';
import AppointmentCountLineChart from 'components/Charts/AppointmentCountLineChart';
import ActivityDurationsColumnChart from 'components/Charts/ActivityDurationsColumnChart';
import Efficiency from 'components/Charts/Efficiency';
import CapacityChart from 'components/Charts/CapacityChart';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import CustomButton from 'components/Button';
import CustomDatePicker from 'components/CustomDatePicker/CustomDatePicker';
import InternalPortal from 'components/InternalPortal';
import DashboardSkeltonLoading from 'pages/dashboard/components/DashboardSkeltonLoading';
import StatisticsSkeletongLoading from './StatisticsSkeletongLoading';
import EfficiencySkeletonLoading from './EfficiencySkeletonLoading';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  fetchDashboardData,
  fetchEfficiencyCharts,
  fetchStatisticsCharts,
  setEfficiencyChartData,
  setEfficiencyCompareBranches,
  setSelectedEfficiencyBranches,
  setSelectedDate,
} from 'store/slices/statistics/actions';
import styles from '../../dashboard/Dashboard.module.scss';
import type { EventEmitter } from 'utils/eventEmitter';

function TabPanelCharts({
  eventBus,
  initialized,
  topActionsTargetRef,
  toggleFilterModal,
}: {
  eventBus: EventEmitter<{
    refetch: Record<string, any>;
  }>;
  initialized: boolean;
  topActionsTargetRef: React.RefObject<HTMLElement>;
  toggleFilterModal: () => void;
}) {
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector((state) => state.statistics.dashboard);
  const dashboardLoading = useAppSelector(
    (state) => state.statistics.dashboardLoading,
  );
  const statisticsCharts = useAppSelector(
    (state) => state.statistics.statisticsCharts,
  );
  const statisticsChartLoading = useAppSelector(
    (state) => state.statistics.statisticsChartLoading,
  );
  const efficiencyChartData = useAppSelector(
    (state) => state.statistics.efficiencyChartData,
  );
  const efficiencyChartLoading = useAppSelector(
    (state) => state.statistics.efficiencyChartLoading,
  );
  const efficiencyCompareBranches = useAppSelector(
    (state) => state.statistics.efficiencyCompareBranches,
  );

  const dashboardBranches = useAppSelector(
    (state) => state.statistics.dashboardBranches,
  );
  const selectedDashboardBranches = useAppSelector(
    (state) => state.statistics.selectedDashboardBranches,
  );
  const selectedDashboardRoles = useAppSelector(
    (state) => state.statistics.selectedDashboardRoles,
  );
  const selectedEfficiencyBranches = useAppSelector(
    (state) => state.statistics.selectedEfficiencyBranches,
  );
  const selectedDate = useAppSelector((state) => state.statistics.selectedDate);

  const refreshDisabled =
    !initialized ||
    dashboardLoading ||
    statisticsChartLoading ||
    efficiencyChartLoading;

  const filteredEfficincyBranchOptions = useMemo(() => {
    const unsortedBranches = dashboardBranches
      ?.slice(-3)
      .flatMap((b) => b.options);
    return unsortedBranches.filter((branch) => {
      const findBranchIndex = selectedEfficiencyBranches.findIndex(
        (b) => b?.id === branch?.id,
      );
      if (findBranchIndex !== -1) return false;
      return true;
    });
  }, [dashboardBranches, selectedEfficiencyBranches]);

  useEffect(() => {
    dispatch(setSelectedEfficiencyBranches(selectedDashboardBranches));
  }, [dispatch, selectedDashboardBranches]);

  const swichButton = () => {
    dispatch(setEfficiencyCompareBranches(!efficiencyCompareBranches));
  };

  const handleSelectBranches = (val: any) => {
    dispatch(
      setSelectedEfficiencyBranches([...selectedEfficiencyBranches, val]),
    );
    dispatch(
      fetchEfficiencyCharts({
        branches: [val],
      }),
    );
  };

  const handleRemoveSelectedBranch = (branchId: any) => {
    const updatedData = efficiencyChartData.data.filter(
      (branch: any) => branch.branchId !== branchId,
    );
    const updatedEfficiencyChartData = {
      ...efficiencyChartData,
      data: updatedData,
    };
    dispatch(
      setSelectedEfficiencyBranches(
        selectedEfficiencyBranches.filter((b) => b.id !== branchId),
      ),
    );
    dispatch(setEfficiencyChartData(updatedEfficiencyChartData));
  };

  const handleChangeDate = (date: any) => {
    dispatch(setSelectedDate(date));
    fetchData({
      branches: selectedDashboardBranches,
      roles: selectedDashboardRoles,
      selectedDate: date,
    });
  };

  const fetchData = useCallback(
    async ({
      branches,
      roles,
      selectedDate,
    }: {
      branches?: any;
      roles?: any;
      selectedDate?: any;
    }) => {
      dispatch(
        fetchDashboardData({
          branches,
          roles,
          selectedDate,
        }),
      );

      dispatch(
        fetchStatisticsCharts({
          branches,
          roles,
          selectedDate,
        }),
      );

      dispatch(
        fetchEfficiencyCharts(
          {
            branches,
            roles,
            selectedDate,
          },
          true,
        ),
      );
    },
    [dispatch],
  );

  const handleRefresh = () => {
    fetchData({
      branches: selectedDashboardBranches,
      roles: selectedDashboardRoles,
    });
  };

  const initialFetch = handleRefresh;

  useEffect(() => {
    const handleRefetch = (data: any) => {
      const { branches, roles } = data;
      fetchData({
        branches,
        roles,
      });
    };

    eventBus.on('refetch', handleRefetch);
    return () => {
      eventBus.off('refetch', handleRefetch);
    };
  }, [eventBus, fetchData]);

  useEffect(() => {
    if (
      initialized &&
      !dashboard &&
      !statisticsCharts &&
      !efficiencyChartData
    ) {
      initialFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  return (
    <>
      <InternalPortal targetRef={topActionsTargetRef}>
        <CustomDatePicker
          selected={selectedDate}
          onChange={handleChangeDate}
          containerStyle={{ backgroundColor: 'white' }}
        />
        <CustomButton
          type='button'
          onClick={toggleFilterModal}
          data-qa='reporting-filters'
        >
          Filters
        </CustomButton>
        <Tooltip title='Refresh' placement='top' arrow>
          <IconButton
            sx={{ color: '#4d53e0' }}
            aria-label='refresh'
            disabled={refreshDisabled}
            onClick={handleRefresh}
            data-qa='reporting-refresh'
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </InternalPortal>
      <Stack rowGap={2} data-qa='reports-chart'>
        {/* Dashboard Charts */}
        {dashboardLoading || dashboard === null ? (
          <DashboardSkeltonLoading />
        ) : (
          <>
            <Grid container columns={{ sm: 12, lg: 12 }} spacing={2}>
              <Grid
                size={{
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <DataBox
                  title='Appointments'
                  subtitle={dashboard.todaysTotalEvents}
                  icon={<CalendarMonthIcon />}
                  dataQa='reports-summary-card'
                />
              </Grid>
              <Grid
                size={{
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <DataBox
                  title='Total hours'
                  subtitle={dashboard.todaysTotalDurationOfEvents}
                  icon={<ScheduleIcon />}
                  dataQa='reports-summary-card'
                />
              </Grid>
              <Grid
                size={{
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <DataBox
                  title='Employees'
                  subtitle={dashboard.emplooyeesNumber}
                  icon={<GroupOutlinedIcon />}
                  dataQa='reports-summary-card'
                />
              </Grid>
              <Grid
                size={{
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <DataBox
                  title='Clients'
                  subtitle={dashboard.clientsNumber}
                  icon={<GroupOutlinedIcon />}
                  dataQa='reports-summary-card'
                />
              </Grid>
              <Grid
                size={{
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <DataBox
                  title='Therapist Productivity'
                  subtitle={
                    dashboard.productivity !== null
                      ? dashboard.productivity
                      : '--'
                  }
                  icon={<PercentIcon />}
                  dataQa='reports-chart'
                />
              </Grid>
            </Grid>

            <Stack className={styles.chart} data-qa='reporting-charts'>
              <Typography className={styles.chartTitle}>
                Today's Appointment duration by hour
              </Typography>
              <TodaysActivityDurationsLineChart
                data={dashboard.todaysActivityDurations}
                data-qa='chart-item'
              />
            </Stack>
          </>
        )}

        {/* Statistics Charts */}
        {statisticsChartLoading || statisticsCharts === null ? (
          <StatisticsSkeletongLoading />
        ) : (
          <>
            <Grid
              container
              columns={{ sm: 12, lg: 12 }}
              spacing={2}
              data-qa='reporting-charts'
            >
              <Grid
                size={{
                  sm: 12,
                  lg: 6,
                }}
              >
                <Stack className={styles.chart}>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Typography className={styles.chartTitle}>
                      Appointments count of this week
                    </Typography>
                  </Stack>
                  <AppointmentCountLineChart
                    data={statisticsCharts.appointmentsCount}
                    data-qa='chart-item'
                  />
                </Stack>
              </Grid>
              <Grid
                size={{
                  sm: 12,
                  lg: 6,
                }}
              >
                <Stack className={styles.chart}>
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                  >
                    <Typography className={styles.chartTitle}>
                      Appointment activity durations of this week
                    </Typography>
                  </Stack>
                  <ActivityDurationsColumnChart
                    data={statisticsCharts.activitiesDurations}
                    data-qa='chart-item'
                  />
                </Stack>
              </Grid>
            </Grid>
            <Stack className={styles.chart} data-qa='reporting-charts'>
              <Typography className={styles.chartTitle}>
                Capacity Chart
              </Typography>
              <CapacityChart
                data={statisticsCharts.capacity}
                data-qa='chart-item'
              />
            </Stack>
          </>
        )}

        {efficiencyChartLoading || efficiencyChartData === null ? (
          <EfficiencySkeletonLoading />
        ) : (
          <Stack className={styles.chart} data-qa='reporting-charts'>
            <Stack direction='row' justifyContent='space-between'>
              <Typography className={styles.chartTitle}>Efficiency</Typography>
              <Stack direction='row' alignItems='center' spacing={1}>
                <CustomSwitch
                  checked={efficiencyCompareBranches}
                  onChange={swichButton}
                />
                <Typography color='#6b859e' fontSize='0.75rem'>
                  Compare branches
                </Typography>
              </Stack>
            </Stack>
            {efficiencyCompareBranches &&
              selectedEfficiencyBranches.length < 5 && (
                <Grid
                  container
                  spacing={2}
                  direction='row'
                  columns={12}
                  alignItems='center'
                  mt={0.25}
                >
                  <Grid size={4}>
                    <CustomSelect
                      isMulti={false}
                      options={filteredEfficincyBranchOptions}
                      value={selectedEfficiencyBranches}
                      onChange={handleSelectBranches}
                      name={'select'}
                    />
                  </Grid>
                  <Grid size='auto'>
                    <Stack direction='row' spacing='0.5rem'>
                      {selectedEfficiencyBranches.map((item) => {
                        if (item.id === selectedDashboardBranches[0].id) {
                          return (
                            <Chip
                              label={item.label}
                              key={item.id}
                              variant='outlined'
                            />
                          );
                        }
                        return (
                          <Chip
                            label={item.label}
                            key={item.id}
                            variant='outlined'
                            onDelete={() => handleRemoveSelectedBranch(item.id)}
                          />
                        );
                      })}
                    </Stack>
                  </Grid>
                </Grid>
              )}
            <Efficiency chartData={efficiencyChartData} data-qa='chart-item' />
          </Stack>
        )}
      </Stack>
    </>
  );
}

export default memo(TabPanelCharts);
