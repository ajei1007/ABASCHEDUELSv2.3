import { useEffect, useState } from 'react';

interface UseAppCrashProps {
  crashFnName: string;
  errorMessage?: string;
}

export function useAppCrash({ crashFnName, errorMessage }: UseAppCrashProps) {
  const [shouldCrash, setShouldCrash] = useState(false);

  useEffect(() => {
    // Only enable crash functionality in dev or beta environments
    const env = import.meta.env.REACT_APP_ENV;
    if (env !== 'dev' && env !== 'beta') {
      return;
    }

    // Initialize window.__beta__ object if it doesn't exist
    if (!window.__beta__) {
      window.__beta__ = {};
    }

    // Create the crash function
    const crashFunction = () => {
      setShouldCrash(true);
    };

    // Expose the crash function on window.__beta__
    window.__beta__[crashFnName] = crashFunction;

    // Cleanup function to remove the crash function when component unmounts
    return () => {
      if (window.__beta__ && window.__beta__[crashFnName]) {
        delete window.__beta__[crashFnName];
      }
    };
  }, [crashFnName, errorMessage]);

  // Crash during render phase
  if (shouldCrash) {
    throw new Error(errorMessage || `App crash triggered by ${crashFnName}`);
  }
}

// Extend the Window interface to include __beta__
declare global {
  interface Window {
    __beta__?: Record<string, () => void>;
  }
}
