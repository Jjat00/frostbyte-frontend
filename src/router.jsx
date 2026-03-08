import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { authService } from "./services/auth.service";

// Lazy load de todas las rutas excepto la carta pública (/)
const TablePage = lazy(() => import("./pages/TablePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));

// Inventario
const InventoryLayout = lazy(() => import("./pages/inventory/InventoryLayout"));
const DashboardPage = lazy(() => import("./pages/inventory/DashboardPage"));
const MaterialsPage = lazy(() => import("./pages/inventory/MaterialsPage"));
const LowStockPage = lazy(() => import("./pages/inventory/LowStockPage"));
const PurchaseOrdersPage = lazy(() => import("./pages/inventory/PurchaseOrdersPage"));

// Pedidos
const OrdersLayout = lazy(() => import("./pages/orders/OrdersLayout"));
const ActiveOrdersPage = lazy(() => import("./pages/orders/ActiveOrdersPage"));
const NewOrderPage = lazy(() => import("./pages/orders/NewOrderPage"));
const OrderDetailPage = lazy(() => import("./pages/orders/OrderDetailPage"));
const OrdersHistoryPage = lazy(() => import("./pages/orders/OrdersHistoryPage"));
const OrdersStatsPage = lazy(() => import("./pages/orders/OrdersStatsPage"));

// Productos
const ProductsLayout = lazy(() => import("./pages/products/ProductsLayout"));
const ProductsListPage = lazy(() => import("./pages/products/ProductsListPage"));
const ProductFormPage = lazy(() => import("./pages/products/ProductFormPage"));
const CategoriesPage = lazy(() => import("./pages/products/CategoriesPage"));
const AIImageGeneratorPage = lazy(() => import("./pages/products/AIImageGeneratorPage"));

// Música
const MusicLayout = lazy(() => import("./pages/music/MusicLayout"));
const SongRequestsPage = lazy(() => import("./pages/music/SongRequestsPage"));

// Feedback
const FeedbackLayout = lazy(() => import("./pages/feedback/FeedbackLayout"));
const FeedbackListPage = lazy(() => import("./pages/feedback/FeedbackListPage"));

// Gastos
const ExpensesLayout = lazy(() => import("./pages/expenses/ExpensesLayout"));
const ExpensesDashboard = lazy(() => import("./pages/expenses/ExpensesDashboard"));
const ExpensesListPage = lazy(() => import("./pages/expenses/ExpensesListPage"));
const ExpenseFormPage = lazy(() => import("./pages/expenses/ExpenseFormPage"));
const ExpenseDetailPage = lazy(() => import("./pages/expenses/ExpenseDetailPage"));
const ExpenseCategoriesPage = lazy(() => import("./pages/expenses/CategoriesPage"));
const RecurringPage = lazy(() => import("./pages/expenses/RecurringPage"));

// Estadísticas
const AnalyticsLayout = lazy(() => import("./pages/analytics/AnalyticsLayout"));
const FinancialDashboard = lazy(() => import("./pages/analytics/FinancialDashboard"));

// Juegos
const GamesListPage = lazy(() => import("./pages/game/GamesListPage"));
const GameInstructionsPage = lazy(() => import("./pages/game/GameInstructionsPage"));
const QRScanPage = lazy(() => import("./pages/game/QRScanPage"));
const JoinRoomPage = lazy(() => import("./pages/game/JoinRoomPage"));
const GameRoomPage = lazy(() => import("./pages/game/GameRoomPage"));
const GamesAdminPage = lazy(() => import("./pages/game/GamesAdminPage"));

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));

// 8M — Generador público de tarjetas del Día de la Mujer
const WomensDayGeneratorPage = lazy(() =>
  import("./pages/womens-day/WomensDayGeneratorPage")
);

