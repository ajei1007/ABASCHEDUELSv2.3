import { useState, useEffect, useCallback } from 'react';
import { useBrowserTabVisibility } from 'hooks/useBrowserTabVisibility';
import type { IOptimizerJobItem } from 'types';

export function useOptimizerJobElapsedTime(optimizerJob: IOptimizerJobItem) {
  const [elapsedSeconds, setElapsedSeconds] = useState(
    (() => {
      if (
        optimizerJob.status !== 'loading' &&
        typeof optimizerJob.startTs === 'number' &&
        typeof optimizerJob.endTs === 'number'
      ) {
        const now = optimizerJob.endTs;
        const diff = Math.abs(now - optimizerJob.startTs);
        return Math.floor(diff / 1000);
      }
      return 0;
    })(),
  );

  const jobStartTs = optimizerJob.startTs;
  const jobEndTs = optimizerJob.endTs;
  const jobStatus = optimizerJob.status;

  const formattedTime = (() => {
    const totalSeconds = Math.floor(elapsedSeconds);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0',
    )}`;
  })();

  const isTabVisible = useBrowserTabVisibility();

  const syncElapsedTime = useCallback(
    ({ startTs, endTs }: { startTs: number; endTs?: number | null }) => {
      const now = endTs ?? Date.now();
      const diff = Math.abs(now - startTs);
      const seconds = Math.floor(diff / 1000);
      const milliseconds = diff % 1000;
      setElapsedSeconds(seconds);
      return {
        seconds,
        milliseconds,
      };
    },
    [setElapsedSeconds],
  );

  useEffect(() => {
    if (isTabVisible) {
      syncElapsedTime({
        startTs: jobStartTs,
        endTs: jobEndTs,
      });
    }
  }, [isTabVisible, jobStartTs, jobEndTs, syncElapsedTime]);

  useEffect(() => {
    const { seconds, milliseconds } = syncElapsedTime({
      startTs: jobStartTs,
      endTs: jobEndTs,
    });

    if (jobStatus !== 'loading') {
      return;
    }

    let timeoutTimer: number | undefined;
    let intervalTimer: number | undefined;

    timeoutTimer = window.setTimeout(() => {
      setElapsedSeconds(seconds + 1);
      intervalTimer = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }, 1000 - milliseconds);

    return () => {
      if (timeoutTimer !== undefined) {
        window.clearTimeout(timeoutTimer);
      }
      if (intervalTimer !== undefined) {
        window.clearInterval(intervalTimer);
      }
    };
  }, [jobStartTs, jobEndTs, jobStatus, syncElapsedTime]);

  return {
    formattedTime,
    elapsedSeconds,
  };
}
