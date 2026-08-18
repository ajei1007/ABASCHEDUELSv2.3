import { useCallback, useEffect, memo } from 'react';
import { Stack, Typography, Tooltip, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  setSelectedBranchActivitiesStartDate,
  setSelectedBranchActivitiesEndDate,
  fetchStatisticsBranchActivitiesTable,
} from 'store/slices/statistics/actions';
import Widget from 'components/Widget/Widget';
import CustomButton from 'components/Button';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import InternalPortal from 'components/InternalPortal';
import BranchActivitiesTableTab from './BranchActivitiesTableTab';
import type { EventEmitter } from 'utils/eventEmitter';

function TabPanelBranchActivities({
  eventBus,
  initialized,
  topActionsTargetRef,
  toggleFilterModal,
}: {
  eventBus: EventEmitter<{
    refetch: any;
  }>;
  initialized: boolean;
  topActionsTargetRef: React.RefObject<HTMLElement>;
  toggleFilterModal: () => void;
}) {
  const dispatch = useAppDispatch();
  const selectedDashboardBranches = useAppSelector(
    (state) => state.statistics.selectedDashboardBranches,
  );
  const selectedBranchActivitiesStartDate = useAppSelector(
    (state) => state.statistics.selectedBranchActivitiesStartDate,
  );

  const selectedBranchActivitiesEndDate = useAppSelector(
    (state) => state.statistics.selectedBranchActivitiesEndDate,
  );
  const branchActivitiesTableLoading = useAppSelector(
    (state) => state.statistics.branchActivitiesTableLoading,
  );

  const refreshDisabled = !initialized || branchActivitiesTableLoading;

  const handleChangeBranchActivitiesTableDate = (
    startDate: any,
    endDate: any,
  ) => {
    // if (isDateRangeMoreThanTheLimit(startDate, endDate, 180) && selectedPeriod.value === 'weekly') {
    //   return toast.error('Date range cannot be more than 6 months in weekly period!')
    // }
    dispatch(setSelectedBranchActivitiesStartDate(startDate));
    dispatch(setSelectedBranchActivitiesEndDate(endDate));

    fetchData({
      branches: selectedDashboardBranches,
      selectedBranchActivitiesStartDate: startDate,
      selectedBranchActivitiesEndDate: endDate,
    });
  };

  const fetchData = useCallback(
    async ({
      branches,
      roles,
      selectedBranchActivitiesStartDate,
      selectedBranchActivitiesEndDate,
    }: {
      branches?: any;
      roles?: any;
      selectedBranchActivitiesStartDate?: any;
      selectedBranchActivitiesEndDate?: any;
    } = {}) =>
      dispatch(
        fetchStatisticsBranchActivitiesTable({
          branches,
          roles,
          selectedBranchActivitiesStartDate,
          selectedBranchActivitiesEndDate,
        }),
      ),
    [dispatch],
  );

  const handleRefresh = () => {
    fetchData({
      branches: selectedDashboardBranches,
    });
  };

  const initialFetch = handleRefresh;

  useEffect(() => {
    const handleRefetch = (data: {
      branches?: any;
      roles?: any;
      selectedBranchActivitiesStartDate: any;
      selectedBranchActivitiesEndDate: any;
    }) => {
      fetchData(data);
    };

    eventBus.on('refetch', handleRefetch);
    return () => {
      eventBus.off('refetch', handleRefetch);
    };
  }, [eventBus, fetchData]);

  useEffect(() => {
    if (initialized) {
      initialFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  return (
    <>
      <InternalPortal targetRef={topActionsTargetRef}>
        <CustomDateRangePicker
          startDate={selectedBranchActivitiesStartDate}
          endDate={selectedBranchActivitiesEndDate}
          onSubmit={handleChangeBranchActivitiesTableDate}
          containerStyle={{ backgroundColor: 'white' }}
          data-qa='reporting'
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
      <Widget
        className='widget-p-md'
        title={
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <h4>Branch Activities</h4>
            <Typography fontSize='.75rem'>
              *Please note if an activity column is not showing it means there
              is 0 appointments for that activity
            </Typography>
          </Stack>
        }
      >
        <BranchActivitiesTableTab />
      </Widget>
    </>
  );
}

export default memo(TabPanelBranchActivities);
