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

- **The entire design system lives in `src/theme.css`** (single source of truth): color tokens, `--font-display`/`--font-body`, radii, and alternative themes as `.theme-<name>` classes (activated on `<body>` globally or on a page's root container locally, e.g. `.theme-26` on the Polla pages).
- Base theme: dark cyberpunk — primary (#ff00d4 magenta), secondary (#00e0ff cyan), Orbitron font. To retheme the whole app, edit tokens in `theme.css` only.
- NEVER hardcode brand colors or fonts in components. Use token utilities (`text-primary`, `from-secondary`…); in inline/arbitrary styles use `var(--color-primary)` and `color-mix(in srgb, var(--color-primary) 40%, transparent)`; in canvas/Mapbox/charts/framer-motion-animated values use the helpers in `src/lib/themeColors.js`.
- Known exceptions that intentionally don't follow the theme: product-identity gradients in menu sections, data-viz series palettes, `FrostbyteTVPage`, `impostorAvatars.js`, `qrStyling.js`.
- **The public menu (`/` and `/mesa/*`) has its own visual layer in `src/minimal.css`** (imported after `theme.css`): `fb-section`, `fb-card`, `fb-inset`, `fb-eyebrow`, `fb-rule`, `fb-hairline`, `fb-btn`, `fb-pill`, `fb-reveal`. Build customer-facing sections with those instead of `liquid-glass` + `backdrop-blur` + gradient headings. Per-section content color goes in the `--fb-accent` / `--fb-accent-2` CSS variables on the section element. Everything there lives in `@layer components` on purpose: in Tailwind v4 unlayered CSS beats every utility, so without the layer a `px-4` next to `fb-btn` would do nothing.
- Section headings use `SectionHeading.jsx`; the "extras" blocks at the foot of a menu section use `CartaExtras.jsx`.
- Use `fb-screen` (not `fb-section`) on the ROOT of a full screen: `fb-section` sets `overflow: hidden`, which disables any `position: sticky` inside it — several customer screens have sticky headers or sticky category chips.
- Putting `fb-btn` on a shadcn `<Button>` paints two backgrounds: the component already carries `bg-primary`, and `fb-btn` is not a Tailwind utility so tailwind-merge does not dedupe it. Add `bg-transparent text-light hover:bg-transparent`, or use a plain `<button>`.
- Use `cn()` utility from `@/lib/utils` for merging Tailwind classes

### Commit Format

Use emoji conventional commits (see `.claude/commands/commit.md`):
- ✨ `feat:` - New feature
- 🐛 `fix:` - Bug fix
- 📝 `docs:` - Documentation
- ♻️ `refactor:` - Code refactoring
- 💄 `style:` - Formatting/style
