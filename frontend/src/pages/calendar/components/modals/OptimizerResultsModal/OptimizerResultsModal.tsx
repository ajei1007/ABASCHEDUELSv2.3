import { memo, useRef, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import CustomModal from 'components/Modal';
import OptimizerResultsModalContent from './OptimizerResultsModalContent';

const modalTitle = 'Optimizer Results';

const OptimizerResultsModal = () => {
  const dispatch = useAppDispatch();

  const optimizerResultsModal = useAppSelector(
    (state) => state.optimizer.optimizerResultsModal,
  );

  const [loading, setLoading] = useState(false);

  const actionButtonsTargetRef = useRef(null);

  const toggleOptimizerResultsModal = useCallback(() => {
    dispatch(toggleOptimizerResultsModal());
  }, [dispatch]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setLoading(loading);
  }, []);

  return (
    <CustomModal
      open={optimizerResultsModal}
      onClose={!loading ? toggleOptimizerResultsModal : () => {}}
      aria-labelledby={`${modalTitle} Modal`}
      aria-describedby={`${modalTitle} Modal For Scheduler`}
      title={modalTitle}
      maxWidth='xl'
      actionbuttons={<div ref={actionButtonsTargetRef}></div>}
    >
      <OptimizerResultsModalContent
        actionButtonsTargetRef={actionButtonsTargetRef}
        toggleModalOpen={toggleOptimizerResultsModal}
        onLoadingChange={handleLoadingChange}
      />
    </CustomModal>
  );
};

export default memo(OptimizerResultsModal);
