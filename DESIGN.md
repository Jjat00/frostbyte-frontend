---
name: Frostbyte
description: Hielo de neón — bar de bebidas frías en Cumbal; oscuro, translúcido y táctil.
colors:
  dark: "#0a0b14"
  dark-secondary: "#12141f"
  light: "#e8f6ff"
  gray: "#8a8d9c"
  primary: "#ff00d4"
  secondary: "#00e0ff"
  gold: "#f2c53d"
  grass: "#1e9e5a"
  delivery-emerald: "#34d399"
  delivery-emerald-deep: "#059669"
  border: "oklch(0.27 0.03 255)"
  muted-foreground: "oklch(0.55 0.02 250)"
  destructive: "oklch(0.6 0.2 25)"
typography:
  display:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "clamp(2rem, 9vw, 7.5rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.05em"
rounded:
  sm: "calc(0.5rem - 4px)"
  md: "calc(0.5rem - 2px)"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.25rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.dark}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.5rem"
  button-primary-hover:
    backgroundColor: "rgba(255, 0, 212, 0.9)"
  button-cta:
    backgroundColor: "linear-gradient(90deg, #ff00d4 0%, #00e0ff 100%)"
    textColor: "{colors.dark}"
    rounded: "{rounded.2xl}"
    padding: "0.75rem 1rem"
    typography: "{typography.label}"
  button-add:
    backgroundColor: "linear-gradient(90deg, #ff00d4 0%, #00e0ff 100%)"
    textColor: "{colors.dark}"
    rounded: "{rounded.full}"
    width: "2.5rem"
    height: "2.5rem"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.gray}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1rem"
  chip-filter:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "rgba(255, 255, 255, 0.6)"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
    typography: "{typography.label}"
  chip-filter-selected:
    backgroundColor: "linear-gradient(90deg, #34d399 0%, #059669 100%)"
    textColor: "{colors.dark}"
  card-product:
    backgroundColor: "rgba(255, 255, 255, 0.04)"
    textColor: "{colors.light}"
    rounded: "{rounded.2xl}"
    padding: "0.75rem"
  card-glass:
    backgroundColor: "rgba(255, 255, 255, 0.07)"
    textColor: "{colors.light}"
    rounded: "{rounded.2xl}"
    padding: "1.25rem"
  input-search:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.light}"
    rounded: "{rounded.2xl}"
    padding: "0.75rem 2.5rem"
---

# Design System: Frostbyte

## Overview

**Creative North Star: "Hielo de Neón"**

Frostbyte se ve como un vaso helado bajo la luz de un bar: el fondo es la noche (`#0a0b14`), las superficies son hielo traslúcido con el borde escarchado, y el color entra como los tubos de neón detrás de la barra — magenta y cyan, siempre juntos. Nada en el sistema es opaco por accidente: cuando una superficie se separa del fondo, lo hace dejando pasar algo de luz, no pintándose de gris.

La densidad es de aplicación, no de folleto: cuerpo pequeño (0.875rem), filas compactas, etiquetas en versalitas espaciadas. Orbitron es la única familia y carga todo el peso de la identidad; por eso los títulos crecen en peso (700–900) antes que en tamaño, y el cuerpo se mantiene deliberadamente por debajo de `text-base` — Orbitron es ancha y a mayor tamaño rompe las filas de datos en pantallas de 360px.

El sistema está construido bajo una restricción física, no estética: buena parte del público entra desde celulares de gama baja. Por eso el vidrio es real en escritorio y se convierte en fondo casi sólido por debajo de 768px, los blur grandes se recortan a 40px y las animaciones decorativas infinitas se detienen. Esa degradación no es un parche: es parte del diseño, y una pantalla que solo funciona con blur encendido está mal hecha.

**Key Characteristics:**
- Fondo nocturno casi negro con superficies traslúcidas de vidrio líquido.
- El gradiente magenta → cyan como firma única de marca.
- Orbitron en todo: una sola familia, jerarquía por peso y espaciado.
- Relieve construido con luz (borde 1px + reflejo especular), no con sombras duras.
- Radios generosos y objetivos grandes: primero el pulgar, después el ratón.
- Todo el sistema vive en un solo archivo (`src/theme.css`); cambiar de temática es cambiar tokens.

