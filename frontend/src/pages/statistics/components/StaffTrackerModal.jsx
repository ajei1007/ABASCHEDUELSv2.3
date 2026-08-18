import CustomModal from 'components/Modal';
import CustomButton from 'components/Button';
import CustomSelect from 'components/CustomSelect/CustomSelect';
import { Grid2 as Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  fetchStaffTrackerData,
  fetchDashboardRoles,
  fetchStaffTrackerBranchTypes,
  fetchActivityResources,
  setSelectedStaffTrackerActivities,
  setSelectedStaffTrackerBranchType,
  setSelectedStaffTrackerBranches,
  setSelectedStaffTrackerRoles,
  updateStaffTrackerSettings,
} from 'store/slices/statistics/actions';

const StaffTrackerModal = ({ modalFilter, toggleModal }) => {
  const dispatch = useAppDispatch();
  const dashboardBranches = useAppSelector(
    (state) => state.statistics.dashboardBranches,
  );
  const dashboardRoles = useAppSelector(
    (state) => state.statistics.dashboardRoles,
  );
  const dashboardRolesFetchStatus = useAppSelector(
    (state) => state.statistics.dashboardRolesFetchStatus,
  );
  const selectedStaffTrackerBranches = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerBranches,
  );
  const selectedStaffTrackerActivities = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerActivities,
  );
  const selectedStaffTrackerRoles = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerRoles,
  );
  const selectedStaffTrackerBranchType = useAppSelector(
    (state) => state.statistics.selectedStaffTrackerBranchType,
  );
  const staffTrackerBranchTypes = useAppSelector(
    (state) => state.statistics.staffTrackerBranchTypes,
  );
  const staffTrackerBranchTypesFetchStatus = useAppSelector(
    (state) => state.statistics.staffTrackerBranchTypesFetchStatus,
  );
  const staffTrackerLoading = useAppSelector(
    (state) => state.statistics.staffTrackerLoading,
  );
  const activityResources = useAppSelector(
    (state) => state.statistics.activityResources,
  );
  const activityResourcesFetchStatus = useAppSelector(
    (state) => state.statistics.activityResourcesFetchStatus,
  );

  const handleSelectBranches = (val) =>
    dispatch(setSelectedStaffTrackerBranches([val]));
  const handleSelectBranchType = (val) =>
    dispatch(setSelectedStaffTrackerBranchType(val));
  const handleSelectActivities = (val) =>
    dispatch(setSelectedStaffTrackerActivities(val));
  const handleSelectRoles = (values) =>
    dispatch(setSelectedStaffTrackerRoles(values));

  const handleUpdateSettings = () => {
    dispatch(
      updateStaffTrackerSettings({
        branches: selectedStaffTrackerBranches,
        activities: selectedStaffTrackerActivities,
        roles: selectedStaffTrackerRoles,
        branchType: selectedStaffTrackerBranchType,
      }),
    );
    toggleModal();
  };

  const handleApplyFilter = async () => {
    dispatch(
      fetchStaffTrackerData({
        branches: selectedStaffTrackerBranches,
        activities: selectedStaffTrackerActivities,
        branchType: selectedStaffTrackerBranchType,
      }),
    );
    toggleModal();
  };

  const handleFocusActivities = () => {
    dispatch(fetchActivityResources(selectedStaffTrackerBranches?.[0]?.id));
  };

  return (
    <CustomModal
      open={modalFilter}
      onClose={toggleModal}
      aria-describedby='Staff Tracker Settings'
      title='Staff Tracker Settings'
      actionbuttons={
        <>
          <CustomButton
            disabled={staffTrackerLoading}
            onClick={handleApplyFilter}
            data-qa='staff-tracker-apply'
          >
            Apply
          </CustomButton>
          <CustomButton
            onClick={handleUpdateSettings}
            variant='outlined'
            data-qa='staff-tracker-save-default'
          >
            Save As Default
          </CustomButton>
          <CustomButton
            onClick={toggleModal}
            variant='outlined'
            data-qa='staff-tracker-cancel'
          >
            Cancel
          </CustomButton>
        </>
      }
      data-qa='staff-tracker-modal'
    >
      <Grid container rowSpacing={1} columnSpacing={{ sm: '1rem' }}>
        <Grid size={12}>
          <label>Branch</label>
          <CustomSelect
            options={dashboardBranches}
            value={selectedStaffTrackerBranches[0]}
            onChange={handleSelectBranches}
          />
        </Grid>
        <Grid size={12}>
          <label>Branch Type</label>
          <CustomSelect
            onFocus={() => {
              dispatch(fetchStaffTrackerBranchTypes());
            }}
            isLoading={staffTrackerBranchTypesFetchStatus === 'loading'}
            placeholder={
              staffTrackerBranchTypesFetchStatus === 'loading'
                ? 'Loading options...'
                : 'Select an option...'
            }
            noOptionsMessage={() =>
              staffTrackerBranchTypesFetchStatus === 'success' &&
              staffTrackerBranchTypes.length === 0
                ? 'No options available'
                : 'Click to load options'
            }
            options={staffTrackerBranchTypes}
            value={selectedStaffTrackerBranchType}
            onChange={handleSelectBranchType}
          />
        </Grid>
        <Grid size={12}>
          <label>Activities</label>
          <CustomSelect
            isLoading={activityResourcesFetchStatus === 'loading'}
            placeholder={
              activityResourcesFetchStatus === 'loading'
                ? 'Loading options...'
                : 'Select options...'
            }
            noOptionsMessage={() =>
              activityResourcesFetchStatus === 'success' &&
              activityResources.length === 0
                ? 'No options available'
                : 'Click to load options'
            }
            options={
              activityResourcesFetchStatus === 'success'
                ? activityResources
                : []
            }
            value={selectedStaffTrackerActivities}
            onFocus={handleFocusActivities}
            onChange={handleSelectActivities}
            isMulti
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
            value={selectedStaffTrackerRoles}
            onChange={handleSelectRoles}
          />
        </Grid>
      </Grid>
    </CustomModal>
  );
};

export default StaffTrackerModal;
