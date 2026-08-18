import { useState, useEffect } from 'react';

export function useDebouncedSearchQuery(
  query: string,
  setQuery: (query: string) => void,
  delay: number = 300,
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setQuery(debouncedQuery);
    }, delay);

    return () => {
      window.clearTimeout(handler);
    };
  }, [debouncedQuery, delay]);

  return [debouncedQuery, setDebouncedQuery] as const;
}
