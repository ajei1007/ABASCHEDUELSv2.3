import { useState, useRef, memo, useCallback } from 'react';
import { Stack } from '@mui/material';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import RequestsModalContent from './RequestsModalContent';
import { selectRequestsModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleRequestsModalOpen,
  hideRequestsModal,
} from 'store/slices/calendarOverlayingPanels/actions';

const RequestsModal = () => {
  const dispatch = useAppDispatch();
  const requestsModalOpen = useAppSelector(selectRequestsModalOpen);

  const [requestTab, setRequestTab] = useState(0);
  const actionButtonsTargetRef = useRef(null);

  const handleClose = () => {
    dispatch(hideRequestsModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleRequestsModalOpen());
  }, []);

  return (
    <CustomModal
      open={requestsModalOpen}
      onClose={handleClose}
      aria-labelledby='Requests Modal'
      aria-describedby='Requests Modal For Scheduler'
      title='Requests'
      maxWidth={'xxl' as any}
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <RequestsModalContent
        requestTab={requestTab}
        setRequestTab={setRequestTab}
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleModalOpen}
      />
    </CustomModal>
  );
};

export default memo(RequestsModal);
