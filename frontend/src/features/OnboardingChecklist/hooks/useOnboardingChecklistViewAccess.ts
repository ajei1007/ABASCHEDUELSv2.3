import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';
import role_permissions from 'helpers/role_permissions';

export function useOnboardingChecklistViewAccess() {
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  const hasAccessViewChecklist = useMemo(
    () =>
      !!currentUser && role_permissions(currentUser, 'viewOnboardingChecklist'),
    [currentUser],
  );

  return hasAccessViewChecklist;
}
