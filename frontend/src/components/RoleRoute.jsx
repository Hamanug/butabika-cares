import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRole, redirectTo }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (user.role !== allowedRole) {
    return <Navigate to={redirectTo || '/'} replace />;
  }
  
  return children;
};

export default RoleRoute;
