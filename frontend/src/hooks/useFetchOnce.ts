import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export function useFetchOnce<T>({
  initialData,
  fetcher,
}: {
  initialData: T;
  fetcher: (payload: { signal: AbortSignal }) => Promise<T>;
}) {
  const [data, setData] = useState<T>(initialData);
  const [fetchingStatus, setFetchingStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle');

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // If already loading or successfully fetched, do not refetch
    if (['loading', 'success'].includes(fetchingStatus)) {
      return;
    }

    // Cancel previous request if still in-flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setFetchingStatus('loading');
    try {
      const data = await fetcher({
        signal: controller.signal,
      });
      setData(data);
      setFetchingStatus('success');
    } catch (error: any) {
      if (
        axios.isCancel?.(error) ||
        error?.name === 'CanceledError' ||
        error?.code === 'ERR_CANCELED'
      ) {
        // Request was cancelled, do not show error toast
        return;
      }
      toast.error('Failed to fetch questions. Please try again.');
      console.error('Error fetching questions:', error);
      setFetchingStatus('error');
    }
  }, [fetchingStatus]);

  useEffect(() => {
    return () => {
      // Cleanup: cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, fetchingStatus, fetchData };
}