// Fallback de carga mínimo
const PageLoader = () => (
  <div className="min-h-screen bg-dark flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Wrapper con Suspense para rutas lazy
const Lazy = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

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
  // Ruta principal - Carta pública (NO lazy - es la más visitada)
  {
    path: "/",
    element: <App />,
  },
  // Landing page pública (SaaS)
  {
    path: "/landing",
    element: (
      <Lazy>
        <LandingPage />
      </Lazy>
    ),
  },
  // Mesa con tracking
  {
    path: "/mesa/:tableNumber",
    element: (
      <Lazy>
        <TablePage />
      </Lazy>
    ),
  },
  // Login
  {
    path: "/login",
    element: (
      <Lazy>
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Lazy>
    ),
  },
  // Home - Selección de módulos
  {
    path: "/home",
    element: (
      <Lazy>
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      </Lazy>
    ),
  },
  // Panel de inventario (protegido)
  {
    path: "/inventario",
    element: (
      <Lazy>
        <ProtectedRoute>
          <AdminRoute>
            <InventoryLayout />
          </AdminRoute>
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <DashboardPage />
          </Lazy>
        ),
      },
      {
        path: "materiales",
        element: (
          <Lazy>
            <MaterialsPage />
          </Lazy>
        ),
      },
      {
        path: "stock-bajo",
        element: (
          <Lazy>
            <LowStockPage />
          </Lazy>
        ),
      },
      {
        path: "ordenes",
        element: (
          <Lazy>
            <PurchaseOrdersPage />
          </Lazy>
        ),
      },
    ],
  },
  // Panel de pedidos (para meseros)
  {
    path: "/pedidos",
    element: (
      <Lazy>
        <ProtectedRoute>
          <OrdersLayout />
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <ActiveOrdersPage />
          </Lazy>
        ),
      },
      {
        path: "nuevo",
        element: (
          <Lazy>
            <NewOrderPage />
          </Lazy>
        ),
      },
      {
        path: ":id",
        element: (
          <Lazy>
            <OrderDetailPage />
          </Lazy>
        ),
      },
      {
        path: "historial",
        element: (
          <Lazy>
            <OrdersHistoryPage />
          </Lazy>
        ),
      },
      {
        path: "estadisticas",
        element: (
          <Lazy>
            <AdminRoute>
              <OrdersStatsPage />
            </AdminRoute>
          </Lazy>
        ),
      },
    ],
  },
  // Panel de productos (protegido)
  {
    path: "/productos",
    element: (
      <Lazy>
        <ProtectedRoute>
          <ProductsLayout />
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <ProductsListPage />
          </Lazy>
        ),
      },
      {
        path: "nuevo",
        element: (
          <Lazy>
            <AdminRoute>
              <ProductFormPage />
            </AdminRoute>
          </Lazy>
        ),
      },
      {
        path: "editar/:slug",
        element: (
          <Lazy>
            <AdminRoute>
              <ProductFormPage />
            </AdminRoute>
          </Lazy>
        ),
      },
      {
        path: "categorias",
        element: (
          <Lazy>
            <AdminRoute>
              <CategoriesPage />
            </AdminRoute>
          </Lazy>
        ),
      },
      {
        path: "generador-ia",
        element: (
          <Lazy>
            <AdminRoute>
              <AIImageGeneratorPage />
            </AdminRoute>
          </Lazy>
        ),
      },
    ],
  },
  // Panel de música (protegido)
  {
    path: "/musica",
    element: (
      <Lazy>
        <ProtectedRoute>
          <MusicLayout />
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <SongRequestsPage />
          </Lazy>
        ),
      },
    ],
  },
  // Panel de feedback (protegido)
  {
    path: "/feedback",
    element: (
      <Lazy>
        <ProtectedRoute>
          <FeedbackLayout />
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <FeedbackListPage />
          </Lazy>
        ),
      },
    ],
  },
  // Panel de gastos operativos (protegido)
  {
    path: "/gastos",
    element: (
      <Lazy>
        <ProtectedRoute>
          <AdminRoute>
            <ExpensesLayout />
          </AdminRoute>
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <ExpensesDashboard />
          </Lazy>
        ),
      },
      {
        path: "lista",
        element: (
          <Lazy>
            <ExpensesListPage />
          </Lazy>
        ),
      },
      {
        path: "nuevo",
        element: (
          <Lazy>
            <ExpenseFormPage />
          </Lazy>
        ),
      },
      {
        path: ":id",
        element: (
          <Lazy>
            <ExpenseDetailPage />
          </Lazy>
        ),
      },
      {
        path: "editar/:id",
        element: (
          <Lazy>
            <ExpenseFormPage />
          </Lazy>
        ),
      },
      {
        path: "categorias",
        element: (
          <Lazy>
            <ExpenseCategoriesPage />
          </Lazy>
        ),
      },
      {
        path: "recurrentes",
        element: (
          <Lazy>
            <RecurringPage />
          </Lazy>
        ),
      },
    ],
  },
  // Panel de estadísticas financieras (admin only)
  {
    path: "/analytics",
    element: (
      <Lazy>
        <ProtectedRoute>
          <AdminRoute>
            <AnalyticsLayout />
          </AdminRoute>
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <FinancialDashboard />
          </Lazy>
        ),
      },
    ],
  },
  // Panel de administración de juegos (empleados y admin)
  {
    path: "/juegos-admin",
    element: (
      <Lazy>
        <ProtectedRoute>
          <GamesAdminPage />
        </ProtectedRoute>
      </Lazy>
    ),
  },
  // Juego Duelo Frostbyte (público)
  {
    path: "/game",
    element: (
      <Lazy>
        <GamesListPage />
      </Lazy>
    ),
  },
  {
    path: "/game/:gameId/instrucciones",
    element: (
      <Lazy>
        <GameInstructionsPage />
      </Lazy>
    ),
  },
  {
    path: "/game/duelo-frostbyte/play",
    element: (
      <Lazy>
        <QRScanPage />
      </Lazy>
    ),
  },
  {
    path: "/game/join/:roomLink",
    element: (
      <Lazy>
        <JoinRoomPage />
      </Lazy>
    ),
  },
  {
    path: "/game/room/:roomId",
    element: (
      <Lazy>
        <GameRoomPage />
      </Lazy>
    ),
  },
  // Generador público de tarjetas 8M — sin autenticación
  {
    path: "/8m/generador",
    element: (
      <Lazy>
        <WomensDayGeneratorPage />
      </Lazy>
    ),
  },
]);
