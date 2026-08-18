// src/pages/calendar/hooks/new-integrations/therapypms/useTherapyPmsEventsImport.ts
import { useState, useRef, useCallback } from 'react';
import axios, { type CancelTokenSource } from 'axios';
import { toast } from 'react-toastify';
import { useAppSelector } from 'store/hooks';

interface ImportParams {
  branches: string;
  importEventsUpdatedInThePast?: number;
}

interface ImportResult {
  isSuccess: boolean;
  isCanceled?: boolean;
  data?: any;
}

export function useTherapyPmsEventsImport() {
  const [loading, setLoading] = useState(false);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);
  const timezone =
    useAppSelector((s) => s.settings?.settingValues?.timezone) ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const importEvents = useCallback(
    async ({
      branches,
      importEventsUpdatedInThePast,
    }: ImportParams): Promise<ImportResult> => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('New import started');
      }
      const source = axios.CancelToken.source();
      cancelTokenRef.current = source;

      setLoading(true);
      try {
        const response = await axios.post(
          '/integrations/import-events/therapypms',
          { branches, importEventsUpdatedInThePast, timezone },
          { cancelToken: source.token },
        );
        toast.success(response.data.msg || 'Events imported successfully');
        return { isSuccess: true, data: response.data };
      } catch (err: any) {
        if (axios.isCancel(err)) {
          return { isSuccess: false, isCanceled: true };
        }
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          'Failed to import events';
        toast.error(msg);
        return { isSuccess: false };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cancelImportEvents = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Import cancelled by user');
    }
  }, []);

  return {
    importEvents,
    cancelImportEvents,
    loading,
  };
}
