import { useState, useRef, useCallback } from 'react';
import axios, { type CancelTokenSource } from 'axios';
import { toast } from 'react-toastify';

interface IntegrateParams {
  branches: string;
  syncEventUpdatedInThePast?: number;
}

interface IntegrateResult<T = any> {
  isSuccess: boolean;
  isCanceled?: boolean;
  data?: T;
}

export function useRethinkEventsIntegrate() {
  const [loading, setLoading] = useState(false);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const integrateEvents = useCallback(
    async ({
      branches,
      syncEventUpdatedInThePast,
    }: IntegrateParams): Promise<IntegrateResult> => {
      // Cancel any in-flight request
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('New request started');
      }
      const source = axios.CancelToken.source();
      cancelTokenRef.current = source;

      setLoading(true);
      try {
        const response = await axios.post<any>(
          '/integrations/integrate-events/rethink',
          { branches, syncEventUpdatedInThePast },
          { cancelToken: source.token },
        );

        toast.success(response?.data?.msg);

        return { isSuccess: true, data: response.data };
      } catch (error: any) {
        if (axios.isCancel(error)) {
          return { isSuccess: false, isCanceled: true };
        }
        const msg = error?.response?.data;
        toast.error(msg || 'Failed to integrate events');
        return { isSuccess: false, isCanceled: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cancelIntegrateEvents = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Request cancelled by user');
    }
  }, []);

  return {
    integrateEvents,
    cancelIntegrateEvents,
    loading,
  };
}
