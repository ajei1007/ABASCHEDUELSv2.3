import { Navigate } from 'react-router';
import { useAppDispatch } from 'store/hooks';
import { isAuthenticated } from 'utils/isAuthenticated';
import { logoutUser } from 'store/actions/authActions';

export function RequireUser({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  if (!isAuthenticated()) {
    dispatch(logoutUser());
    return <Navigate to='/starter' replace />;
  } else {
    return children;
  }
}
