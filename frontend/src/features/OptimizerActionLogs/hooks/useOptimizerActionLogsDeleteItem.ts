import axios from 'axios';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { selectErrorMessage } from 'components/FormItems/error/errors';

interface UseOptimizerActionLogsDeleteItemReturn {
  deleteItem: (itemId: string) => Promise<void>;
  isDeleting: boolean;
}

export function useOptimizerActionLogsDeleteItem({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}): UseOptimizerActionLogsDeleteItemReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItem = useCallback(
    async (itemId: string): Promise<void> => {
      if (isDeleting) {
        return; // Prevent multiple deletions at the same time
      }

      // Input validation
      if (!itemId || typeof itemId !== 'string') {
        return;
      }

      setIsDeleting(true);
      try {
        await axios.delete(`/optimizer-action-logs/${itemId}`);
        toast.success('Optimizer action log deleted successfully');
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        // Handle request cancellation
        if (axios.isCancel(error)) {
          return;
        }

        const errorMessage = selectErrorMessage(error as any);
        toast.error(errorMessage);
        console.error('Error deleting optimizer action log:', error);
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting],
  );

  return {
    deleteItem,
    isDeleting,
  };
}