## Colors

Una paleta de dos neones sobre noche azulada, con dos acentos funcionales que no pertenecen a la marca sino al trabajo que hacen.

### Primary
- **Magenta Neón** (`#ff00d4`): color de marca y de acción. Botón primario, anillo de foco (`--color-ring`), estado activo de la pestaña Carta, arranque del gradiente de firma. Sobre él siempre va texto `#0a0b14`, nunca blanco.

### Secondary
- **Cyan Escarcha** (`#00e0ff`): el compañero inseparable del magenta y el color del dato. Precios, cifras, valores destacados, cierre del gradiente de firma y el thumb del scrollbar. Es el acento más usado de la app, precisamente porque los números mandan.

### Tertiary
- **Oro de Consumo** (`#f2c53d`): acciones y valores de compra — cuenta del cliente, dinero, premios. Nunca decorativo.
- **Esmeralda de Domicilio** (`#34d399` → `#059669`): identidad exclusiva de `/domicilios` y del pedido en curso (chip de categoría seleccionado, punto verde de pedido activo, foco del buscador de la tienda). Marca el territorio de la tienda dentro de la app.
- **Verde Cancha** (`#1e9e5a`): superviviente del tema `theme-26`; solo vive en las páginas históricas de la Polla.

### Neutral
- **Noche Frostbyte** (`#0a0b14`): fondo global, y también fondo de tarjetas opacas y popovers. Es el negro de la marca, azulado, nunca `#000`.
- **Noche Elevada** (`#12141f`): superficies y cards que necesitan despegarse un paso del fondo; es también el color con el que el móvil sustituye el vidrio.
- **Hielo** (`#e8f6ff`): texto principal. Blanco con temperatura fría, nunca `#fff` puro para texto corrido.
- **Gris Vapor** (`#8a8d9c`): texto secundario, descripciones, labels apagadas.
- **Borde Profundo** (`oklch(0.27 0.03 255)`): bordes, inputs y superficies `muted` del sistema Radix.
- **Velos de blanco**: la escala real de superficies no es un token sino una convención — `rgba(255,255,255,0.04)` para tarjetas, `0.05` para campos y chips, `0.08–0.13` para bordes. Es el equivalente frío de una escala de grises.

### Named Rules

**La Regla de la Pareja.** Magenta y cyan no son dos acentos: son uno. La firma de la marca es el gradiente `from-primary to-secondary` (135° en superficies, 90° en controles). Un acento suelto es énfasis local; el gradiente es identidad.

**La Regla del Semáforo Funcional.** Oro = dinero y compra. Esmeralda = domicilios. Rojo (`destructive`) = destruir. Esos tres nunca se mezclan entre sí ni con la pareja de marca en el mismo elemento; su valor es que significan algo.

**La Regla del Color de Contenido.** Los gradientes de identidad por producto (`productStyles.js`: ámbar de cerveza, rojo de vino, verde de lulada) y las paletas de series en gráficas **no son tema**. No se tokenizan, no se reemplazan al cambiar de skin y no se corrigen para "armonizar" con la marca.

## Typography

**Display Font:** Orbitron (con fallback `sans-serif`)
**Body Font:** Orbitron (la misma; `--font-display` y `--font-body` apuntan a la misma familia en el tema base)

**Character:** Orbitron es geométrica, ancha y técnica — dice "hielo y máquina" antes de que se lea una palabra. Al ser familia única, toda la jerarquía se construye con peso, tamaño y espaciado; el sistema suena monolítico a propósito.

### Hierarchy
- **Display** (900, `clamp(2rem, 9vw, 7.5rem)`, line-height 1, tracking -0.025em): solo el nombre de la marca en el hero de la carta. Va en `text-light` sólido o recortado sobre el gradiente de firma (`bg-clip-text`).
- **Headline** (700, 1.875rem / `text-3xl`): títulos de sección en páginas públicas y encabezados de módulo.
- **Title** (700, 1.125rem / `text-lg`): títulos de tarjeta, de diálogo y de bloque dentro de una vista.
- **Body** (400–700, 0.875rem / `text-sm`, line-height ~1.6): el cuerpo real de la aplicación. Nombres de producto en negrita a este tamaño; descripciones en `text-gray`.
- **Label** (700, 0.75rem / `text-xs`, tracking 0.05em, mayúsculas): chips, badges, estados, botones compactos, metadatos.

