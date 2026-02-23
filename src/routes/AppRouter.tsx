import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Categories from '../pages/Categories';
import Category from '../pages/Category';
import SubCategory from '../pages/SubCategory';
import StudySession from '../pages/StudySession';
import Profile from '../pages/Profile';
import Trash from '../pages/Trash';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUserContent from '../pages/admin/AdminUserContent';
import UserDetail from '../pages/admin/UserDetail';
import UserManagement from '../pages/admin/UserManagement';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected user routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route
        path="/categories/:categoryId/subcategories"
        element={<ProtectedRoute><Category /></ProtectedRoute>}
      />
      <Route
        path="/categories/:categoryId/subcategories/:subCategoryId"
        element={<ProtectedRoute><SubCategory /></ProtectedRoute>}
      />
      <Route path="/study" element={<ProtectedRoute><StudySession /></ProtectedRoute>} />
      <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Admin routes — more specific paths first so /admin/users/2 matches UserDetail */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users/:userId/content" element={<AdminUserContent />} />
        <Route path="users/:userId" element={<UserDetail />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
