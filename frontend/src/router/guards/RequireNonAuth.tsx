import { Navigate, useLocation } from 'react-router';
import { isAuthenticated } from 'utils/isAuthenticated';

export function RequireNonAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  let _isAuthenticated = isAuthenticated();
  const { from } = (location!.state as any & { from: string }) || {
    from: '/app',
  };

  return _isAuthenticated ? <Navigate to={from} replace /> : children;
}
