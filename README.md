# Frostbyte Frontend

Aplicación web para gestión de negocios de bebidas preparadas (granizados, frappés, cócteles), bares y restaurantes. Incluye menú digital público, sistema de pedidos, inventario, gastos operacionales y salas de juego interactivas.

## Stack Tecnológico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| React | 18.2.0 | Librería UI |
| Vite | 6.0.0 | Build tool y dev server |
| React Router | 7.11.0 | Enrutamiento SPA |
| Zustand | 5.0.9 | Estado global del cliente |
| TanStack Query | 5.90.12 | Estado del servidor y caché |
| Axios | 1.13.2 | Cliente HTTP |
| Tailwind CSS | 4.0 | Framework CSS |
| Radix UI | - | Componentes accesibles |
| Framer Motion | - | Animaciones |
| Recharts | - | Gráficos y visualizaciones |

## Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   └── ui/             # Componentes primitivos (botones, forms, etc.)
├── pages/              # Páginas por módulo funcional
│   ├── orders/         # Gestión de pedidos
│   ├── products/       # Catálogo de productos
│   ├── inventory/      # Control de inventario
│   ├── expenses/       # Gastos operacionales
│   ├── game/           # Salas de juego públicas
│   └── ...
├── services/           # Módulos de servicio API
│   └── api/           # Endpoints centralizados
├── stores/            # Stores de Zustand
├── hooks/             # Custom hooks de React
├── config/            # Configuración de entorno
└── lib/               # Utilidades (cn() para Tailwind)
```

## Funciones Principales

### Menú Digital Público
- Visualización de productos por categorías
- Tracking por mesa (`/mesa/:tableNumber`)
- Solicitudes de música
- Sistema de feedback

### Panel de Administración
- **Productos**: CRUD de categorías, productos y variantes
- **Pedidos**: Gestión del ciclo de vida de pedidos (Pendiente → Preparando → Listo → Entregado)
- **Inventario**: Control de materias primas, recetas y órdenes de compra
- **Gastos**: Seguimiento de gastos operacionales y recurrentes
- **Analytics**: Dashboard con métricas de ventas

### Generador de Imágenes IA
- Generación de imágenes de productos con GPT Image 1.5
- Galería de imágenes generadas
- Control de límites de uso

### Sistema de Juegos
- "Duelo Frostbyte" - Juego de tiempo de reacción multijugador
- Conexión WebSocket en tiempo real
- Salas de juego con códigos únicos

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Menú digital |
| `/mesa/:tableNumber` | Público | Tracking por mesa |
| `/login` | Público | Autenticación |
| `/home` | Protegido | Dashboard principal |
| `/inventario/*` | Admin | Gestión de inventario |
| `/pedidos/*` | Protegido | Gestión de pedidos |
| `/productos/*` | Protegido/Admin | Catálogo de productos |
| `/gastos/*` | Admin | Control de gastos |
| `/game/*` | Público | Salas de juego |
| `/juegos-admin/*` | Admin | Administración de juegos |

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## Configuración

Copiar `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

Ver [.env.example](.env.example) para las variables disponibles.

## Autenticación

- Tokens JWT almacenados en localStorage
- Access token: 12 horas
- Refresh token: 7 días con rotación
- Roles: `admin` y `employee`

## Patrones de Desarrollo

### Estado
1. **Zustand**: Estado global del cliente (auth, UI)
2. **React Query**: Estado del servidor con stale time de 5 minutos
3. **useState**: Estado local de componentes

### Servicios API
- Interceptor de request añade Bearer token
- Interceptor de response maneja 401 con refresh automático
- Endpoints centralizados en `src/services/api/endpoints.js`

### Estilos
- Tema dark cyberpunk
- Colores primarios: magenta (#ff00d4), cyan (#00e0ff)
- Fuente Orbitron para headings
- Usar `cn()` de `@/lib/utils` para merge de clases

## Scripts

```bash
npm run dev      # Desarrollo en puerto 3000
npm run build    # Build de producción
npm run preview  # Preview del build
```
