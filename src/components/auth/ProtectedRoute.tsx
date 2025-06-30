import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // For a loading spinner

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: string; // e.g., 'admin', 'client'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-brand-orange" />
        <p className="ml-4 text-lg text-neutral-gray-dark">Chargement de la session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a requiredRole is specified, check if the user has that role
  if (requiredRole && user?.role !== requiredRole) {
    // User is authenticated but does not have the required role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
