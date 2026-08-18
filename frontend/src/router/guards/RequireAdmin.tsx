import { Navigate } from 'react-router';
import { useAppSelector } from 'store/hooks';
import isRoleOrHigher from 'helpers/roleHierarchy';
import { isAuthenticated } from 'utils/isAuthenticated';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const currentUser = useAppSelector((store) => store.auth.currentUser);

  if (
    !currentUser ||
    !isRoleOrHigher(currentUser.role, 'admin') ||
    !isAuthenticated()
  ) {
    return <Navigate to='/login' replace />;
  } else if (currentUser && isRoleOrHigher(currentUser.role, 'admin')) {
    return children;
  } else {
    return null;
  }
}
