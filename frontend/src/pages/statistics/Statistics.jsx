import { Alert, Backdrop, Box, Dialog, Stack, styled } from '@mui/material';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Tabs, Tab, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomButton from 'components/Button';
import StatisticsFilter from './components/StatisticsFilter';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  fetchDashboardBranches,
  clearAllStates,
} from 'store/slices/statistics/actions';
import FilteredItems from 'pages/dashboard/components/FilteredItems';
import config from 'config';
import TabPanel from '../../components/TabPanel/TabPanel';
import { useNavigate, useLocation } from 'react-router';
import TabPanelCharts from './components/TabPanelCharts';
import TabPanelUsersActivities from './components/TabPanelUsersActivities';
import TabPanelBranchActivities from './components/TabPanelBranchActivities';
import TabPanelAuthorization from './components/TabPanelAuthorization';
import TabPanelStaffTracker from './components/TabPanelStaffTracker';
import { EventEmitter } from 'utils/eventEmitter';

const DisabledOverlay = ({ children, disabled }) => (
  <div style={{ position: 'relative' }}>
    {children}
    {disabled && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent', // Can be set to a semi-transparent color if needed
          cursor: 'not-allowed',
          zIndex: 2, // Ensure this is above the children in z-index
        }}
      ></div>
    )}
  </div>
);

