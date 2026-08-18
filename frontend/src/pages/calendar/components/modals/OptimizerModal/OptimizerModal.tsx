import { useRef, useEffect, memo, useCallback } from 'react';
import { Stack } from '@mui/material';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import CustomModal from 'components/Modal';
import OptimizerModalContent from './OptimizerModalContent';
import {
  toggleOptimizerModal,
  hideOptimizerModal,
  fetchOptimizer,
} from 'store/actions/optimizerActions';
import { fetchRoles } from 'store/slices/calendar/thunks';

const OptimizerModal = () => {
  const dispatch = useAppDispatch();
  const optimizerModal = useAppSelector(
    (state) => state.optimizer.optimizerModal,
  );
  const optimizerValues = useAppSelector(
    (state) => state.optimizer.optimizerValues,
  );
  const roles = useAppSelector((state) => state.calendar.roles);

  const actionButtonsTargetRef = useRef(null);

  const handleClose = () => {
    dispatch(hideOptimizerModal());
  };

  const toggleModalOpen = useCallback(() => {
    dispatch(toggleOptimizerModal());
  }, []);

  const handleModalOpened = useLatestCallback(() => {
    if (roles.length === 0) {
      dispatch(fetchRoles());
    }

    const isMaxtime = Object.keys(optimizerValues).includes('maxtime');
    if (!isMaxtime) {
      dispatch(fetchOptimizer());
    }
  });

  useEffect(() => {
    if (optimizerModal) {
      handleModalOpened();
    }
  }, [optimizerModal, handleModalOpened]);

  return (
    <CustomModal
      open={optimizerModal}
      onClose={handleClose}
      aria-labelledby='Optimizer Modal'
      aria-describedby='Optimizer Modal For Scheduler'
      title='Optimizer'
      data-qa='optimizer-container'
      actionbuttons={
        <Stack ref={actionButtonsTargetRef} flexDirection='row' columnGap={1} />
      }
    >
      <OptimizerModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleModalOpen}
      />
    </CustomModal>
  );
};

OptimizerModal.displayName = 'OptimizerModal';

export default memo(OptimizerModal);