### Named Rules

**La Regla de la Familia Única.** Un tema = una familia. Meter una segunda fuente "de apoyo" rompe el sistema; la única forma legítima de traer otra tipografía es definir un tema nuevo en `theme.css` que redefina `--font-display` y `--font-body` juntos (como hizo `.theme-26` con Archivo + Noto Sans).

**La Regla de la Versalita Espaciada.** Todo texto pequeño en mayúsculas lleva `tracking-wide` o mayor. Orbitron en versalitas apretadas se vuelve ilegible a 12px; el espaciado no es estilo, es legibilidad.

**La Regla del Cuerpo Pequeño.** `text-sm` es el cuerpo, no `text-base`. Subir el cuerpo global rompe las filas de datos en pantallas de 360px. La jerarquía se gana con peso (400 → 700 → 900), no subiendo tamaños.

## Layout

Contenedores estrechos y centrados: `max-w-2xl` para lectura y flujos de una columna (el más usado del proyecto), `max-w-md` para hojas, diálogos y la barra de carrito, `max-w-6xl`/`max-w-7xl` solo para rejillas de catálogo y paneles de escritorio. Los breakpoints son los de Tailwind por defecto (`sm` 640, `md` 768, `lg` 1024, `xl` 1280), con **768px como frontera real del sistema**: no es solo un cambio de columnas, es donde se apaga el vidrio.

El ritmo vertical es de aplicación: `p-3`/`p-4` dentro de tarjetas, `p-5` en diálogos, `gap-2`/`gap-3` entre controles, `mt-4`/`mt-5` entre bloques de una sección. Las rejillas de producto van a 2 columnas en móvil y crecen hasta 5 en `xl`.

Las superficies de navegación son pegajosas por capas: header arriba (`top-0`), chips de categoría justo debajo (`sticky top-14`), y abajo la barra de carrito flotante sobre la tab bar del cliente. En escritorio, las vistas con detalle abandonan el modal y pasan a maestro-detalle de dos columnas.

### Named Rules

**La Regla del Pulgar.** En móvil, lo que se toca vive abajo: barra de carrito, tab bar, bottom sheets, botón de confirmar. Arriba solo va lo que se lee. Un flujo que obliga a estirar el pulgar hasta el borde superior está mal resuelto.

**La Regla del Hueco Inferior.** Toda pantalla que monte `CustomerTabBar` reserva `pb-[calc(4.5rem+env(safe-area-inset-bottom))]` (exportado como `tabBarSpacing`). Sin eso, la última fila queda bajo la barra y nadie la ve.

## Elevation & Depth

El sistema es de **vidrio líquido**: no hay elevación por sombra al estilo Material. Una superficie se separa del fondo dejando pasar luz — `backdrop-filter: blur(20px) saturate(1.4)`, un gradiente de blanco al 10 %→4 %, un borde de `rgba(255,255,255,0.13)` y dos reflejos especulares en pseudo-elementos (`::before` para la luz curva del borde superior, `::after` para la refracción que tiñe las esquinas con el cyan y el magenta del tema activo). La sombra existe pero es atmósfera: `0 8px 32px rgba(0,0,0,0.3)`, difusa y sin dirección clara.

Por debajo de 768px todo eso se apaga: `backdrop-filter: none` y fondo `color-mix` de `--color-dark-secondary` al 72 % (66 % en la variante interactiva, 55 % en las ligeras); los blur decorativos grandes se recortan a 40px y `animate-pulse`/`animate-ping` se detienen. Los spinners de carga se respetan siempre porque comunican estado.

