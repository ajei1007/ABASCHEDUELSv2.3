import axios from 'axios';
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { IApiSurveyQuestionItem } from 'types/api';

export function useNpsSurveyQuestionsFetch() {
  // Ref to store AbortController for future real fetch
  const abortControllerRef = useRef<AbortController | null>(null);

  const [loadingCount, setLoadingCount] = useState(0);

  const surveyQuestionsLoading = loadingCount > 0;

  const fetchSurveyQuestions = useCallback(async () => {
    setLoadingCount((prev) => prev + 1);

    // Abort previous request if still in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create and assign a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await axios.get('surveydata/questions', {
        signal: controller.signal,
      });

      const data = (
        Array.isArray(response.data) ? response.data : []
      ) as IApiSurveyQuestionItem[];

      return {
        success: true as const,
        data,
        aborted: false as const,
      };
    } catch (err: any) {
      if (
        axios.isCancel(err) ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED' ||
        err?.message === 'canceled' ||
        err?.message === 'Request aborted' ||
        err?.name === 'AbortError'
      ) {
        // Request was aborted
        return {
          success: false as const,
          data: null,
          aborted: true as const,
        };
      }
      toast.error('Failed to fetch survey questions. Please try again.');
      return {
        success: false as const,
        data: null,
        aborted: false as const,
      };
    } finally {
      setLoadingCount((prev) => Math.max(prev - 1, 0));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    fetchSurveyQuestions,
    surveyQuestionsLoading,
  };
}
