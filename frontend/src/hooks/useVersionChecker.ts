// useVersionChecker.ts
import { useEffect, useState } from 'react';

const VERSION_URL = '/meta.json';
const STORAGE_KEY = 'version';
const POLL_INTERVAL = 5_000;

interface Options {
  pollInterval?: number;
  onUpdate?: (newVersion: string) => void;
}

/**
 * Polls VERSION_URL on an interval and lets the UI know when a new build is ready.
 *
 * @returns { updateAvailable, latestVersion, dismiss }
 */
export function useVersionChecker(options: Options = {}) {
  const { pollInterval = POLL_INTERVAL, onUpdate } = options;
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | undefined>();

  useEffect(() => {
    // Don’t run in dev or inside Storybook/e2e tests
    if (process.env.NODE_ENV === 'development') return;

    const check = async () => {
      try {
        const res = await fetch(VERSION_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.statusText);
        const { version } = await res.json();

        setLatestVersion(version);
        const current = localStorage.getItem(STORAGE_KEY);

        if (!current) {
          localStorage.setItem(STORAGE_KEY, version);
          return;
        }

        if (current !== version) {
          localStorage.setItem(STORAGE_KEY, version);
          setUpdateAvailable(true);
          onUpdate?.(version);
        }
      } catch (err) {
        console.error('Error checking version', err);
      }
    };

    check();

    const timer = window.setInterval(check, pollInterval);
    // Clean up when unmounted
    return () => window.clearInterval(timer);
  }, [pollInterval, onUpdate]);

  /** Caller can close the banner/modal without reloading */
  const dismiss = () => setUpdateAvailable(false);
  return { updateAvailable, latestVersion, dismiss };
}
