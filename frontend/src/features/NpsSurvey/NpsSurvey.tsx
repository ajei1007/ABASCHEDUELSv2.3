// Refactored for naming consistency, clarity, and best practices
import { memo, lazy, Suspense } from 'react';
import { useNpsSurveyModal } from './hooks/useNpsSurveyModal';
import { useNpsSurveyShouldBeTakenCheckEffect } from './hooks/useNpsSurveyShouldBeTakenCheckEffect';
import ModalWrapper from 'components/ModalWrapper';
import type { INpsSurveyModalPropsForRef } from './components/NpsSurveyModal/NpsSurveyModal';

const NpsSurveyModal = lazy(
  () => import('./components/NpsSurveyModal/NpsSurveyModal'),
);

/**
 * Renders the NPS Survey modal and manages its state and cross-tab logic.
 * Uses custom hooks for modal state, multi-tab sync, and survey timing.
 */
const NpsSurvey = () => {
  const { npsSurveyModalRef, showNpsSurveyModal } = useNpsSurveyModal();
  useNpsSurveyShouldBeTakenCheckEffect({
    showNpsSurveyModal,
  });

  return (
    <ModalWrapper
      ref={npsSurveyModalRef}
      renderModal={(
        isOpen,
        modalProps: INpsSurveyModalPropsForRef,
        handleClose,
        handleConfirm,
      ) => (
        <Suspense>
          <NpsSurveyModal
            isOpen={isOpen}
            handleClose={handleClose}
            handleConfirm={handleConfirm}
            {...modalProps}
          />
        </Suspense>
      )}
    />
  );
};

export default memo(NpsSurvey);
