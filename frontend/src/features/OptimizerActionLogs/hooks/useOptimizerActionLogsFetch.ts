import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { selectErrorMessage } from 'components/FormItems/error/errors';
import type { IApiOptimizerActionLogItem } from 'types/api';

export function useOptimizerActionLogsFetch() {
  const [loadingCount, setLoadingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logItems, setLogItems] = useState<IApiOptimizerActionLogItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const isLogItemsLoading = loadingCount > 0;

  const lastParams = useRef<Record<string, any> | null>(null);

  const fetchLogItems = useCallback(async (params: Record<string, any>) => {
    lastParams.current = params;
    const { page, limit, companyId, start, end, status, triggerByUser } =
      params;

    setLoadingCount((prev) => prev + 1);
    setErrorMessage(null);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await axios.get('/optimizer-action-logs', {
        params: {
          page,
          limit,
          companyId: companyId ?? undefined, // Use undefined to avoid sending null
          startDate: start
            ? moment(start).startOf('day').toISOString()
            : undefined, // Use undefined to avoid sending null
          endDate: end ? moment(end).endOf('day').toISOString() : undefined, // Use undefined to avoid sending null
          status: status ?? undefined, // Use undefined to avoid sending null
          triggerByUser: triggerByUser ?? undefined, // Use undefined to avoid sending null
        },
        signal: controller.signal,
      });

      const data = response.data;
      setLogItems((data?.rows || []) as IApiOptimizerActionLogItem[]);
      setTotalCount(data?.count || 0);
      setErrorMessage(null);
    } catch (error: unknown) {
      // Handle request cancellation
      if (axios.isCancel(error)) {
        return;
      }

      const errorMessage = selectErrorMessage(error as any);
      toast.error(errorMessage);
      console.error('Error fetching optimizer action logs:', error);
      setErrorMessage(errorMessage);
    } finally {
      setLoadingCount((prev) => Math.max(prev - 1, 0));
    }
  }, []);

  const refetchLogItems = useCallback(() => {
    if (lastParams.current) {
      fetchLogItems(lastParams.current);
    }
  }, [fetchLogItems]);

  // Cleanup function to abort any ongoing requests when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    logItems,
    totalCount,
    isLogItemsLoading,
    logItemsErrorMessage: errorMessage,
    fetchLogItems,
    refetchLogItems,
  };
}
