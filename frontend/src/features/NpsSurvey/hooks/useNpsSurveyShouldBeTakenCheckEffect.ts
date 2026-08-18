import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAppSelector } from 'store/hooks';
import { useLatestCallback } from 'hooks/useLatestCallback';
import { useNpsSurveyQuestionsFetch } from './useNpsSurveyQuestionsFetch';
import { useNpsSurveyEvaluateSurveyTime } from './useNpsSurveyEvaluateSurveyTime';
import type { IApiSurveyQuestionItem } from 'types/api';

export function useNpsSurveyShouldBeTakenCheckEffect({
  showNpsSurveyModal,
}: {
  showNpsSurveyModal: ({
    questions,
  }: {
    questions: IApiSurveyQuestionItem[];
  }) => Promise<void>;
}) {
  const npsSurveyEventEmitter = useAppSelector(
    (store) => store.npsSurvey.eventEmitter,
  );
  const npsSurveyModalShown = useAppSelector(
    (store) => store.npsSurvey.npsSurveyModalShown,
  );

  const { surveyQuestionsLoading, fetchSurveyQuestions } =
    useNpsSurveyQuestionsFetch();

  const { npsLastSurveyDataLoading, isNpsSurveyTime } =
    useNpsSurveyEvaluateSurveyTime();

  const isNpsSurveyBlocked = useLatestCallback(
    () =>
      npsSurveyModalShown ||
      surveyQuestionsLoading ||
      npsLastSurveyDataLoading ||
      // Check if cooldown cookie is set
      Cookies.get('nps_blocked'),
  );

  // Memoize the callback to avoid unnecessary re-renders
  const handleCheckNpsSurvey = useLatestCallback(
    async ({ chance }: { chance: number }) => {
      // Use early return for clarity
      if (isNpsSurveyBlocked()) {
        return;
      }
      // Use Math.random() for chance check
      if (Math.random() > chance) {
        return;
      }

      // Check if it's time to show the survey
      const isTime = await isNpsSurveyTime();
      if (!isTime) {
        return;
      }

      // Wait for any ongoing operations to complete
      // react may batch state updates, so we ensure the check is done after all state updates
      await new Promise((resolve) => setTimeout(resolve, 0));

      // If survey is blocked, do not show the modal
      // This is a double-check in case the state changed during async operations
      if (isNpsSurveyBlocked()) {
        return;
      }

      // Fetch survey questions
      const result = await fetchSurveyQuestions();

      // If fetch failed or was aborted, do not show the modal
      if (!result.success || result.aborted) {
        return;
      }

      const questions = result.data;
      // if there are no questions, do not show the modal
      if (questions.length === 0) {
        // Set a cooldown cookie to prevent showing the survey again
        Cookies.set('nps_blocked', '1', {
          expires: 1 / 12, // 2 hours
          sameSite: 'Lax',
          secure: true,
        });
        return;
      }

      // Wait for any ongoing operations to complete before showing the modal
      // react may batch state updates, so we ensure the modal is shown after all state updates
      await new Promise((resolve) => setTimeout(resolve, 0));

      // If survey is blocked, do not show the modal
      // This is a double-check in case the state changed during async operations
      if (isNpsSurveyBlocked()) {
        return;
      }

      // Show the NPS survey modal with fetched questions
      showNpsSurveyModal({
        questions,
      });
    },
  );

  useEffect(() => {
    let timer: number | null = null;
    let maxChance = 0;

    const scheduleCheckNpsSurvey = (options: { chance: number }) => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      maxChance = Math.max(maxChance, options.chance);
      timer = window.setTimeout(() => {
        handleCheckNpsSurvey({
          ...options,
          chance: maxChance,
        });
        timer = null;
        maxChance = 0; // Reset after execution
      }, 1500);
    };

    npsSurveyEventEmitter?.on('checkNpsSurvey', scheduleCheckNpsSurvey);
    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      npsSurveyEventEmitter?.off('checkNpsSurvey', scheduleCheckNpsSurvey);
    };
  }, [npsSurveyEventEmitter, handleCheckNpsSurvey]);
}
