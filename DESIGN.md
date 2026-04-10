# Design System - Frostbyte

## Estetica General

Tema **cyberpunk oscuro** con glassmorfismo. Fondo `#0a0b14`, tipografia **Orbitron**.

---

## Paleta de Colores

| Token | Valor | Uso |
|-------|-------|-----|
| **Primary** | `#ff00d4` (magenta) | Botones, focus, acentos |
| **Secondary** | `#00e0ff` (cyan) | Acento alternativo, scrollbar |
| **Dark** | `#0a0b14` | Fondo principal, cards |
| **Dark Secondary** | `#1b1f3b` | Fondos secundarios |
| **Light** | `#e8f6ff` | Texto, foreground |
| **Gray** | `#8a8d9c` | Texto muted |
| **Destructive** | `oklch(0.6 0.2 25)` | Errores |
| **Ring** | `#ff00d4` | Focus indicator |

---

## Tipografia

- **Fuente:** Orbitron (Google Fonts)
- **Pesos:** 400, 500, 600, 700, 800, 900
- Aplicada globalmente en `src/index.css`

---

## Stack de Estilos

- **Tailwind CSS v4** (configurado via `@theme` en `index.css`, sin `tailwind.config.js`)
- **CVA** (class-variance-authority) para variantes de componentes
- **cn()** (`clsx` + `tailwind-merge`) en `src/lib/utils.js`
- **Framer Motion** + **GSAP** para animaciones
- **Lucide React** para iconos

---

## Componentes UI (`src/components/ui/`)

| Componente | Base | Variantes |
|------------|------|-----------|
| **Button** | Radix Slot + CVA | default, destructive, outline, secondary, ghost, link / sizes: sm, default, lg, icon |
| **Toast** | Radix Toast | default, destructive |
| **Navigation Menu** | Radix NavigationMenu | Con animaciones de chevron |
| **ImageUpload** | Custom | Drag & drop, validacion, progreso |

---

## Efectos Liquid Glass (Glassmorfismo)

Definidos en `src/index.css`:

- `.liquid-glass` — backdrop-filter, gradientes, sombras inset
- `.liquid-glass-light` — variante mas ligera
- `.liquid-glass-interactive` — shimmer en hover
- `.liquid-glass-pill` — compacto para pills

Incluyen pseudo-elementos `::before`/`::after` para reflejos especulares.

---

## Animaciones Custom

- `accordion-down/up` — transiciones de altura
- `sway-rope-left/right` — balanceo (seccion Granizados)
- `shimmer` — efecto shimmer
- `ticker` — scroll horizontal continuo
- `liquid-shimmer` — shimmer para glass interactivo

---

## Sistema de Estilos por Producto (`src/lib/productStyles.js`)

100+ estilos especificos por producto con:

- `icon` — componente Lucide
- `gradient` / `visualGradient` / `secondaryGradient`
- `ringColor`, `labelBg`, `accentColor`
- `image`, `brand`, `licor`

**7 categorias** con defaults: granizados, frappes, micheladas, shots, cervezas, vinos, mocktails.

---

## Border Radius

- `--radius-lg`: `0.5rem`
- `--radius-md`: `calc(0.5rem - 2px)`
- `--radius-sm`: `calc(0.5rem - 4px)`

---

## Archivos Clave

1. **Tokens + CSS custom:** `src/index.css`
2. **Componentes UI:** `src/components/ui/`
3. **Estilos por producto:** `src/lib/productStyles.js`
4. **Utilidad cn():** `src/lib/utils.js`
