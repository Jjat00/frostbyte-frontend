# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Frostbyte is a **frontend-only** React 18 + Vite 6 SPA for restaurant management. The backend (Django REST API) is **not included** in this repo; the frontend connects to it via `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`). Without the backend, the UI renders but API-dependent features show errors — this is expected.

### Running the dev server

```bash
npm run dev   # Vite dev server on port 3000
```

A `.env` file is required (copy from `.env.example` if missing). The dev server binds to `0.0.0.0:3000` (`host: true` in `vite.config.js`).

### Build

```bash
npm run build   # Production build to dist/
```

There are Rollup warnings about circular dependencies in `recharts` — these are harmless and come from the upstream library.

### Lint / Test

No lint or test scripts are currently configured in `package.json`. There is no ESLint, Prettier, or test framework set up in this repo.

### Key caveats

- **No backend in this repo**: All API/WebSocket features require the external Django backend. Public pages (`/`, `/game/*`, `/login`) render without it.
- **Feature flags**: Controlled via `VITE_ENABLE_*` env vars in `.env`. `VITE_ENABLE_MOCK_DATA=true` may allow some frontend-only testing without a backend.
- **Port 3000**: The Vite dev server is hardcoded to port 3000 in `vite.config.js`.
