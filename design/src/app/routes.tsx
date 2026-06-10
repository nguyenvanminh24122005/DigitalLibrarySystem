import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from './layout/MainLayout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { LibrarianDashboard } from './pages/LibrarianDashboard';
import { ReaderDashboard } from './pages/ReaderDashboard';
import { Catalog } from './pages/Catalog';
import { BorrowReturn } from './pages/BorrowReturn';
import { Reports } from './pages/Reports';
import { Config } from './pages/Config';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If not allowed, redirect to their own dashboard
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'LIBRARIAN') return <Navigate to="/librarian" replace />;
    if (role === 'READER') return <Navigate to="/reader" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "librarian",
        element: (
          <ProtectedRoute allowedRoles={['LIBRARIAN']}>
            <LibrarianDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "reader",
        element: (
          <ProtectedRoute allowedRoles={['READER']}>
            <ReaderDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "reader/*",
        element: (
          <ProtectedRoute allowedRoles={['READER']}>
            <ReaderDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "catalog",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}>
            <Catalog />
          </ProtectedRoute>
        ),
      },
      {
        path: "borrow-return",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}>
            <BorrowReturn />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "config",
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Config />
          </ProtectedRoute>
        ),
      }
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
