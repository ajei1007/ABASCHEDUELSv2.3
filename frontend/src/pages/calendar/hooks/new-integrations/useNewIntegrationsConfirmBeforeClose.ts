import { useCallback, useEffect } from 'react';

export function useNewIntegrationsConfirmBeforeClose({
  shouldConfirm,
}: {
  shouldConfirm: boolean;
}) {
  const handlePromptConfirm = useCallback(
    () => window.confirm('Are you sure you want to leave?'),
    [],
  );

  useEffect(() => {
    if (shouldConfirm) {
      window.onbeforeunload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };

      return () => {
        window.onbeforeunload = null;
      };
    }
  }, [shouldConfirm]);

  return {
    handlePromptConfirm,
  };
}
