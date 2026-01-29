import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import TablePage from "./pages/TablePage";
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
import AIImageGeneratorPage from "./pages/products/AIImageGeneratorPage";
// Módulo de Música
import MusicLayout from "./pages/music/MusicLayout";
import SongRequestsPage from "./pages/music/SongRequestsPage";
// Módulo de Feedback
import FeedbackLayout from "./pages/feedback/FeedbackLayout";
import FeedbackListPage from "./pages/feedback/FeedbackListPage";
// Módulo de Gastos
import {
  ExpensesLayout,
  ExpensesDashboard,
  ExpensesListPage,
  ExpenseFormPage,
  ExpenseDetailPage,
  CategoriesPage as ExpenseCategoriesPage,
  RecurringPage,
} from "./pages/expenses";
// Módulo de Estadísticas
import { AnalyticsLayout, FinancialDashboard } from "./pages/analytics";
// Módulo de Juegos
import GamesListPage from "./pages/game/GamesListPage";
import GameInstructionsPage from "./pages/game/GameInstructionsPage";
import QRScanPage from "./pages/game/QRScanPage";
import JoinRoomPage from "./pages/game/JoinRoomPage";
import GameRoomPage from "./pages/game/GameRoomPage";
import GamesAdminPage from "./pages/game/GamesAdminPage";
import { authService } from "./services/auth.service";
import AdminRoute from "./components/AdminRoute";

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
  // Ruta principal - Carta pública
  {
    path: "/",
    element: <App />,
  },
  // Mesa con tracking
  {
    path: "/mesa/:tableNumber",
    element: <TablePage />,
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
        <AdminRoute>
          <InventoryLayout />
        </AdminRoute>
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
        element: (
          <AdminRoute>
            <OrdersStatsPage />
          </AdminRoute>
        ),
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
        element: (
          <AdminRoute>
            <ProductFormPage />
          </AdminRoute>
        ),
      },
      {
        path: "editar/:slug",
        element: (
          <AdminRoute>
            <ProductFormPage />
          </AdminRoute>
        ),
      },
      {
        path: "categorias",
        element: (
          <AdminRoute>
            <CategoriesPage />
          </AdminRoute>
        ),
      },
      {
        path: "generador-ia",
        element: (
          <AdminRoute>
            <AIImageGeneratorPage />
          </AdminRoute>
        ),
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
  // Panel de feedback (protegido)
  {
    path: "/feedback",
    element: (
      <ProtectedRoute>
        <FeedbackLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FeedbackListPage />,
      },
    ],
  },
  // Panel de gastos operativos (protegido)
  {
    path: "/gastos",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <ExpensesLayout />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ExpensesDashboard />,
      },
      {
        path: "lista",
        element: <ExpensesListPage />,
      },
      {
        path: "nuevo",
        element: <ExpenseFormPage />,
      },
      {
        path: ":id",
        element: <ExpenseDetailPage />,
      },
      {
        path: "editar/:id",
        element: <ExpenseFormPage />,
      },
      {
        path: "categorias",
        element: <ExpenseCategoriesPage />,
      },
      {
        path: "recurrentes",
        element: <RecurringPage />,
      },
    ],
  },
  // Panel de estadísticas financieras (admin only)
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AnalyticsLayout />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FinancialDashboard />,
      },
    ],
  },
  // Panel de administración de juegos (empleados y admin)
  {
    path: "/juegos-admin",
    element: (
      <ProtectedRoute>
        <GamesAdminPage />
      </ProtectedRoute>
    ),
  },
  // Juego Duelo Frostbyte (público)
  {
    path: "/game",
    element: <GamesListPage />,
  },
  {
    path: "/game/:gameId/instrucciones",
    element: <GameInstructionsPage />,
  },
  {
    path: "/game/duelo-frostbyte/play",
    element: <QRScanPage />,
  },
  {
    path: "/game/join/:roomLink",
    element: <JoinRoomPage />,
  },
  {
    path: "/game/room/:roomId",
    element: <GameRoomPage />,
  },
]);
