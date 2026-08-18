import { useState, useEffect, memo } from 'react';
import {
  Chip,
  CircularProgress,
  Stack,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomButton from 'components/Button';
import CustomSwitch from 'components/CustomSwitch/CustomSwitch';
import CustomDatePicker from 'components/CustomDatePicker/CustomDatePicker';
import Widget from 'components/Widget/Widget';
import InternalPortal from 'components/InternalPortal';
import {
  CustomIconButton,
  iconProps,
} from 'pages/calendar/components/ParameterButtons';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setStaffTrackerView,
  setSelectedStaffTrackerDate,
  fetchStaffingEquilibriumOptimizer,
  fetchStaffTrackerSettings,
  fetchStaffTrackerData,
} from 'store/slices/statistics/actions';
import StaffTrackerTab from './StaffTrackerTab';
import checkCompanyPlanFeature from 'utils/checkCompanyPlanFeature';
import role_permissions from 'helpers/role_permissions';
import StaffTrackerModal from './StaffTrackerModal';
import StaffEquilibriumOptimizerModal from './StaffEquilibriumOptimizerModal';
import type { EventEmitter } from 'utils/eventEmitter';

function TabPanelStaffTracker({
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
  const selectedStaffTrackerBranches = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerBranches,
  );
  const selectedStaffTrackerRoles = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerRoles,
  );
  const selectedStaffTrackerBranchType = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerBranchType,
  );
  const selectedStaffTrackerActivities = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerActivities,
  );
  const staffTrackerView = useAppSelector(
    (state) => state.statistics.staffTrackerView,
  );
  const staffingEquilibriumOptimizerLoading = useAppSelector(
    (state) => state.statistics.staffingEquilibriumOptimizerLoading,
  );
  const staffTrackerLoading = useAppSelector(
    (state) => state.statistics.staffTrackerLoading,
  );
  const membership = useAppSelector(
    (state) => state.settings.settingsCompany.company.membership,
  );

  const currentUser = useAppSelector((store) => store.auth.currentUser);
  const selectedStaffTrackerDate = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerDate,
  );

  const [staffTrackerModalFilter, setStaffTrackerModalFilter] = useState(false);

  const refreshDisabled = !initialized || staffTrackerLoading;

  const filterItemsArray = selectedStaffTrackerBranches.concat(
    selectedStaffTrackerActivities,
  );

  const toggleStaffTrackerModalFilter = () => {
    setStaffTrackerModalFilter((prev) => !prev);
  };

  const handleChangeStaffTrackerDate = (date: any) => {
    dispatch(setSelectedStaffTrackerDate(date));
  };

  const handleRefresh = () => {
    dispatch(
      fetchStaffTrackerData({
        branches: selectedStaffTrackerBranches ?? [],
        activities: selectedStaffTrackerActivities ?? [],
        branchType: selectedStaffTrackerBranchType,
        roles: selectedStaffTrackerRoles,
        selectedStaffTrackerDate,
      }),
    );
  };

  useEffect(() => {
    const handleRefetch = ({
      selectedStaffTrackerDate,
    }: {
      selectedStaffTrackerDate: any;
    }) => {
      dispatch(
        fetchStaffTrackerData({
          selectedStaffTrackerDate,
        }),
      );
    };

    eventBus.on('refetch', handleRefetch);
    return () => {
      eventBus.off('refetch', handleRefetch);
    };
  }, [eventBus, dispatch]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const initialFetch = async () => {
      const settingsCompany = await dispatch(fetchStaffTrackerSettings());
      dispatch(
        fetchStaffTrackerData({
          branches: settingsCompany?.staffTrackerBranches ?? [],
          activities: settingsCompany?.staffTrackerActivities ?? [],
          branchType: settingsCompany?.staffTrackerBranchType,
          roles: settingsCompany?.staffTrackerRoles,
        }),
      );
    };

    initialFetch();
  }, [initialized, dispatch]);
  return (
    <>
      <InternalPortal targetRef={topActionsTargetRef}>
        <CustomDatePicker
          selected={selectedStaffTrackerDate}
          onChange={handleChangeStaffTrackerDate}
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
      <Widget
        className='widget-p-md'
        title={
          <Stack direction='row' justifyContent='space-between'>
            <h4>Staff Tracker</h4>
            <Stack direction='row' spacing={2}>
              {filterItemsArray.length > 0 && (
                <Stack direction='row' alignItems='center' spacing={1}>
                  {filterItemsArray.map((item: any) => (
                    <Chip label={item.label} key={item.id} variant='outlined' />
                  ))}
                </Stack>
              )}
              <Stack direction='row' alignItems='center' spacing={1}>
                <CustomSwitch
                  checked={staffTrackerView}
                  onChange={() =>
                    dispatch(setStaffTrackerView(!staffTrackerView))
                  }
                />
                <Typography color='#6b859e' fontSize='0.875rem'>
                  {staffTrackerView ? 'After Transfers' : 'Before Transfers'}
                </Typography>
              </Stack>
              {/* Staffing Equilibrium Optimizer */}
              {checkCompanyPlanFeature(membership, 'optimizer') &&
                role_permissions(currentUser, 'optimizerFeature') && (
                  <div className='control-button-group'>
                    <CustomIconButton
                      name='Staffing Equilibrium Optimizer'
                      onClick={() =>
                        dispatch(fetchStaffingEquilibriumOptimizer())
                      }
                      disabled={staffingEquilibriumOptimizerLoading}
                    >
                      {staffingEquilibriumOptimizerLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SmartToyOutlinedIcon {...iconProps()} />
                      )}
                    </CustomIconButton>
                  </div>
                )}
              <CustomButton
                type='button'
                onClick={toggleStaffTrackerModalFilter}
              >
                Settings
              </CustomButton>
            </Stack>
          </Stack>
        }
      >
        <StaffTrackerTab />
      </Widget>
      <StaffTrackerModal
        modalFilter={staffTrackerModalFilter}
        toggleModal={toggleStaffTrackerModalFilter}
      />
      <StaffEquilibriumOptimizerModal />
    </>
  );
}

export default memo(TabPanelStaffTracker);
