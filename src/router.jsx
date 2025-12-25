import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/auth/LoginPage";
import HomePage from "./pages/HomePage";
import InventoryLayout from "./pages/inventory/InventoryLayout";
import DashboardPage from "./pages/inventory/DashboardPage";
import MaterialsPage from "./pages/inventory/MaterialsPage";
import LowStockPage from "./pages/inventory/LowStockPage";
import PurchaseOrdersPage from "./pages/inventory/PurchaseOrdersPage";
// Módulo de Pedidos
import OrdersLayout from "./pages/orders/OrdersLayout";
import ActiveOrdersPage from "./pages/orders/ActiveOrdersPage";
import NewOrderPage from "./pages/orders/NewOrderPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import OrdersHistoryPage from "./pages/orders/OrdersHistoryPage";
import OrdersStatsPage from "./pages/orders/OrdersStatsPage";
// Módulo de Productos
import ProductsLayout from "./pages/products/ProductsLayout";
import ProductsListPage from "./pages/products/ProductsListPage";
import ProductFormPage from "./pages/products/ProductFormPage";
import CategoriesPage from "./pages/products/CategoriesPage";
// Módulo de Música
import MusicLayout from "./pages/music/MusicLayout";
import SongRequestsPage from "./pages/music/SongRequestsPage";
import { authService } from "./services/auth.service";

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
    return <Navigate to="/home" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  // Ruta principal - Menú público
  {
    path: "/",
    element: <App />,
  },
  // Login
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  // Home - Selección de módulos
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  // Panel de inventario (protegido)
  {
    path: "/inventario",
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
        path: "materiales",
        element: <MaterialsPage />,
      },
      {
        path: "stock-bajo",
        element: <LowStockPage />,
      },
      {
        path: "ordenes",
        element: <PurchaseOrdersPage />,
      },
    ],
  },
  // Panel de pedidos (para meseros)
  {
    path: "/pedidos",
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
        path: "nuevo",
        element: <NewOrderPage />,
      },
      {
        path: ":id",
        element: <OrderDetailPage />,
      },
      {
        path: "historial",
        element: <OrdersHistoryPage />,
      },
      {
        path: "estadisticas",
        element: <OrdersStatsPage />,
      },
    ],
  },
  // Panel de productos (protegido)
  {
    path: "/productos",
    element: (
      <ProtectedRoute>
        <ProductsLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ProductsListPage />,
      },
      {
        path: "nuevo",
        element: <ProductFormPage />,
      },
      {
        path: "editar/:slug",
        element: <ProductFormPage />,
      },
      {
        path: "categorias",
        element: <CategoriesPage />,
      },
    ],
  },
  // Panel de música (protegido)
  {
    path: "/musica",
    element: (
      <ProtectedRoute>
        <MusicLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <SongRequestsPage />,
      },
    ],
  },
]);
