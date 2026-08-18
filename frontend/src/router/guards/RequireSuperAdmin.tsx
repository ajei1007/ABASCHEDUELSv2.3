import { Navigate } from 'react-router';
import { useAppSelector } from 'store/hooks';
import isRoleOrHigher from 'helpers/roleHierarchy';
import { isAuthenticated } from 'utils/isAuthenticated';

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  if (
    !currentUser ||
    !isRoleOrHigher(currentUser.role, 'superAdmin') ||
    !isAuthenticated()
  ) {
    return <Navigate to='/login' replace />;
  } else if (currentUser && isRoleOrHigher(currentUser.role, 'superAdmin')) {
    return children;
  } else {
    return null;
  }
}
