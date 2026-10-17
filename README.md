# Frostbyte

Aplicación web del local Frostbyte (granizados y cocteles en Cumbal, Nariño), en producción en [frostbyte.com.co](https://frostbyte.com.co). Dos caras: la **carta digital pública** en `/` (con pedidos a domicilio y para recoger, reservas y cuenta de cliente con Google) y los **módulos de gestión** para el equipo (pedidos y cocina, mesas por piso, productos, inventario, gastos, analítica, música, recetarios, reservas, juegos y el agente de WhatsApp Frosty). En `/landing` está la página comercial de Frostbyte como plataforma para restaurantes y bares.

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
| Framer Motion + GSAP | 10 / 3.14 | Animaciones (GSAP en heros y landing) |
| Mapbox (`react-map-gl`) | 3.25 | Mapa de domicilios y zona de cobertura |
| `@react-oauth/google` | 0.13 | Cuenta de cliente con Google |
| Recharts | - | Gráficos y visualizaciones |

## Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   └── ui/             # Componentes primitivos (botones, forms, etc.)
├── pages/              # Páginas por módulo funcional
│   ├── orders/         # Pedidos, cocina, mesas, historial y estadísticas
│   ├── products/       # Catálogo, categorías, modificadores y generador IA
│   ├── inventory/      # Control de inventario
│   ├── expenses/       # Gastos operacionales
│   ├── analytics/      # Finanzas, canales y clientes, horario del local
│   ├── customer/       # Cuenta Google, domicilios, mis pedidos, reservas, concurso
│   ├── whatsapp/       # Configuración de Frosty y bandeja de chats
│   ├── reservations/   # Gestión de reservas (staff)
│   ├── contests/       # Panel de barra del concurso
│   ├── recetarios/     # Recetarios del equipo
│   ├── music/ · youtube/  # Paneles de música y pantalla TV
│   ├── game/           # Duelo Frostbyte e Impostor
│   ├── LandingPage.jsx # Landing comercial (/landing)
│   └── ...
├── services/           # Módulos de servicio API
│   └── api/           # Endpoints centralizados
├── stores/            # Stores de Zustand (auth staff, auth cliente, negocio, carrito…)
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
| **Tracking por Mesa** | Menú accesible por mesa con todas las funciones anteriores | `/mesa/:floor/:tableNumber` y `/mesa/:tableNumber` |

### Vistas Privadas (Panel de Administración)
| Feature | Página | Descripción |
|---------|--------|-------------|
| **Generador de Imágenes** | `/productos/generador-ia` | Carga imagen original + referencia, selecciona modelo (GPT Image 1.5 por defecto, GPT Image 2, Gemini Pro o Flash), escribe prompt, genera imagen profesional. También se abre desde el formulario de producto y las galerías |
| **Frosty (agente de WhatsApp)** | `/agente-whatsapp` · `/chats-whatsapp` | Configuración del agente (admin) y bandeja de chats de solo lectura (admin y empleados) |
| **Galería de Generaciones** | Pestaña dentro del generador | Historial de imágenes generadas con metadatos |
| **Sugerencia de Descripción** | Formulario de productos | Genera descripciones automáticas para nuevos productos |

---

## Funciones Principales

### Menú Digital Público
- Visualización de productos por categorías
- Quiz recomendador con IA (GPT-4o-mini)
- Frase motivacional diaria con IA (GPT-4o-mini)
- Transcripción de voz con IA (Whisper)
- Tracking por mesa con piso (`/mesa/:floor/:tableNumber`)
- **Cuenta de cliente con Google** (`/mi-cuenta`): domicilios y pedidos para recoger con carrito, mapa y seguimiento en vivo (`/domicilios`, `/mis-pedidos`), reservas de mesa, grupo o Sala VIP (`/reservas`, `/mis-reservas`) y concurso vigente (`/concurso`)
- Campañas de temporada detrás de un interruptor (heros, banners y tarjeta de celebración en `/amor-amistad/tarjeta`)
- **Solicitudes de música** - el admin elige la fuente (Spotify o YouTube, default YouTube) y los clientes ven la UI correspondiente:
  - **Spotify**: búsqueda, Now Playing con letras sincronizadas, cola en tiempo real
  - **YouTube**: búsqueda de videos, "Reproduciendo ahora" con thumbnail (se actualiza cuando cambia la pantalla del local, incluyendo videos del Mix automático), cola en tiempo real
- Sistema de feedback

### Panel de Administración
- **Productos**: CRUD de categorías, productos y variantes
- **Productos - Generador IA**: AIImageGeneratorPage con generación de imágenes profesionales (Gemini/OpenAI)
- **Negocios**: un mismo equipo opera varios negocios (Frostbyte bebidas y Frostbyte Food); `/seleccionar-negocio` elige con cuál trabajar
- **Pedidos**: Gestión del ciclo de vida de pedidos (Pendiente → Preparando → Listo → Entregado), pantalla de cocina, mesas por piso con sus QR, domicilios, deudas con su antigüedad, historial y estadísticas
- **Reservas** (`/reservas-admin`) y **concurso** (`/concurso-admin`): paneles del staff
- **Recetarios** (`/recetarios`): guías de preparación paso a paso
- **Inventario**: Control de materias primas, recetas y órdenes de compra
- **Gastos**: Seguimiento de gastos operacionales y recurrentes
- **Música**: Panel unificado con pestañas Spotify y YouTube. Selector superior para elegir qué fuente ven los clientes. Cada fuente con sus propios controles:
  - **Spotify**: play, pause, skip, volumen, cola completa de Spotify
  - **YouTube**: búsqueda, recomendaciones basadas en historial/trending, cola, controles de TV, indicador de cuota (unidades usadas/restantes del día)
- **Pantalla TV** (`/youtube-tv`): Vista pública para el televisor del local. Reproduce los videos de la cola en secuencia con YouTube IFrame API. Cuando la cola se vacía, inicia un **Mix automático** basado en la última canción para que siempre haya algo sonando
- **Pantalla Frostbyte TV** (`/frostbyte-tv`): la carta en diapositivas para las pantallas del local
- **Analytics** (`/analytics`, admin): finanzas, canales y clientes (`canales`) y horario real de apertura y cierre (`horario`)

### Generador de Imágenes IA (Privado)
- Generación de imágenes de productos con IA (Gemini / OpenAI)
- Selector de modelo: GPT Image 1.5 (default), GPT Image 2 (sin fondo transparente), Gemini Pro Image, Gemini Flash Image
- Carga de imagen original y imagen de referencia (opcional)
- Editor de prompt con sugerencias preestablecidas
- Toggle para fondo transparente (OpenAI: nativo, Gemini: rembg post-procesado)
- Descarga de imágenes generadas
- Guardado persistente en Cloudflare R2
- Asignación directa a productos
- Galería con historial de generaciones
- Sugerencia automática de descripciones (GPT-4o-mini)

### Música (Spotify + YouTube)
El admin elige la fuente activa desde el selector del panel `/musica`. Los clientes ven sólo la UI de la fuente activa en `SolicitarMusica` (un wrapper que lee el setting y renderiza `SolicitarCancion` o `SolicitarVideo`). Default: **YouTube**.

#### Spotify
- **Vista pública**: Búsqueda de canciones, solicitud con un click
- **Now Playing**: Barra con canción actual, progreso en tiempo real y cola de solicitudes
- **Vista admin**: Controles de playback (play, pause, skip, volumen), cola completa de Spotify
- **Cola**: Las solicitudes de clientes se destacan con badge "Solicitud"
- **Letras sincronizadas**: Admin ve letras completas con auto-scroll; clientes ven línea actual/siguiente
- **Tiempo real**: WebSocket `/ws/music/`

#### YouTube
- **Vista pública (`SolicitarVideo`)**: Búsqueda con debounce (1s, mín 3 chars para optimizar cuota), card de "Reproduciendo ahora" con thumbnail + indicador pulsante + etiqueta ("En vivo en la pantalla" o "Mix automático"), cola de solicitudes con estados
- **Vista admin (`/musica/youtube`)**: Sección de **Recomendaciones** por defecto (videos similares al que suena o trending de música), búsqueda, cola, controles de reproducción, botón "Abrir TV", **indicador de cuota YouTube API** con barra de progreso (verde/amarillo/rojo)
- **Pantalla TV (`/youtube-tv`)**: Página pública para la TV del local. Usa YouTube IFrame Player API a pantalla completa. Dos modos:
  - **Cola**: Reproduce videos solicitados en secuencia
  - **Mix automático**: Cuando la cola se vacía, carga un Mix de YouTube (`RD<videoId>`) con el último video como semilla. Badge "MIX AUTOMATICO" visible. Transiciona solo
- **Visualizer**: Las dos vistas públicas (Spotify y YouTube) incluyen la esfera 3D de partículas animada (`MusicVisualizer`)
- **Tiempo real**: WebSocket `/ws/youtube/` sincroniza el estado de la TV con admin y público

### Sistema de Juegos
- "Duelo Frostbyte" - Juego de tiempo de reacción multijugador
- "Impostor Frostbyte" - Juego de palabras por categoría para grupos
- Conexión WebSocket en tiempo real
- Salas de juego con códigos únicos

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Menú digital con quiz recomendador, frase motivacional y transcripción de voz |
| `/mesa/:floor/:tableNumber` · `/mesa/:tableNumber` | Público | Tracking por mesa con todas las funciones de IA del menú |
| `/mi-cuenta` · `/mis-pedidos` · `/mis-reservas` | Cliente (Google) | Cuenta, pedidos y reservas del cliente |
| `/domicilios` · `/reservas` · `/concurso` | Público / Cliente | Pedir a domicilio o para recoger, reservar, inscribirse al concurso |
| `/landing` | Público | Landing comercial de la plataforma |
| `/privacidad` · `/terminos` | Público | Legales |
| `/amor-amistad/tarjeta` | Público | Tarjeta de celebración de temporada |
| `/login` | Público | Autenticación del staff |
| `/seleccionar-negocio` | Protegido | Elegir negocio activo |
| `/home` | Protegido | Dashboard principal |
| `/agente-whatsapp` | Admin | Configuración de Frosty |
| `/chats-whatsapp/:contactId?` | Protegido | Bandeja de chats de WhatsApp (solo lectura) |
| `/reservas-admin` · `/concurso-admin` | Protegido | Reservas y concurso desde la barra |
| `/recetarios/*` · `/feedback` | Protegido | Recetarios y feedback |
| `/analytics/*` | Admin | Finanzas, canales y horario |
| `/frostbyte-tv` | Público | Carta en diapositivas para las pantallas del local |
| **`/productos/generador-ia`** | **Admin** | **Generador de imágenes IA con selector de modelo (Gemini/OpenAI), editor de prompts, galería y asignación a productos** |
| `/inventario/*` | Admin | Gestión de inventario |
| `/pedidos/*` | Protegido | Gestión de pedidos |
| `/productos/*` | Protegido/Admin | Catálogo, categorías y modificadores, con sugerencia de descripción IA |
| `/gastos/*` | Admin | Control de gastos |
| `/musica` | Protegido | Panel de música - Spotify (index) |
| `/musica/estadisticas` | Protegido | Estadísticas de música (géneros, pisos, horas) |
| `/musica/youtube` | Protegido | Panel de música - YouTube con búsqueda, recomendaciones, cola, controles TV e indicador de cuota |
| `/youtube-tv` | Público | Pantalla TV para el local - reproduce videos en cola y Mix automático a pantalla completa |
| `/game/*` | Público | Salas de juego (Duelo e Impostor) |
| `/juegos-admin/*` | Protegido | Administración de juegos |

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

Ver [.env.example](.env.example) para las variables disponibles: `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`, `VITE_GOOGLE_CLIENT_ID` (cuenta de cliente), `VITE_MAPBOX_TOKEN` (mapa de domicilios) y banderas `VITE_ENABLE_*`.

## Despliegue

Cloudflare Pages con autodeploy en cada push a `main`. `public/_redirects` envía todas las rutas al SPA. El backend vive en el repo `frostbyte-backend` (Railway).

## Autenticación

- Dos sesiones separadas: staff (`useAuthStore`, usuario y contraseña) y cliente con Google (`useCustomerAuthStore`)
- Tokens JWT almacenados en localStorage
- Access token: 12 horas
- Refresh token: 90 días con rotación (ventana deslizante)
- Roles: `admin`, `employee` y `customer`

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
- `aiImage.service.js`: Maneja generación de imágenes (con selección de modelo), descarga y persistencia en R2
- `motivational.service.js`: Recomendaciones por mood/quiz, frases motivacionales, transcripción
- Endpoints centralizados en `src/services/api/endpoints.js` con prefijos `/ai/` y `/motivational/`

### Hooks de IA
- `useImageGeneration()`: Estados y acciones para generador de imágenes
- `useImageValidation()`: Validación de archivos de imagen
- Custom hooks para cada feature de IA con manejo de loading y errores.

### Estilos
- El sistema de diseño vive en `src/theme.css` (tokens de color, fuentes, radios y temas alternativos `.theme-<name>`); nunca colores ni fuentes fijos en componentes
- Tema base dark: magenta (#ff00d4) y cyan (#00e0ff) como `primary`/`secondary`, Orbitron para headings; la carta usa además el lenguaje de `minimal.css` (ver `DESIGN.md`)
- Usar `cn()` de `@/lib/utils` para merge de clases

## Scripts

```bash
npm run dev      # Desarrollo en puerto 5173
npm run build    # Build de producción
npm run preview  # Preview del build
```
