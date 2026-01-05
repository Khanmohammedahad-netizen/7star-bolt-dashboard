import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  children: JSX.Element;
  allowedRoles?: Array<'admin' | 'manager' | 'staff'>;
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="mt-24 text-center text-gray-500">
        You do not have permission to access this page.
      </div>
    );
  }

  return children;
}
