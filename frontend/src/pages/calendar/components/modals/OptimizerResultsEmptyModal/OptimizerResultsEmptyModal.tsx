import { memo } from 'react';
import CustomButton from 'components/Button';
import CustomModal from 'components/Modal';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  toggleOptimizerResultsEmptyModal,
  resetOptimizerResults,
} from 'store/actions/optimizerActions';
import OptimizerResultsEmptyModalContent from './OptimizerResultsEmptyModalContent';

const modalTitle = 'Optimizer Results Empty';

const OptimizerResultsEmptyModal = () => {
  const dispatch = useAppDispatch();

  const optimizerResultsEmptyModal = useAppSelector(
    (state) => state.optimizer.optimizerResultsEmptyModal,
  );

  const handleClose = () => {
    dispatch(resetOptimizerResults());
    dispatch(toggleOptimizerResultsEmptyModal());
  };

  return (
    <CustomModal
      open={optimizerResultsEmptyModal}
      onClose={handleClose}
      aria-labelledby={`${modalTitle} Modal`}
      aria-describedby={`${modalTitle} Modal For Scheduler`}
      title={modalTitle}
      maxWidth='lg'
      actionbuttons={
        <>
          <CustomButton onClick={handleClose} variant='outlined'>
            Close
          </CustomButton>
        </>
      }
    >
      <OptimizerResultsEmptyModalContent />
    </CustomModal>
  );
};

OptimizerResultsEmptyModal.displayName = 'OptimizerResultsEmptyModal';

export default memo(OptimizerResultsEmptyModal);
