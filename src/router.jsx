import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { authService } from "./services/auth.service";

// Lazy import con auto-reload (una sola vez) si el chunk ya no existe post-deploy
const lazyLoad = (importFn) =>
  lazy(() =>
    importFn().catch(() => {
      const key = "chunk_reload";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      sessionStorage.removeItem(key);
      return Promise.reject(new Error("Chunk load failed after reload"));
    })
  );

// Lazy load de todas las rutas excepto la carta pública (/)
const TablePage = lazyLoad(() => import("./pages/TablePage"));
const LoginPage = lazyLoad(() => import("./pages/auth/LoginPage"));
const HomePage = lazyLoad(() => import("./pages/HomePage"));

// Inventario
const InventoryLayout = lazyLoad(() => import("./pages/inventory/InventoryLayout"));
const DashboardPage = lazyLoad(() => import("./pages/inventory/DashboardPage"));
const MaterialsPage = lazyLoad(() => import("./pages/inventory/MaterialsPage"));
const LowStockPage = lazyLoad(() => import("./pages/inventory/LowStockPage"));
const PurchaseOrdersPage = lazyLoad(() => import("./pages/inventory/PurchaseOrdersPage"));

// Pedidos
const OrdersLayout = lazyLoad(() => import("./pages/orders/OrdersLayout"));
const ActiveOrdersPage = lazyLoad(() => import("./pages/orders/ActiveOrdersPage"));
const NewOrderPage = lazyLoad(() => import("./pages/orders/NewOrderPage"));
const OrderDetailPage = lazyLoad(() => import("./pages/orders/OrderDetailPage"));
const OrdersHistoryPage = lazyLoad(() => import("./pages/orders/OrdersHistoryPage"));
const OrdersStatsPage = lazyLoad(() => import("./pages/orders/OrdersStatsPage"));

// Productos
const ProductsLayout = lazyLoad(() => import("./pages/products/ProductsLayout"));
const ProductsListPage = lazyLoad(() => import("./pages/products/ProductsListPage"));
const ProductFormPage = lazyLoad(() => import("./pages/products/ProductFormPage"));
const CategoriesPage = lazyLoad(() => import("./pages/products/CategoriesPage"));
const AIImageGeneratorPage = lazyLoad(() => import("./pages/products/AIImageGeneratorPage"));

// Música
const MusicLayout = lazyLoad(() => import("./pages/music/MusicLayout"));
const SongRequestsPage = lazyLoad(() => import("./pages/music/SongRequestsPage"));

// YouTube
const YouTubeAdminPage = lazyLoad(() => import("./pages/youtube/YouTubeAdminPage"));
const YouTubeTVPage = lazyLoad(() => import("./pages/youtube/YouTubeTVPage"));

// Feedback
const FeedbackLayout = lazyLoad(() => import("./pages/feedback/FeedbackLayout"));
const FeedbackListPage = lazyLoad(() => import("./pages/feedback/FeedbackListPage"));

// Recetarios
const RecetariosLayout = lazyLoad(() => import("./pages/recetarios/RecetariosLayout"));
const RecetariosListPage = lazyLoad(() => import("./pages/recetarios/RecetariosListPage"));
const RecetarioDetailPage = lazyLoad(() => import("./pages/recetarios/RecetarioDetailPage"));
const RecetarioFormPage = lazyLoad(() => import("./pages/recetarios/RecetarioFormPage"));

// Gastos
const ExpensesLayout = lazyLoad(() => import("./pages/expenses/ExpensesLayout"));
const ExpensesDashboard = lazyLoad(() => import("./pages/expenses/ExpensesDashboard"));
const ExpensesListPage = lazyLoad(() => import("./pages/expenses/ExpensesListPage"));
const ExpenseFormPage = lazyLoad(() => import("./pages/expenses/ExpenseFormPage"));
const ExpenseDetailPage = lazyLoad(() => import("./pages/expenses/ExpenseDetailPage"));
const ExpenseCategoriesPage = lazyLoad(() => import("./pages/expenses/CategoriesPage"));
const RecurringPage = lazyLoad(() => import("./pages/expenses/RecurringPage"));

// Estadísticas
const AnalyticsLayout = lazyLoad(() => import("./pages/analytics/AnalyticsLayout"));
const FinancialDashboard = lazyLoad(() => import("./pages/analytics/FinancialDashboard"));

// Juegos
const GamesListPage = lazyLoad(() => import("./pages/game/GamesListPage"));
const GameInstructionsPage = lazyLoad(() => import("./pages/game/GameInstructionsPage"));
const QRScanPage = lazyLoad(() => import("./pages/game/QRScanPage"));
const JoinRoomPage = lazyLoad(() => import("./pages/game/JoinRoomPage"));
const GameRoomPage = lazyLoad(() => import("./pages/game/GameRoomPage"));
const GamesAdminPage = lazyLoad(() => import("./pages/game/GamesAdminPage"));

// Impostor Frostbyte
const ImpostorSetupPage = lazyLoad(() => import("./pages/game/impostor-frostbyte/ImpostorSetupPage"));
const ImpostorGamePage = lazyLoad(() => import("./pages/game/impostor-frostbyte/ImpostorGamePage"));

const LandingPage = lazyLoad(() => import("./pages/LandingPage"));
const AdminRoute = lazyLoad(() => import("./components/AdminRoute"));

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
  // Panel YouTube (protegido)
  {
    path: "/youtube",
    element: (
      <Lazy>
        <ProtectedRoute>
          <YouTubeAdminPage />
        </ProtectedRoute>
      </Lazy>
    ),
  },
  // Pantalla TV YouTube (publico, para la TV del local)
  {
    path: "/youtube-tv",
    element: (
      <Lazy>
        <YouTubeTVPage />
      </Lazy>
    ),
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
  // Panel de recetarios (empleados y admin)
  {
    path: "/recetarios",
    element: (
      <Lazy>
        <ProtectedRoute>
          <RecetariosLayout />
        </ProtectedRoute>
      </Lazy>
    ),
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <RecetariosListPage />
          </Lazy>
        ),
      },
      {
        path: "nuevo",
        element: (
          <Lazy>
            <AdminRoute>
              <RecetarioFormPage />
            </AdminRoute>
          </Lazy>
        ),
      },
      {
        path: "editar/:slug",
        element: (
          <Lazy>
            <AdminRoute>
              <RecetarioFormPage />
            </AdminRoute>
          </Lazy>
        ),
      },
      {
        path: ":slug",
        element: (
          <Lazy>
            <RecetarioDetailPage />
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
  // Impostor Frostbyte
  {
    path: "/game/impostor-frostbyte/setup",
    element: (
      <Lazy>
        <ImpostorSetupPage />
      </Lazy>
    ),
  },
  {
    path: "/game/impostor-frostbyte/play",
    element: (
      <Lazy>
        <ImpostorGamePage />
      </Lazy>
    ),
  },
]);
