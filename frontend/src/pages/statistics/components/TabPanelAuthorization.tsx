import { useEffect, memo } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  fetchStatisticsAuthorizationTable,
  setSelectedAuthorizationStartDate,
  setSelectedAuthorizationEndDate,
} from 'store/slices/statistics/actions';
import Widget from 'components/Widget/Widget';
import AuthorizationTab from './AuthorizationTab';
import InternalPortal from 'components/InternalPortal';
import CustomButton from 'components/Button';
import CustomDateRangePicker from 'components/CustomDateRangePicker/CustomDateRangePicker';
import isDateRangeMoreThanTheLimit from 'utils/isDateRangeMoreThanTheLimit';
import type { EventEmitter } from 'utils/eventEmitter';

function TabPanelAuthorization({
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
  const selectedType = useAppSelector((state) => state.statistics.selectedType);
  const selectedAuthorizationStartDate = useAppSelector(
    (state) => state.statistics.selectedAuthorizationStartDate,
  );
  const selectedAuthorizationEndDate = useAppSelector(
    (state) => state.statistics.selectedAuthorizationEndDate,
  );
  const authorizationTableLoading = useAppSelector(
    (state) => state.statistics.authorizationTableLoading,
  );

  const refreshDisabled = !initialized || authorizationTableLoading;

  const handleChangeAuthorizationTableDate = (startDate: any, endDate: any) => {
    if (isDateRangeMoreThanTheLimit(startDate, endDate)) {
      return toast.error('Date range cannot be more than 31 days!');
    }

    dispatch(setSelectedAuthorizationStartDate(startDate));
    dispatch(setSelectedAuthorizationEndDate(endDate));
    dispatch(
      fetchStatisticsAuthorizationTable({
        branches: selectedDashboardBranches,
        roles: selectedDashboardRoles,
        type: selectedType?.value || '',
        selectedAuthorizationStartDate: startDate,
        selectedAuthorizationEndDate: endDate,
      }),
    );
  };

  const handleRefresh = () => {
    dispatch(
      fetchStatisticsAuthorizationTable({
        branches: selectedDashboardBranches,
        roles: selectedDashboardRoles,
        type: selectedType?.value || '',
      }),
    );
  };

  const initialFetch = handleRefresh;

  useEffect(() => {
    const handleRefetch = (data: {
      branches?: any;
      roles?: any;
      type?: string;
      selectedAuthorizationStartDate: any;
      selectedAuthorizationEndDate: any;
    }) => {
      dispatch(fetchStatisticsAuthorizationTable(data));
    };

    eventBus.on('refetch', handleRefetch);
    return () => {
      eventBus.off('refetch', handleRefetch);
    };
  }, [eventBus, dispatch]);

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
          startDate={selectedAuthorizationStartDate}
          endDate={selectedAuthorizationEndDate}
          onSubmit={handleChangeAuthorizationTableDate}
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
            data-qa='reports-loading'
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </InternalPortal>
      <Widget className='widget-p-md' title={<h4>Authorization Table</h4>}>
        <AuthorizationTab />
      </Widget>
    </>
  );
}

export default memo(TabPanelAuthorization);
