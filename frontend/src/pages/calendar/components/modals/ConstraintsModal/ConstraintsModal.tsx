import { memo, useCallback, useRef } from 'react';
import { Stack } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import CustomModal from 'components/Modal';
import ConstraintsModalContent from './ConstraintsModalContent';
import { selectConstraintsModalOpen } from 'store/slices/calendarOverlayingPanels';
import {
  toggleConstraintsModalOpen,
  hideConstraintsModal,
} from 'store/slices/calendarOverlayingPanels/actions';

const ConstraintsModal = () => {
  const dispatch = useAppDispatch();

  const constraintsModalOpen = useAppSelector(selectConstraintsModalOpen);

  const actionButtonsTargetRef = useRef(null);

  const handleClose = () => {
    dispatch(hideConstraintsModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleConstraintsModalOpen());
  }, []);

  return (
    <CustomModal
      open={constraintsModalOpen}
      onClose={handleClose}
      aria-labelledby='Constraints Modal'
      aria-describedby='Constraints Modal For Scheduler'
      title='Constraints'
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <ConstraintsModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleModalOpen}
      />
    </CustomModal>
  );
};

ConstraintsModal.displayName = 'ConstraintsModal';

export default memo(ConstraintsModal);
