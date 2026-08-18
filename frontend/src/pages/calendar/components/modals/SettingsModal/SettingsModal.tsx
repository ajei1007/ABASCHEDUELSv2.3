import { memo, useCallback, useRef } from 'react';
import { Stack } from '@mui/material';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { selectSettingsModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleSettingsModalOpen,
  hideSettingsModal,
} from 'store/slices/calendarOverlayingPanels/actions';
import SettingsModalContent from './SettingsModalContent';

const SettingsModal = () => {
  const dispatch = useAppDispatch();
  const settingsModalOpen = useAppSelector(selectSettingsModalOpen);

  const actionButtonsTargetRef = useRef(null);

  const handleClose = () => {
    dispatch(hideSettingsModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleSettingsModalOpen());
  }, []);

  return (
    <CustomModal
      open={settingsModalOpen}
      onClose={handleClose}
      aria-labelledby='Settings Modal'
      aria-describedby='Settings Modal For Scheduler'
      title='Settings'
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <SettingsModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleModalOpen}
      />
    </CustomModal>
  );
};

SettingsModal.displayName = 'SettingsModal';

export default memo(SettingsModal);
