# Frostbyte

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

## Features de IA Integrados

Frostbyte incluye múltiples interfaces de IA en vistas públicas y privadas:

### Vistas Públicas (Menú Digital)
| Feature | Descripción | Componentes |
|---------|-------------|-------------|
| **Quiz Recomendador** | Interfaz interactiva para seleccionar preferencias (temperatura, sabor, alcohol) y obtener recomendación de bebida personalizada | Quiz form, resultado con razón de IA |
| **Generador de Frases** | Widget que muestra frase motivacional diaria o dato histórico actualizado | Frase animada, datos de fecha |
| **Transcripción de Voz** | Opción para dictar estado de ánimo en lugar de escribir, integrado con recomendador | Micrófono input, transcripción real-time |
| **Tracking por Mesa** | Menú accesible por mesa con todas las funciones anteriores | `/mesa/:tableNumber` route |

### Vistas Privadas (Panel de Administración)
| Feature | Página | Descripción |
|---------|--------|-------------|
| **Generador de Imágenes** | `/productos/generador-ia` | Carga imagen original + referencia, escribe prompt, genera imagen profesional |
| **Galería de Generaciones** | Pestaña dentro del generador | Historial de imágenes generadas con metadatos |
| **Sugerencia de Descripción** | Formulario de productos | Genera descripciones automáticas para nuevos productos |

---

## Funciones Principales

### Menú Digital Público
- Visualización de productos por categorías
- Quiz recomendador con IA (GPT-4o-mini)
- Frase motivacional diaria con IA (GPT-4o-mini)
- Transcripción de voz con IA (Whisper)
- Tracking por mesa (`/mesa/:tableNumber`)
- Solicitudes de música con búsqueda en Spotify
- Now Playing bar con canción actual y cola en tiempo real
- Sistema de feedback

### Panel de Administración
- **Productos**: CRUD de categorías, productos y variantes
- **Productos - Generador IA**: AIImageGeneratorPage con generación de imágenes profesionales
- **Pedidos**: Gestión del ciclo de vida de pedidos (Pendiente → Preparando → Listo → Entregado)
- **Inventario**: Control de materias primas, recetas y órdenes de compra
- **Gastos**: Seguimiento de gastos operacionales y recurrentes
- **Música**: Panel con controles de Spotify (play, pause, skip, volumen), cola completa de Spotify con indicador de solicitudes de clientes, búsqueda y gestión de solicitudes
- **Analytics**: Dashboard con métricas de ventas

### Generador de Imágenes IA (Privado)
- Generación de imágenes de productos con GPT Image 1.5
- Carga de imagen original y imagen de referencia (opcional)
- Editor de prompt con sugerencias preestablecidas
- Toggle para fondo transparente
- Descarga de imágenes generadas
- Guardado persistente en Cloudflare R2
- Asignación directa a productos
- Galería con historial de generaciones
- Sugerencia automática de descripciones (GPT-4o-mini)

### Música y Spotify
- **Vista pública**: Búsqueda de canciones en Spotify con debounce, solicitud con un click
- **Now Playing**: Barra con canción actual, progreso en tiempo real y cola de solicitudes
- **Vista admin**: Controles de playback (play, pause, skip, volumen), cola completa de Spotify
- **Cola de Spotify**: Muestra todas las canciones en cola, las solicitudes de clientes se destacan con badge "Solicitud"
- **Gestión de solicitudes**: Cards con estados (pendiente, en cola, reproduciendo, completada, cancelada), acciones de reproducir ahora, cancelar, reactivar, eliminar
- **Letras sincronizadas**: Admin ve letras completas con auto-scroll y línea actual resaltada; clientes ven línea actual y siguiente como subtítulos
- **Tiempo real**: WebSocket para sincronización instantánea de estados entre cliente y admin

### Sistema de Juegos
- "Duelo Frostbyte" - Juego de tiempo de reacción multijugador
- Conexión WebSocket en tiempo real
- Salas de juego con códigos únicos

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Menú digital con quiz recomendador, frase motivacional y transcripción de voz |
| `/mesa/:tableNumber` | Público | Tracking por mesa con todas las funciones de IA del menú |
| `/login` | Público | Autenticación |
| `/home` | Protegido | Dashboard principal |
| **`/productos/generador-ia`** | **Admin** | **Generador de imágenes IA con editor de prompts, galería y asignación a productos** |
| `/inventario/*` | Admin | Gestión de inventario |
| `/pedidos/*` | Protegido | Gestión de pedidos |
| `/productos/*` | Protegido/Admin | Catálogo de productos con sugerencia de descripción IA |
| `/gastos/*` | Admin | Control de gastos |
| `/musica/solicitar` | Público | Solicitar canciones con búsqueda Spotify y Now Playing |
| `/musica/*` | Admin | Panel de música con controles Spotify y gestión de solicitudes |
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

### Servicios de IA
- `aiImage.service.js`: Maneja generación de imágenes, descarga y persistencia en R2
- `motivational.service.js`: Recomendaciones por mood/quiz, frases motivacionales, transcripción
- Endpoints centralizados en `src/services/api/endpoints.js` con prefijos `/ai/` y `/motivational/`

### Hooks de IA
- `useImageGeneration()`: Estados y acciones para generador de imágenes
- `useImageValidation()`: Validación de archivos de imagen
- Custom hooks para cada feature de IA con manejo de loading y errores

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
