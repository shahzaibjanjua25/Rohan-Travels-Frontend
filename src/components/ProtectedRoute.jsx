import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './ui/Spinner';

/**
 * Guards a route.
 *
 * The loading branch matters more than it looks. Session state is unknown
 * until /auth/me answers, and treating "unknown" as "logged out" would bounce
 * an authenticated person to the login screen on every refresh — the classic
 * flash-of-login-page bug.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="wrap center" style={{ padding: 'var(--s-8) 0' }}>
        <Spinner label="Checking your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Remember where they were headed so login can return them there.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="wrap" style={{ padding: 'var(--s-7) 0' }}>
        <div className="card">
          <h2>Not available on your account</h2>
          <p className="muted">
            This section is limited to administrators. If you think you should have access, ask an
            administrator to update your role.
          </p>
          <a className="btn btn--ghost" href="/">
            Back to search
          </a>
        </div>
      </div>
    );
  }

  return children;
}
