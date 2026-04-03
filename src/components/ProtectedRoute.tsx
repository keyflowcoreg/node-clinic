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
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-graphite" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          <p className="text-sm text-silver uppercase tracking-widest">Caricamento...</p>
        </div>
      </div>
    );
  }

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
