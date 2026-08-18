import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLatestCallback } from 'hooks/useLatestCallback';

function cleanQueryDateParam(
  param: string | null,
  initValue: Date | null,
): Date | null {
  if (param === null) return initValue;
  const parsed = new Date(param);
  return isNaN(parsed.getTime()) ? initValue : parsed;
}

export function useOptimizerActionLogsQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [companyId, setCompanyId] = useState<string | null>(
    searchParams.get('companyId') || null,
  );

  const [startDate, setStartDate] = useState<Date | null>(
    cleanQueryDateParam(searchParams.get('startDate') || null, null),
  );
  const [endDate, setEndDate] = useState<Date | null>(
    cleanQueryDateParam(searchParams.get('endDate') || null, null),
  );

  // Ref to skip first effect run
  const isFirstRun = useRef(true);

  const updateSearchParams = useLatestCallback(
    (params: Record<string, string | undefined | null>) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) {
              newParams.delete(key);
            } else {
              newParams.set(key, value);
            }
          });
          return newParams;
        },
        { replace: true },
      );
    },
  );

  // Sync state to URL query params
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      updateSearchParams({
        companyId: companyId ?? undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      });
    });
    return () => window.clearTimeout(timer);
  }, [companyId, startDate, endDate, updateSearchParams]);

  return {
    companyId,
    setCompanyId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  };
}
