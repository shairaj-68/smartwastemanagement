import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  
  const hasToken = !!localStorage.getItem('accessToken');

  if (!user && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
