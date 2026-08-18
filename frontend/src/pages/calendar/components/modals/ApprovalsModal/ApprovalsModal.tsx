import { useState, useRef, memo } from 'react';
import { Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import CustomModal from 'components/Modal';
import ApprovalsModalContent from './ApprovalsModalContent';
import { selectApprovalsModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleApprovalsModalOpen,
  hideApprovalsModal,
} from 'store/slices/calendarOverlayingPanels/actions';
import { RequestsActionTypes } from 'types/redux/approvals';

const ApprovalsModal = () => {
  const dispatch = useAppDispatch();
  const approvalsModalOpen = useAppSelector(selectApprovalsModalOpen);

  const [requestTab, setRequestTab] = useState(0);
  const actionButtonsTargetRef = useRef(null);

  const handleClose = () => {
    dispatch(hideApprovalsModal());
  };

  const toggleModalOpen = () => {
    dispatch(toggleApprovalsModalOpen());
    dispatch({
      type: RequestsActionTypes.SET_TIMEOFF_REQUEST_DATA,
      timeoffRequestData: [],
    });
    dispatch({
      type: RequestsActionTypes.SET_AVAILABILITIES_REQUEST_DATA,
      availabilitiesRequestData: [],
    });
    dispatch({
      type: RequestsActionTypes.SET_CANCELLATIONS_REQUEST_DATA,
      cancellationsRequestData: [],
    });
    dispatch({
      type: RequestsActionTypes.SET_CONFIRMATIONS_REQUEST_DATA,
      confirmationsRequestData: [],
    });
  };

  return (
    <CustomModal
      open={approvalsModalOpen}
      onClose={handleClose}
      aria-labelledby='Approvals Modal'
      aria-describedby='Approvals Modal For Scheduler'
      title='Approvals'
      maxWidth={'xxl' as any}
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <ApprovalsModalContent
        requestTab={requestTab}
        setRequestTab={setRequestTab}
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleModalOpen}
      />
    </CustomModal>
  );
};

ApprovalsModal.displayName = 'ApprovalsModal';

export default memo(ApprovalsModal);
