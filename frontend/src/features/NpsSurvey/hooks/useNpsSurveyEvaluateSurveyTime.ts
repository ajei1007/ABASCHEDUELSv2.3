import { useCallback, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useAppSelector } from 'store/hooks';
import type { IApiSurveyDataItem } from 'types/api';

export function useNpsSurveyEvaluateSurveyTime() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const blockedUntil = useRef<Date | null>(null);
  // Use useState for loadingCount and loading
  const [loadingCount, setLoadingCount] = useState(0);
  const npsLastSurveyDataLoading = loadingCount > 0;

  // Fetch NPS survey data with cancellation support
  const fetchNpsLastSurveyData = useCallback(async () => {
    setLoadingCount((c) => c + 1);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    try {
      abortControllerRef.current = new AbortController();
      const response = await axios.get('surveydata/last', {
        signal: abortControllerRef.current.signal,
      });
      const lastSurveyData = response.data as IApiSurveyDataItem | null;
      return {
        success: true as const,
        data: lastSurveyData,
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
      console.error('Error fetching NPS survey data:', err);
      return {
        success: false as const,
        data: null,
        aborted: false as const,
      };
    } finally {
      setLoadingCount((c) => c - 1);
    }
  }, []);

  const isNpsSurveyTime = useCallback(async () => {
    if (blockedUntil.current && new Date() < blockedUntil.current) {
      return false;
    }
    const result = await fetchNpsLastSurveyData();
    // Check if the fetch was successful or aborted
    if (!result.success || result.aborted) {
      return false;
    }

    const lastSurveyData = result.data;

    let lastSurveyTs: string | undefined;
    if (!lastSurveyData) {
      lastSurveyTs = currentUser?.createdAt;
    } else {
      lastSurveyTs =
        lastSurveyData?.createdAt ||
        lastSurveyData?.updatedAt ||
        lastSurveyData?.createdAt;
    }

    if (!lastSurveyTs) {
      console.warn('No valid survey timestamp found');
      return false;
    }

    const lastSurveyDate = new Date(lastSurveyTs);
    const currentDate = new Date();
    const minutesDifference =
      (currentDate.getTime() - lastSurveyDate.getTime()) / (1000 * 60);
    const shouldSurveyBeTaken = minutesDifference >= 90 * 24 * 60; // 90 days in minutes
    if (!shouldSurveyBeTaken) {
      const remainingMinutes = Math.ceil(90 * 24 * 60 - minutesDifference);
      blockedUntil.current = new Date(
        currentDate.getTime() + remainingMinutes * 60 * 1000,
      );
      return false;
    }

    blockedUntil.current = null;
    return true;
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isNpsSurveyTime,
    npsLastSurveyDataLoading,
  };
}
