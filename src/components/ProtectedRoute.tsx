import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

type Props = {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
};

export function ProtectedRoute({ children, requiredRole, redirectTo }: Props) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath = `/auth/login?redirect=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo ?? loginPath} replace />;
  }

  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
