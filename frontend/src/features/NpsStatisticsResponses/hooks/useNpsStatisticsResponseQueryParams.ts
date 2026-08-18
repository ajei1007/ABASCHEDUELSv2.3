import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLatestCallback } from 'hooks/useLatestCallback';

/**
 * Cleans a numeric query parameter, returning a valid number or a default value.
 * @param param The query parameter as a string or null.
 * @param initValue The default value to use if the param is invalid.
 */
function cleanQueryParamNumber(
  param: string | null,
  initValue: number,
): number {
  if (param === null) return initValue;
  const parsed = parseInt(param, 10);
  return isNaN(parsed) || parsed < 1 ? initValue : parsed;
}

export function useNpsStatisticsResponseQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from query params or fallback
  const [page, setPage] = useState<number>(
    cleanQueryParamNumber(searchParams.get('page') || null, 1),
  );
  const [limit, setLimit] = useState<number>(
    cleanQueryParamNumber(searchParams.get('limit') || null, 10),
  );

  // Ref to skip first effect run
  const isFirstRun = useRef(true);

  const updateSearchParams = useLatestCallback(
    (params: Record<string, string>) => {
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
        page: `${page}`,
        limit: `${limit}`,
      });
    });
    return () => window.clearTimeout(timer);
  }, [page, limit, updateSearchParams]);

  return {
    page,
    setPage,
    limit,
    setLimit,
  };
}
