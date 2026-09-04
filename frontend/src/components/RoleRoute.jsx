import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRole, redirectTo }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading session...</div>;

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Forced Password Rotation Interceptor
  if (user.requires_password_change) {
    if (location.pathname !== '/update-password') {
      return <Navigate replace to="/update-password"/>;
    }
  }
  
  if (user.role !== allowedRole) {
    return <Navigate to={redirectTo || '/'} replace />;
  }
  
  return children;
};

export default RoleRoute;
