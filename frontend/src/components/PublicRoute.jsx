import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    // Redirect admins to admin dashboard
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Redirect regular users to home
    return <Navigate to="/" replace />;
  }

  // Not logged in: render the public routes
  return <Outlet />;
};

export default PublicRoute;