const Statistics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const dashboardLoading = useAppSelector(
    (state) => state.statistics.dashboardLoading,
  );
  const branchActivitiesTableLoading = useAppSelector(
    (state) => state.statistics.branchActivitiesTableLoading,
  );
  const staffTrackerLoading = useAppSelector(
    (state) => state.statistics.staffTrackerLoading,
  );
  const statisticsChartLoading = useAppSelector(
    (state) => state.statistics.statisticsChartLoading,
  );
  const activityTableLoading = useAppSelector(
    (state) => state.statistics.activityTableLoading,
  );
  const selectedDashboardBranches = useAppSelector(
    (state) => state.statistics.selectedDashboardBranches,
  );

  const eventBus = useMemo(() => new EventEmitter(), []);

  const topActionsTargetRef = useRef(null);

  const getTabFromURL = () => {
    const query = new URLSearchParams(location.search);
    const tab = query.get('tab');
    return tab ? parseInt(tab, 10) : 0;
  };

  const [modalFilter, setModalFilter] = useState(false);
  const [statisticsTab, setStatisticsTab] = useState(getTabFromURL());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!location.search.includes('tab')) {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set('tab', 0);
      navigate(
        {
          pathname: location.pathname,
          search: queryParams.toString(),
        },
        {
          replace: true,
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]);

  useEffect(() => {
    const init = async () => {
      const success = await dispatch(fetchDashboardBranches());
      if (success) {
        setInitialized(true);
      }
    };

    init();
  }, [dispatch]);

  const toggleModal = useCallback(() => {
    setModalFilter((prev) => !prev);
  }, []);

  const toggleFilterModal = useCallback(() => {
    setModalFilter((prev) => !prev);
  }, []);

  const handleTabChange = (newTabIndex) => {
    setStatisticsTab(newTabIndex);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set('tab', newTabIndex);

    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  const loadingDisabled =
    dashboardLoading ||
    statisticsChartLoading ||
    activityTableLoading ||
    branchActivitiesTableLoading ||
    staffTrackerLoading;

  const handleChangeTab = (_, newValue) => {
    dispatch(clearAllStates());
    handleTabChange(newValue);
  };

  return (
    <>
      <DisabledOverlay disabled={loadingDisabled}>
        <Stack spacing={2}>
          <h1 style={{ margin: 0 }}>Statistics</h1>
          {/* Filters */}
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            columnGap='1rem'
            rowGap='10px'
          >
            <FilteredItems />
            <Stack
              ref={topActionsTargetRef}
              height='42px'
              direction='row'
              spacing={1.5}
            >
              {selectedDashboardBranches.length === 0 && (
                <>
                  <CustomButton type='button' onClick={toggleFilterModal}>
                    Filters
                  </CustomButton>
                  <IconButton
                    sx={{ color: '#4d53e0' }}
                    aria-label='refresh'
                    disabled={true}
                  >
                    <RefreshIcon />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>
          {selectedDashboardBranches.length !== 0 ? (
            <>
              <Stack>
                <Tabs value={statisticsTab} onChange={handleChangeTab}>
                  <Tab
                    label='Charts'
                    data-qa={
                      statisticsTab === 0
                        ? 'active-tab'
                        : 'reporting-charts-tab'
                    }
                  />
                  <Tab
                    label='User Activities'
                    data-qa={
                      statisticsTab === 1
                        ? 'active-tab'
                        : 'reporting-user-activities-tab'
                    }
                  />
                  <Tab
                    label='Branch Activities'
                    data-qa={
                      statisticsTab === 2
                        ? 'active-tab'
                        : 'reporting-branch-activities-tab'
                    }
                  />
                  <Tab
                    label='Authorization Table'
                    data-qa={
                      statisticsTab === 3
                        ? 'active-tab'
                        : 'reports-authorization-tab'
                    }
                  />
                  {config.staffTrackerEnabled && (
                    <Tab
                      label='Staff Tracker'
                      data-qa={
                        statisticsTab === 4
                          ? 'active-tab'
                          : 'reporting-staff-tracker-tab'
                      }
                    />
                  )}
                </Tabs>
              </Stack>
              {/* Charts */}
              <TabPanel value={statisticsTab} index={0}>
                <TabPanelCharts
                  initialized={initialized}
                  eventBus={eventBus}
                  topActionsTargetRef={topActionsTargetRef}
                  toggleFilterModal={toggleFilterModal}
                />
              </TabPanel>

              {/* Tables */}
              <TabPanel value={statisticsTab} index={1}>
                <TabPanelUsersActivities
                  initialized={initialized}
                  eventBus={eventBus}
                  topActionsTargetRef={topActionsTargetRef}
                  toggleFilterModal={toggleFilterModal}
                />
              </TabPanel>

              {/* Tables 2 */}
              <TabPanel value={statisticsTab} index={2}>
                <TabPanelBranchActivities
                  initialized={initialized}
                  eventBus={eventBus}
                  topActionsTargetRef={topActionsTargetRef}
                  toggleFilterModal={toggleFilterModal}
                />
              </TabPanel>

              {/* Authorization Table */}
              <TabPanel
                value={statisticsTab}
                index={3}
                style={{ overflow: 'unset' }}
              >
                <TabPanelAuthorization
                  initialized={initialized}
                  eventBus={eventBus}
                  topActionsTargetRef={topActionsTargetRef}
                  toggleFilterModal={toggleFilterModal}
                />
              </TabPanel>

              {/* Staff tracker */}
              {config.staffTrackerEnabled && (
                <TabPanel value={statisticsTab} index={4}>
                  <TabPanelStaffTracker
                    initialized={initialized}
                    eventBus={eventBus}
                    topActionsTargetRef={topActionsTargetRef}
                    toggleFilterModal={toggleFilterModal}
                  />
                </TabPanel>
              )}
            </>
          ) : (
            <Box pt={2} minHeight='65vh'>
              <Alert
                severity='warning'
                sx={{
                  justifyContent: 'center',
                  textAlign: 'center',
                  alignItems: 'center',
                  boxShadow: '0 0 3px rgba(0,0,0,0.05)',
                  border: '1px solid #f0ad4e88',
                  borderRadius: '8px',
                }}
              >
                No branch is selected, please go to filters and select a branch
              </Alert>
            </Box>
          )}
        </Stack>
        <StatisticsFilter
          loadingDisabled={loadingDisabled}
          modalFilter={modalFilter}
          toggleModal={toggleModal}
          eventBus={eventBus}
        />
      </DisabledOverlay>
    </>
  );
};

export default Statistics;
