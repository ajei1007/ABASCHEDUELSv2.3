import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCurrentQuarter, validateQuarter } from '@/utils/quarterGenerator';
import { useLatestCallback } from 'hooks/useLatestCallback';

export function useNpsStatisticsQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from query params or fallback
  const [companyId, setCompanyId] = useState<string | null>(
    searchParams.get('companyId') || null,
  );
  const [questionId, setQuestionId] = useState<string | null>(
    searchParams.get('questionId') || null,
  );
  const [quarter, _setQuarter] = useState(() => {
    const quarterParam = searchParams.get('quarter');
    if (quarterParam && validateQuarter(quarterParam)) {
      return quarterParam;
    }
    return getCurrentQuarter().value;
  });

  const setQuarter = useCallback((value: string) => {
    if (validateQuarter(value)) {
      _setQuarter(value);
    } else {
      console.warn(`Invalid quarter format: ${value}`);
      _setQuarter(getCurrentQuarter().value); // Fallback to current quarter if invalid
    }
  }, []);

  const updateSearchParams = useLatestCallback(
    (params: Record<string, string | null>) => {
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

  // Ref to skip first effect run
  const isFirstRun = useRef(true);

  // Sync state to URL query params
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const params: Record<string, string | null> = {
      companyId: companyId,
      questionId: questionId,
      quarter: quarter && validateQuarter(quarter) ? quarter : null,
    };

    const timer = window.setTimeout(() => {
      updateSearchParams(params);
    });
    return () => window.clearTimeout(timer);
  }, [companyId, questionId, quarter, updateSearchParams]);

  return {
    companyId,
    setCompanyId,
    questionId,
    setQuestionId,
    quarter,
    setQuarter,
  };
}
