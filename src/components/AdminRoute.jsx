import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuthStore();

  if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
