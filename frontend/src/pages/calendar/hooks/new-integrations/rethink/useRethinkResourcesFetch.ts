import { useState, useRef, useCallback } from 'react';
import axios, { type CancelTokenSource } from 'axios';
import { toast } from 'react-toastify';
import type { IApiIntegrationResourceItem } from 'types/api/integrations';

export function useRethinkResourcesFetch() {
  const [resources, setResources] = useState<IApiIntegrationResourceItem[]>([]);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(0);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const resourcesLoading = loadingCount > 0;

  const fetchResources = useCallback(
    async ({
      resourceType,
      page,
      limit,
    }: {
      resourceType?: string;
      page?: number;
      limit?: number;
    }) => {
      // Cancel the previous request if it exists
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Operation canceled due to new request.');
      }

      const cancelTokenSource = axios.CancelToken.source();
      cancelTokenRef.current = cancelTokenSource;

      setLoadingCount((prev) => prev + 1);
      try {
        const response = await axios.get<{
          result: IApiIntegrationResourceItem[];
          count: number;
        }>('/integrations/synced-resources', {
          params: {
            software: 'rethink',
            resourceType,
            page,
            limit,
          },
          cancelToken: cancelTokenSource.token,
        });

        setResources(response.data?.result || []);
        setResourcesCount(response.data?.count || 0);
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          const msg = error?.response?.data;
          if (msg) {
            toast.error(msg);
          } else {
            toast.error('Something went wrong. Try again!');
          }
        }
      } finally {
        setLoadingCount((prev) => Math.max(prev - 1, 0));
      }
    },
    [],
  );

  return { resources, resourcesCount, resourcesLoading, fetchResources };
}
