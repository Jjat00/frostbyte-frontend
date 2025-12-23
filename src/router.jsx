import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/auth/LoginPage';
import InventoryLayout from './pages/inventory/InventoryLayout';
import DashboardPage from './pages/inventory/DashboardPage';
import MaterialsPage from './pages/inventory/MaterialsPage';
import LowStockPage from './pages/inventory/LowStockPage';
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage';
// Módulo de Pedidos
import OrdersLayout from './pages/orders/OrdersLayout';
import ActiveOrdersPage from './pages/orders/ActiveOrdersPage';
import NewOrderPage from './pages/orders/NewOrderPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import OrdersHistoryPage from './pages/orders/OrdersHistoryPage';
import OrdersStatsPage from './pages/orders/OrdersStatsPage';
import { authService } from './services/auth.service';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para rutas públicas (login)
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/inventario" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  // Ruta principal - Menú público
  {
    path: '/',
    element: <App />,
  },
  // Login
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  // Panel de inventario (protegido)
  {
    path: '/inventario',
    element: (
      <ProtectedRoute>
        <InventoryLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'materiales',
        element: <MaterialsPage />,
      },
      {
        path: 'stock-bajo',
        element: <LowStockPage />,
      },
      {
        path: 'ordenes',
        element: <PurchaseOrdersPage />,
      },
    ],
  },
  // Panel de pedidos (para meseros)
  {
    path: '/pedidos',
    element: (
      <ProtectedRoute>
        <OrdersLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ActiveOrdersPage />,
      },
      {
        path: 'nuevo',
        element: <NewOrderPage />,
      },
      {
        path: ':id',
        element: <OrderDetailPage />,
      },
      {
        path: 'historial',
        element: <OrdersHistoryPage />,
      },
      {
        path: 'estadisticas',
        element: <OrdersStatsPage />,
      },
    ],
  },
]);

