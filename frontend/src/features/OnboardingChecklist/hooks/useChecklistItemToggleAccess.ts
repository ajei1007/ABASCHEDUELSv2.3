import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';
import role_permissions from 'helpers/role_permissions';

export function useChecklistItemToggleAccess() {
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const hasAccessToggleItem = useMemo(
    () =>
      !!currentUser &&
      role_permissions(currentUser, 'toggleOnboardingChecklist'),
    [currentUser],
  );

  return hasAccessToggleItem;
}
