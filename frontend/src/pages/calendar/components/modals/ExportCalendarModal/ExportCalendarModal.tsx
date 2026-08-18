import { memo, useCallback, useRef } from 'react';
import { Stack } from '@mui/material';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectExportCalendarModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleExportCalendarModalOpen,
  hideExportCalendarModal,
} from 'store/slices/calendarOverlayingPanels/actions';
import ExportCalendarModalContent from './ExportCalendarModalContent';

const ExportCalendarModal = () => {
  const dispatch = useAppDispatch();
  const exportCalendarModalOpen = useAppSelector(selectExportCalendarModalOpen);

  const actionButtonsTargetRef = useRef(null);

  const handleClose = () => {
    dispatch(hideExportCalendarModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleExportCalendarModalOpen());
  }, []);

  return (
    <CustomModal
      open={exportCalendarModalOpen}
      onClose={handleClose}
      aria-labelledby='Export Calendar'
      aria-describedby='Export Calendar'
      title={'Export Calendar'}
      maxWidth='sm'
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <ExportCalendarModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleModalOpen}
      />
    </CustomModal>
  );
};

export default memo(ExportCalendarModal);
