import { useRef, useCallback } from 'react';
import type { IModalWrapperRef } from 'components/ModalWrapper';
import { useNpsSurveyMultiTabsBroadcast } from './useNpsSurveyMultiTabsBroadcast';
import type { INpsSurveyModalPropsForRef } from '../components/NpsSurveyModal/NpsSurveyModal';
import type { IApiSurveyQuestionItem } from 'types/api';

export function useNpsSurveyModal() {
  const npsSurveyModalRef =
    useRef<IModalWrapperRef<INpsSurveyModalPropsForRef, any>>(null);

  const { syncModalShownStateAcrossTabs } = useNpsSurveyMultiTabsBroadcast();

  const showNpsSurveyModal = useCallback(
    async ({ questions }: { questions: IApiSurveyQuestionItem[] }) => {
      syncModalShownStateAcrossTabs({
        modalShown: true,
      });
      try {
        await npsSurveyModalRef.current?.show({
          questions,
        });
      } finally {
        syncModalShownStateAcrossTabs({
          modalShown: false,
        });
      }
    },
    [syncModalShownStateAcrossTabs],
  );

  return {
    npsSurveyModalRef,
    showNpsSurveyModal,
  };
}
