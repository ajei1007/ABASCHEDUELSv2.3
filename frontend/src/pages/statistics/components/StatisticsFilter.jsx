import CustomModal from 'components/Modal';
import CustomButton from 'components/Button';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { Grid2 as Grid } from '@mui/material';
import { typeFieldOptions } from '../constants/selectOptions';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setSelectedDashboardBranches,
  setSelectedDashboardRoles,
  setSelectedType,
  fetchDashboardRoles,
} from 'store/slices/statistics/actions';
import { STATISTICS_OR_DASHBOARD } from '../constants/statisticsOrDashboard';

const StatisticsFilter = ({
  loadingDisabled,
  modalFilter,
  toggleModal,
  eventBus,
  type = STATISTICS_OR_DASHBOARD.STATISTICS,
}) => {
  const dispatch = useAppDispatch();
  const selectedType = useAppSelector((state) => state.statistics.selectedType);
  const dashboardBranches = useAppSelector(
    (state) => state.statistics.dashboardBranches,
  );
  const selectedDashboardBranches = useAppSelector(
    (state) => state.statistics.selectedDashboardBranches,
  );
  const dashboardRoles = useAppSelector(
    (state) => state.statistics.dashboardRoles,
  );
  const dashboardRolesFetchStatus = useAppSelector(
    (state) => state.statistics.dashboardRolesFetchStatus,
  );
  const selectedDashboardRoles = useAppSelector(
    (state) => state.statistics.selectedDashboardRoles,
  );

  const selectedDate = useAppSelector((state) => state.statistics.selectedDate);
  const selectedStartDate = useAppSelector(
    (state) => state.statistics.selectedStartDate,
  );
  const selectedEndDate = useAppSelector(
    (state) => state.statistics.selectedEndDate,
  );
  const selectedBranchActivitiesStartDate = useAppSelector(
    (state) => state.statistics.selectedBranchActivitiesStartDate,
  );
  const selectedBranchActivitiesEndDate = useAppSelector(
    (state) => state.statistics.selectedBranchActivitiesEndDate,
  );
  const selectedAuthorizationStartDate = useAppSelector(
    (state) => state.statistics.selectedAuthorizationStartDate,
  );
  const selectedAuthorizationEndDate = useAppSelector(
    (state) => state.statistics.selectedAuthorizationEndDate,
  );
  const selectedStaffTrackerDate = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerDate,
  );

  // Handlers
  const handleSelectType = (val) => dispatch(setSelectedType(val));
  const handleSelectBranches = (val) =>
    dispatch(setSelectedDashboardBranches([val]));
  const handleSelectRoles = (values) =>
    dispatch(setSelectedDashboardRoles(values));

  const handleApplyFilter = async () => {
    toggleModal();
    eventBus.emit('refetch', {
      branches: selectedDashboardBranches,
      roles: selectedDashboardRoles,
      type: selectedType?.value || '',
      //
      selectedDate,
      selectedStartDate,
      selectedEndDate,
      selectedAuthorizationStartDate,
      selectedAuthorizationEndDate,
      selectedStaffTrackerDate,
      selectedBranchActivitiesStartDate,
      selectedBranchActivitiesEndDate,
    });
  };

  return (
    <CustomModal
      open={modalFilter}
      onClose={toggleModal}
      aria-describedby='Filter Modal For Scheduler'
      title='Filter'
      actionbuttons={
        <>
          <CustomButton
            disabled={loadingDisabled}
            onClick={handleApplyFilter}
            data-qa='reports-apply-filters'
          >
            Apply
          </CustomButton>
          <CustomButton onClick={toggleModal} variant='outlined'>
            Cancel
          </CustomButton>
        </>
      }
    >
      <Grid container rowSpacing={1} columnSpacing={{ sm: '1rem' }}>
        {type === STATISTICS_OR_DASHBOARD.STATISTICS && (
          <>
            <Grid size={12}>
              <label>Type</label>
              <CustomSelect
                options={typeFieldOptions}
                value={selectedType}
                onChange={handleSelectType}
              />
            </Grid>
          </>
        )}
        <Grid size={12}>
          <label>Branches</label>
          <CustomSelect
            options={dashboardBranches}
            value={selectedDashboardBranches[0] ?? null}
            onChange={handleSelectBranches}
            isClearable={false}
          />
        </Grid>
        <Grid size={12}>
          <label>Roles</label>
          <CustomSelect
            isMulti
            options={dashboardRoles}
            onFocus={() => {
              dispatch(fetchDashboardRoles());
            }}
            isLoading={dashboardRolesFetchStatus === 'loading'}
            placeholder={
              dashboardRolesFetchStatus === 'loading'
                ? 'Loading options...'
                : 'Select an option...'
            }
            noOptionsMessage={() =>
              dashboardRolesFetchStatus === 'success' &&
              dashboardRoles.length === 0
                ? 'No options available'
                : 'Click to load options'
            }
            value={selectedDashboardRoles}
            onChange={handleSelectRoles}
          />
        </Grid>
      </Grid>
    </CustomModal>
  );
};

export default StatisticsFilter;
