import { memo, useCallback, useEffect, useRef } from 'react';
import { Stack } from '@mui/material';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectFiltersModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleFiltersModalOpen,
  hideFiltersModal,
} from 'store/slices/calendarOverlayingPanels/actions';
import FiltersModalContent from './FiltersModalContent';
import { useCalendarSelectedResourcesContext } from 'pages/calendar/context/CalendarSelectedResourcesContext';

const FiltersModal = () => {
  const dispatch = useAppDispatch();
  const filtersModalOpen = useAppSelector(selectFiltersModalOpen);
  const settingValuesSubgroupsFilter = useAppSelector(
    (state) => state.settings.settingValues.subgroupsFilter,
  );
  const settingValuesRoleFilter = useAppSelector(
    (state) => state.settings.settingValues.roleFilter,
  );
  const settingValuesIsolatedResources = useAppSelector(
    (state) => state.settings.settingValues.isolatedResources,
  );

  const { resetAnySelected } = useCalendarSelectedResourcesContext();

  const actionButtonsTargetRef = useRef(null);

  const handleClose = () => {
    dispatch(hideFiltersModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleFiltersModalOpen());
  }, []);

  useEffect(() => {
    if (
      settingValuesSubgroupsFilter.length > 0 ||
      settingValuesRoleFilter.length > 0 ||
      settingValuesIsolatedResources.length > 0
    ) {
      resetAnySelected();
    }
  }, [
    settingValuesSubgroupsFilter,
    settingValuesRoleFilter,
    settingValuesIsolatedResources,
    resetAnySelected,
  ]);

  return (
    <CustomModal
      open={filtersModalOpen}
      onClose={handleClose}
      aria-labelledby='Filters Modal'
      aria-describedby='Filters Modal For Scheduler'
      title='Filters'
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <FiltersModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleModalOpen}
      />
    </CustomModal>
  );
};

export default memo(FiltersModal);
