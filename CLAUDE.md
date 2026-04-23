# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frostbyte is a restaurant management web application with a public digital menu and comprehensive backend integration. It includes modules for inventory, orders, products, expenses, music requests, customer feedback, and interactive game rooms.

## Development Commands

```bash
npm run dev      # Start development server on port 5173
npm run build    # Build for production
npm run preview  # Preview production build
```

Note: No lint or test scripts are currently configured.

## Tech Stack

- **Frontend**: React 18 with Vite 6
- **Styling**: Tailwind CSS 4 + Radix UI components
- **Routing**: React Router v7
- **State Management**: Zustand (global state) + TanStack React Query (server state)
- **HTTP Client**: Axios with token refresh interceptors
- **Real-time**: Native WebSocket API for game rooms
- **Backend API**: Django REST API at `localhost:8000/api/v1`

## Architecture

### Directory Structure

- `src/components/` - Reusable UI components, with `/ui` for primitives
- `src/pages/` - Page components organized by feature module (inventory, orders, products, expenses, music, feedback, game)
- `src/services/` - API service modules with centralized HTTP client
- `src/stores/` - Zustand stores (`useAuthStore`, `useProductStore`)
- `src/hooks/` - Custom React hooks
- `src/config/` - Environment configuration
- `src/lib/` - Utilities including `cn()` for Tailwind class merging

### State Management Pattern

1. **Zustand** for global client state (auth, cart)
2. **React Query** for server state with 5-minute stale time
3. **Local useState** for component-level UI state

### API Service Pattern

Services in `src/services/` use `apiClient` (Axios wrapper) with:
- Request interceptor that adds Bearer token from localStorage
- Response interceptor that handles 401 errors with automatic token refresh
- Centralized endpoints in `src/services/api/endpoints.js`

### Authentication Flow

- Tokens stored in localStorage: `frostbyte_access_token`, `frostbyte_refresh_token`, `frostbyte_user`
- Two roles: `admin` and `employee`
- `ProtectedRoute` wrapper for authenticated routes
- `AdminRoute` wrapper for admin-only routes

### Routing Structure

- `/` - Public menu (landing page)
- `/mesa/:tableNumber` - Table tracking
- `/login` - Authentication
- `/home` - Dashboard (protected)
- `/inventario/*` - Inventory management (admin only)
- `/pedidos/*` - Orders management (protected)
- `/productos/*` - Product management (protected, some admin-only)
- `/gastos/*` - Expense tracking (admin only)
- `/musica/*` - Song requests (protected)
- `/feedback/*` - Customer feedback (protected)
- `/game/*` - Public game routes + `/juegos-admin` for administration

## Conventions

### File Naming

- Components: PascalCase (e.g., `HomePage.jsx`)
- Services: camelCase with `.service.js` suffix
- Stores: `use*` prefix (e.g., `useAuthStore.js`)
- Hooks: `use*` prefix (e.g., `useGameRoomWebSocket.js`)

### Import Alias

Use `@/` for imports from `src/` directory (configured in vite.config.js)

### Styling

- Dark cyberpunk theme with custom colors: primary (#ff00d4 magenta), secondary (#00e0ff cyan)
- Use `cn()` utility from `@/lib/utils` for merging Tailwind classes
- Orbitron font for headings

### Commit Format

Use emoji conventional commits (see `.claude/commands/commit.md`):
- ✨ `feat:` - New feature
- 🐛 `fix:` - Bug fix
- 📝 `docs:` - Documentation
- ♻️ `refactor:` - Code refactoring
- 💄 `style:` - Formatting/style
