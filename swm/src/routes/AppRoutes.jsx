import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import App from '../App';
import Complaints from '../pages/Complaints';
import CreateComplaint from '../pages/CreateComplaint';
import Worker from '../pages/Worker';
import Admin from '../pages/Admin';
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/create-complaint" element={<CreateComplaint />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker', 'admin']}><Worker /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
