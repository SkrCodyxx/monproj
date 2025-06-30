import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // For a loading spinner

interface ProtectedRouteProps {
  children?: React.ReactNode; // To allow wrapping a single component: <ProtectedRoute><MyComponent /></ProtectedRoute>
                               // Outlet is used when <ProtectedRoute /> is a layout route for nested <Route>s
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Display a loading spinner or a skeleton screen while checking auth status
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-brand-orange" />
        <p className="ml-4 text-lg text-neutral-gray-dark">Chargement de la session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If children are provided, render them. Otherwise, render Outlet for nested routes.
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