### Shadow Vocabulary
- **Ambiente de vidrio** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.3)`): la superficie base de `.liquid-glass`.
- **Ambiente ligero** (`inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.15)`): elementos anidados dentro de otra superficie de vidrio.
- **Halo de acción** (`0 -4px 28px color-mix(in srgb, var(--color-secondary) 40%, transparent)`): reservado a la barra de carrito flotante. Es la única sombra de color del sistema y anuncia que el elemento flota sobre todo lo demás.

### Named Rules

**La Regla de la Luz.** El relieve lo hace la luz, no la sombra: borde de 1px y reflejo especular superior. Las sombras negras son ambiente difuso. Prohibidas las sombras duras, dirigidas o escalonadas por nivel.

**La Regla del Vidrio que se Apaga.** El vidrio es progresivo. Toda pantalla debe leerse resuelta **sin** `backdrop-filter`, porque en móvil no lo tendrá. Diseñar con el blur encendido y confiar en él es un defecto, no una decisión.

**La Regla del Bloque Contenedor.** Los reflejos son `position: absolute; inset: 0`, así que cualquier superficie de vidrio necesita ser su propio bloque contenedor (las clases `.liquid-glass*` ya aplican `position: relative` en `@layer components`). Si una utilidad de posición gana, el brillo se escapa a toda la pantalla.

## Shapes

Rectángulos de esquinas suaves y círculos, nada intermedio. El radio crece con la superficie: controles y filas a `0.5rem` (`rounded-lg`, el más usado del proyecto), tarjetas y campos a `0.75–1rem` (`rounded-xl`/`rounded-2xl`), hojas inferiores a `1rem` en las esquinas superiores. Todo lo que es identidad o acción circular va a `rounded-full`: avatares, botón de agregar, chips de categoría, badges de conteo, puntos de estado.

Los bordes son un miembro de pleno derecho del sistema, no un detalle: casi toda superficie lleva `border` de blanco entre 6 % y 13 %. Es lo que dibuja la silueta sobre un fondo casi negro cuando el vidrio está apagado.

**La Regla del Redondeo Creciente.** A mayor superficie, mayor radio. Un chip con radio de tarjeta parece un botón roto; una tarjeta con radio de chip parece un recorte.

## Components

### Buttons
- **Carácter:** táctiles y rápidos — hechos para el pulgar, con respuesta física al toque (`active:scale-95`, `active:scale-[0.98]`) antes que estados sutiles de hover.
- **Shape:** esquinas suaves (`0.5rem`) en el primitivo; los CTA de pantalla completa suben a `1rem`; los circulares van a `full`.
- **Primary:** fondo magenta sólido con texto noche, alto fijo de 2.5rem y `px-4`; hover baja la opacidad al 90 %.
- **CTA de marca:** el gradiente magenta → cyan con texto noche, en versalitas espaciadas. Reservado a la acción principal de una pantalla (barra de carrito, confirmar, agregar).
- **Hover / Focus:** `transition-colors` a 300ms como norma; foco visible con anillo de 2px en `--color-ring` (magenta) y offset de 2px. El foco nunca se desactiva.
- **Ghost / Secundario:** blanco al 4 % con texto gris que pasa a hielo en hover; es el "Cancelar" de todo el sistema.

### Chips
- **Style:** píldora de blanco al 5 % con borde al 10 % y texto blanco al 60 %, en versalitas de 12px espaciadas.
- **State:** seleccionado = gradiente esmeralda con texto noche en la tienda de domicilios; en el resto de la app, el estado activo usa la pareja de marca. Las filas de chips desbordan en scroll horizontal sin barra visible (`.no-scrollbar`).

### Cards / Containers
- **Corner Style:** `1rem` (`rounded-2xl`) en tarjeta de producto; `0.75rem` en filas y bloques internos.
- **Background:** blanco al 4 % sobre el fondo noche para tarjetas de catálogo; `.liquid-glass` para lo que flota; `--color-dark-secondary` para paneles opacos.
- **Shadow Strategy:** ver Elevation & Depth. Las tarjetas de catálogo van **planas**: solo fondo y borde.
- **Border:** blanco al 8 % constante; es lo que las dibuja cuando el vidrio está apagado.
- **Internal Padding:** `0.75rem` en tarjeta compacta, `1.25rem` en diálogo.

### Inputs / Fields
- **Style:** blanco al 5 % con borde al 10 %, radio `1rem`, `py-3` y texto a 1rem (tamaño mayor que el cuerpo: en iOS un input por debajo de 16px provoca zoom automático).
- **Focus:** el borde adopta el color del territorio al 40 % (esmeralda en la tienda, magenta en el resto); sin `outline` del navegador, pero nunca sin señal.
- **Detalles:** icono a la izquierda en blanco al 35 %, botón de limpiar circular a la derecha, `placeholder` en blanco al 30 %.

### Navigation
- **Header:** superficie de vidrio pegada arriba con el logotipo a la izquierda; en móvil, menú hamburguesa; en escritorio, enlaces en versalitas.
- **Tab bar del cliente (móvil):** tres destinos fijos —Carta · Domicilios · Mi cuenta— con icono y etiqueta, **fondo casi sólido y sin blur a propósito**. Cada destino enciende su color de territorio (Carta = magenta, Domicilios = esmeralda, Mi cuenta = oro). Un punto verde sobre Mi cuenta anuncia pedido en curso. Tocar la pestaña activa vuelve arriba.
- **Chips de categoría:** segunda barra pegajosa bajo el header (`top-14`), con scroll horizontal.

### Diálogo de confirmación (componente de firma)
Bottom-sheet en móvil y tarjeta centrada en escritorio, con la misma pieza (`ConfirmDialog`). Entra con `y: 40 → 0` y sale igual; fondo de vidrio casi opaco (`rgba(18,20,31,0.96)`), icono en cápsula tonal a la izquierda del título, y dos botones a ancho igual: fantasma para cancelar, tono para confirmar (`default` = gradiente de marca, `danger` = rojo, `success` = verde). Sustituye siempre al `confirm()` del navegador.

### Barra de carrito flotante (componente de firma)
Píldora de gradiente magenta → cyan anclada sobre la tab bar (`bottom-[calc(4rem+env(safe-area-inset-bottom))]`), ancho máximo `max-w-md`, con contador circular sobre el icono, etiqueta en versalitas y total a la derecha. Lleva la única sombra de color del sistema. Es el elemento con más peso visual de toda la app y por eso solo puede haber uno en pantalla.

## Do's and Don'ts

### Do:
- **Do** definir cualquier color o fuente de marca en `src/theme.css` y consumirlo por token (`text-primary`, `from-secondary`, `font-display`) o por `var(--color-primary)`; en canvas, Mapbox o gráficas, leerlo con los helpers de `src/lib/themeColors.js`.
- **Do** usar el gradiente magenta → cyan para la acción principal, y los acentos funcionales (oro = compra, esmeralda = domicilios) para su territorio.
- **Do** diseñar cada pantalla para que se lea sin `backdrop-filter`: en ≤768px el vidrio se apaga y queda el fondo casi sólido más el borde.
- **Do** poner las acciones abajo en móvil y reservar el hueco de la tab bar con `tabBarSpacing`.
- **Do** mantener el cuerpo en `text-sm` y espaciar toda versalita (`tracking-wide` o mayor).
- **Do** usar `ConfirmDialog` para cualquier acción destructiva o de estado (abrir/cerrar el local, borrar, cancelar), con el tono correcto.
- **Do** dejar intactos los gradientes de identidad por producto y las paletas de gráficas: son contenido, no tema.

### Don't:
- **Don't** hardcodear `#ff00d4`, `rgba(255,0,212,…)` ni `"Orbitron"` en un componente. Para transparencias, `color-mix(in srgb, var(--color-primary) 40%, transparent)`.
- **Don't** introducir una segunda familia tipográfica sin definir un tema completo en `theme.css`.
- **Don't** añadir sombras duras, elevaciones escalonadas ni bordes grises opacos: el relieve se hace con luz (borde 1px + reflejo).
- **Don't** meter glows infinitos, `animate-pulse` permanentes ni blur decorativo grande; en gama baja cada efecto se paga en frames y el sistema ya los recorta a la fuerza en móvil.
- **Don't** vestir el panel del staff como un POS genérico (gris corporativo, Material/Bootstrap de caja, tablas densas): sigue siendo Frostbyte, con los mismos tokens y el mismo vidrio.
- **Don't** empujar `/domicilios` hacia la estética de agregador (fondo blanco, naranja, tarjeta plana tipo Rappi): la tienda es Frostbyte en territorio esmeralda.
- **Don't** usar blanco puro (`#fff`) para texto corrido ni negro puro (`#000`) para fondos: son `#e8f6ff` y `#0a0b14`.
- **Don't** poner dos elementos de gradiente de marca compitiendo en la misma pantalla; la barra de carrito ya es el punto más fuerte.
