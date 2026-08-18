import { useCallback, useEffect, memo } from 'react';
import { Stack, Typography, Tooltip, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import Widget from 'components/Widget/Widget';
import CustomButton from 'components/Button';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import InternalPortal from 'components/InternalPortal';
import ActivityTableTab from './ActivityTableTab';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  setSelectedEndDate,
  setSelectedStartDate,
  fetchStatisticsActivityTable,
} from 'store/slices/statistics/actions';
import isDateRangeMoreThanTheLimit from 'utils/isDateRangeMoreThanTheLimit';
import type { EventEmitter } from 'utils/eventEmitter';

function TabPanelUsersActivities({
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
  const selectedDashboardRoles = useAppSelector(
    (state) => state.statistics.selectedDashboardRoles,
  );
  const selectedStartDate = useAppSelector(
    (state) => state.statistics.selectedStartDate,
  );
  const selectedEndDate = useAppSelector(
    (state) => state.statistics.selectedEndDate,
  );
  const selectedType = useAppSelector((state) => state.statistics.selectedType);
  const activityTableLoading = useAppSelector(
    (state) => state.statistics.activityTableLoading,
  );

  const refreshDisabled = !initialized || activityTableLoading;

  const handleChangeActivityTableDate = (startDate: any, endDate: any) => {
    if (isDateRangeMoreThanTheLimit(startDate, endDate)) {
      return toast.error('Date range cannot be more than 31 days!');
    }

    dispatch(setSelectedStartDate(startDate));
    dispatch(setSelectedEndDate(endDate));

    fetchData({
      branches: selectedDashboardBranches,
      roles: selectedDashboardRoles,
      type: selectedType?.value || '',
      selectedStartDate: startDate,
      selectedEndDate: endDate,
    });
  };

  const fetchData = useCallback(
    async ({
      branches,
      roles,
      type,
      selectedStartDate,
      selectedEndDate,
    }: {
      branches?: any;
      roles?: any;
      type?: string;
      selectedStartDate: any;
      selectedEndDate: any;
    }) =>
      dispatch(
        fetchStatisticsActivityTable({
          branches,
          roles,
          type,
          selectedStartDate,
          selectedEndDate,
        }),
      ),
    [dispatch],
  );

  const handleRefresh = () => {
    fetchData({
      branches: selectedDashboardBranches,
      roles: selectedDashboardRoles,
      type: selectedType?.value || '',
      selectedStartDate,
      selectedEndDate,
    });
  };

  const initialFetch = handleRefresh;

  useEffect(() => {
    const handleRefetch = (data: {
      branches?: any;
      roles?: any;
      type?: string;
      selectedStartDate: any;
      selectedEndDate: any;
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
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          onSubmit={handleChangeActivityTableDate}
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
            <h4>Users Activities</h4>
            <Typography fontSize='.75rem'>
              *Please note if an activity column is not showing it means there
              is 0 appointments for that activity
            </Typography>
          </Stack>
        }
      >
        <ActivityTableTab />
      </Widget>
    </>
  );
}

export default memo(TabPanelUsersActivities);
