import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { selectErrorMessage } from 'components/FormItems/error/errors';
import type { IApiNpsStatisticsResponseItem } from 'types/api';

export function useNpsStatisticsResponseItemsFetch({
  page,
  limit,
  companyId,
  questionId,
  quarter,
}: {
  page: number;
  limit: number;
  companyId: string | null;
  questionId: string | null;
  quarter: string;
}) {
  // State to manage loading status, statistics, and error
  const [loadingCount, setLoadingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [responseItems, setResponseItems] = useState<
    IApiNpsStatisticsResponseItem[]
  >([]);

  const [totalCount, setTotalCount] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine if any loading is in progress
  const isLoading = loadingCount > 0;

  const fetchResponseItems = useCallback(
    async ({
      page,
      limit,
      companyId,
      questionId,
      quarter,
    }: {
      page: number;
      limit: number;
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

        const response = await axios.get('/surveydata', {
          params: {
            companyId,
            questionId,
            quarter,
            page,
            limit,
          },
          signal: controller.signal,
        });

        setResponseItems(
          (response.data?.result || []) as IApiNpsStatisticsResponseItem[],
        );
        setTotalCount(response.data?.totalCount || 0);
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

  const refetchResponseItems = useCallback(
    () => fetchResponseItems({ page, limit, companyId, questionId, quarter }),
    [companyId, questionId, quarter, page, limit, fetchResponseItems],
  );

  // Initial fetch when the component mounts or when dependencies change
  // This will also refetch when companyId, questionId, or quarter changes
  useEffect(() => {
    fetchResponseItems({ companyId, questionId, quarter, page, limit });
  }, [companyId, questionId, quarter, page, limit]);

  // Cleanup function to abort any ongoing requests when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    responseItems,
    totalCount,
    isResponseItemsLoading: isLoading,
    responseItemsErrorMessage: errorMessage,
    refetchResponseItems,
    fetchResponseItems,
  };
}
