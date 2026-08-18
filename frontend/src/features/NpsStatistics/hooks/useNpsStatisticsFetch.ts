import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { selectErrorMessage } from 'components/FormItems/error/errors';
import type { IApiNpsStatisticsData } from 'types/api';

export function useNpsStatisticsFetch({
  companyId,
  questionId,
  quarter,
}: {
  companyId: string | null;
  questionId: string | null;
  quarter: string;
}) {
  // State to manage loading status, statistics, and error
  const [loadingCount, setLoadingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [statistics, setStatistics] = useState<IApiNpsStatisticsData | null>(
    null,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine if any loading is in progress
  const isLoading = loadingCount > 0;

  // Function to fetch NPS statistics
  const fetchStatistics = useCallback(
    async ({
      companyId,
      questionId,
      quarter,
    }: {
      companyId: string | null;
      questionId: string | null;
      quarter: string;
    }) => {
      setLoadingCount((prev) => prev + 1);
      setErrorMessage(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await axios.get('/surveydata/statistics', {
          params: {
            companyId,
            questionId,
            quarter,
          },
          signal: controller.signal,
        });

        setStatistics(response.data as IApiNpsStatisticsData);
        setErrorMessage(null);
      } catch (err: any) {
        if (
          axios.isCancel(err) ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED' ||
          err?.message === 'canceled' ||
          err?.message === 'Request aborted' ||
          err?.name === 'AbortError'
        ) {
          return;
        }
        const errorMessage = selectErrorMessage(err);
        toast.error(errorMessage);
        console.error('Error submitting survey:', err);
        setErrorMessage(errorMessage);
      } finally {
        setLoadingCount((prev) => Math.max(prev - 1, 0));
      }
    },
    [],
  );

  const refetchStatistics = useCallback(
    () => fetchStatistics({ companyId, questionId, quarter }),
    [companyId, questionId, quarter],
  );

  // Fetch statistics when the component mounts or when dependencies change
  // This will ensure that the statistics are fetched whenever the companyId, questionId, or quarter changes
  useEffect(() => {
    fetchStatistics({ companyId, questionId, quarter });
  }, [companyId, questionId, quarter]);

  // Cleanup function to abort any ongoing requests when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    statistics,
    isStatisticsLoading: isLoading,
    statisticsErrorMessage: errorMessage,
    refetchStatistics,
    fetchStatistics,
  };
}
