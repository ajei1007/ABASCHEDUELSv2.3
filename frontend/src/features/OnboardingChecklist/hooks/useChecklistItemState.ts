import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import type { IApiOnboardingChecklistItem } from 'types/api';
import {
  selectIsItemToggling,
  selectChecklistItemById,
} from 'store/slices/onboardingChecklist/selectors';
import { toggleChecklistItem } from 'store/slices/onboardingChecklist/actions';
import { selectErrorMessage } from 'components/FormItems/error/errors';

/**
 * Custom hook for managing individual checklist item state
 * Uses Redux for state management with optimistic updates and loading states
 */
export function useChecklistItemState(
  initialItem: IApiOnboardingChecklistItem,
) {
  const dispatch = useAppDispatch();

  // Get the current item state from Redux (in case it was updated elsewhere)
  const currentItem = useAppSelector(selectChecklistItemById(initialItem.id));
  const isToggling = useAppSelector(selectIsItemToggling(initialItem.id));

  // Use Redux state if available, otherwise fall back to initial item
  const item = currentItem || initialItem;
  const completed = item.isCompleted || false;

  // Local error state for this hook instance
  const [error, setError] = useState<string | null>(null);

  const toggleCompleted = useCallback(async () => {
    if (isToggling) {
      return; // Prevent multiple concurrent requests
    }

    // Clear error before attempting
    setError(null);

    try {
      await dispatch(toggleChecklistItem({ itemId: initialItem.id })).unwrap();
    } catch (error: any) {
      if (error?.name === 'AbortError' || error?.message === 'ConditionError') {
        // Ignore abort errors or specific condition errors
        return;
      }

      // Extract error message using the utility
      const errorMessage = selectErrorMessage(error);

      // Set local error state
      setError(errorMessage);

      // Show toast notification
      toast.error(errorMessage);

      console.error('Failed to toggle checklist item:', error);
    }
  }, [dispatch, initialItem.id, isToggling]);

  return {
    completed,
    isToggling,
    toggleCompleted,
    error,
  };
}
