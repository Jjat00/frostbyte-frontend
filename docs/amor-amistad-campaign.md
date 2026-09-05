# Amor y Amistad: dirección de campaña

Concepto: **Juntos sabe mejor**. La escena de dos bebidas conectadas por un lazo de satén reemplaza las fotografías de catálogo separadas. Una tarjeta con «Nos debemos un brindis» aporta el detalle humano de una dedicatoria. Se conservan el titular «Lo mejor es compartirlo» y el cristal en los controles; desde el 2026-09-05 la paleta es negro mate con vino de acompañamiento.

Es una imagen ambiental generada, no una fotografía de producto ni una promesa sobre la presentación, decoración o accesorios del local. La carta conserva sus productos, fotos y precios. La composición no anuncia promociones ni fechas.

## Referencias consultadas

- [Scarfes Bar](https://scarfesbar.com/): referencia de una carta con concepto narrativo e identidad propia. Se tomó la idea de articular una campaña alrededor de una historia; no sus ilustraciones ni su contenido.
- [Fotografía de bebidas de Brent Herrig](https://brentherrig.com/cocktail-photography): referencia encontrada en la búsqueda de fotografía editorial de bebidas.

## Imagen

Generada con la herramienta integrada `image_gen`, el 2026-09-05, y regenerada el mismo día con `gemini-3.1-flash-image` para pasarla a negro mate conservando la composición. Original conservado fuera del repo. Derivados WebP de 1122 × 1402 (78 KB) y 640 × 800 (30 KB); selección responsive con `srcSet`.

- `public/images/amor-amistad-brindis.webp`
- `public/images/amor-amistad-brindis-mobile.webp`

### Prompt exacto

Use case: ads-marketing. Asset type: original photographic hero for Frostbyte's Amor y Amistad seasonal cocktail menu in Cumbal Colombia. Create a premium editorial still life, portrait 4:5 composition. A pair of exquisite but believable drinks on a polished dark burgundy stone table: a tall clear fluted tumbler containing raspberry pink iced soda with condensation and a small strawberry garnish, beside an elegant short-stem coupe containing pale lime margarita with fine salt rim. A single narrow dusty rose satin ribbon curves gracefully between the bases of the glasses like a loose handwritten ampersand, an intimate symbol of togetherness. One tiny lit candle in a low ribbed glass holder behind and to the left, two subtle rose petals on the table, nothing else. Dark wine background #1b1017, controlled warm side light, delicate caustic reflections, realistic ice, tactile satin, cinematic shadow, museum-quality luxury hospitality campaign photograph. Composition: glasses occupy central 65 percent of frame, all rims and bases fully visible, generous dark negative space top 15 percent and bottom 15 percent for HTML overlay, no text baked into image. Shot at table height slightly above, 85mm lens, beautifully lit details but restrained natural saturation. NOT illustration, NOT CGI, no people, no logos, no labels, no watermark, no borders, no typography, no hearts, no glitter. This is an evocative campaign image, not a specific purchasable product.

### Prompt de la regeneración a negro mate (2026-09-05)

Sobre la imagen anterior como referencia, con `gemini-3.1-flash-image` en 4:5 y 2K:

Rehaz esta fotografia de producto conservando EXACTAMENTE la composicion: mismo encuadre vertical 4:5, mismos dos vasos en las mismas posiciones (el vaso alto estriado a la izquierda, la copa coupe con borde escarchado a la derecha), la vela pequena al fondo izquierdo, la cinta de saten cruzando en diagonal y los petalos. Cambia UNICAMENTE la direccion de color a negro mate: la superficie pasa de marmol vino a marmol NEGRO mate con vetas finas color vino profundo #5e1c2b, apenas visibles, sin brillo espejo, acabado mate satinado suave; el fondo pasa a negro puro #0a0a0a degradando a un halo vino profundo #5e1c2b muy tenue arriba a la derecha, nada de tonos calidos rojizos generalizados; la cinta de saten pasa de rosa a vino #7a2536 con reflejos especulares finos; los petalos pasan a vino profundo, casi negros en las sombras; la bebida del vaso alto conserva su transparencia pero vira a un rojo vino claro #c45a6d en vez de rosa, y la copa de la derecha conserva su tono dorado palido; la vela conserva su luz calida, unica fuente calida de la escena. Fotografia editorial de bar premium, luz lateral suave, sombras profundas y limpias, alto contraste entre el negro del fondo y los cristales. Sin texto, sin logos, sin personas, sin glitter.

## Carta completa y tarjetas personales (2026-09-05)

Se retira la etiqueta visible de mesa/piso de la portada. Los parámetros de la URL siguen gobernando música, seguimiento de pedidos y retorno a la carta. Las secciones reciben encabezados serif, superficies con reflejos, fondos alternos y categorías con más espacio. La marca Frostbyte Food y los precios se conservan.

Generador público en `/amor-amistad/tarjeta`, recuperado a partir de `feature/dia-madre`. El enlace anterior `/dia-madre/generador` redirige a la campaña vigente. Acceso desde la dedicatoria del hero y un banner compartido en `/` y mesas.

API nueva: `POST /api/v1/motivational/celebration-card/`, multipart con `image`, `phrase`, `to_name`, `from_name`. Requiere publicar también la rama `feat/amor-amistad-editorial` del backend.

Dos proveedores en cadena: Gemini genera (`GEMINI_API_KEY`, `CELEBRATION_IMAGE_MODEL`, por defecto `gemini-3.1-flash-image`, de la [documentación oficial consultada](https://ai.google.dev/gemini-api/docs/image-generation)) y, si no entrega imagen, OpenAI lo releva (`OPENAI_API_KEY`, `CELEBRATION_FALLBACK_IMAGE_MODEL`, por defecto `gpt-image-1.5`, en `1024x1536` que es el vertical más cercano al 4:5). Con una sola clave configurada el servicio sigue de pie; sin ninguna responde 503. Los tiempos límite (55 s y 45 s) suman menos que el corte del navegador (110 s).

Cada intento deja una fila anónima en `motivational.CardGeneration`: proveedor, resultado, modelo, si entró como respaldo y duración. Nunca la foto, los nombres ni la dedicatoria. Con eso se cuenta cuántas tarjetas se han generado, desde el admin de Django («Tarjetas generadas») o desde `GET /api/v1/motivational/celebration-card/stats/` (solo equipo autenticado; acepta `?days=N` o `?days=all`). Una fila fallida seguida de una exitosa es un mismo pedido: `generated` cuenta tarjetas entregadas y `total_attempts` cuenta intentos.

Una migración (`0002_cardgeneration`) y ninguna escritura de fotos en BD o almacenamiento de Frostbyte.

`POST /api/v1/motivational/celebration-card/phrase/` propone una dedicatoria (`CELEBRATION_PHRASE_MODEL`, por defecto `gpt-4o-mini`, ~1 s). Acepta `to_name`, `from_name` y `avoid` — la frase que ya está en pantalla, para que la siguiente no la repita — y devuelve `{phrase}`. Los nombres viajan como datos dentro de un JSON, nunca como instrucciones, igual que en el prompt de la imagen. Límite propio de 40/hora por IP, mucho más holgado que el de las imágenes porque el texto cuesta céntimos y la gracia está en pedir varias. Sin `OPENAI_API_KEY` responde 503 y el generador sigue funcionando escribiendo la frase a mano. No se registra ni la frase ni los nombres.

Foto JPG/PNG/WebP hasta 10 MB y 25 megapíxeles; se valida el contenido, normaliza orientación y elimina EXIF antes de enviarla al proveedor. Máximo 12 intentos/hora por IP usando el cache de Django; con múltiples procesos y cache local, el límite es por proceso y no una cuota global de gasto. Timeout de proveedor 90 s; errores públicos sin información del proveedor. Campos de texto limitados y usados como texto literal.

La instrucción preserva personas, ropa y accesorios. **La tarjeta es diseño gráfico, no un montaje fotográfico** (revisión del 2026-09-05, tras probar con una foto real): la primera versión rodeaba la foto de copas, velas y pétalos, la enmarcaba centrada y la teñía de vino aunque la foto fuera lila y azul. Ahora el prompt (a) prohíbe por su nombre cualquier objeto o textura fotográfica añadida —copas, velas, pétalos, lazos, mármol, fondos desenfocados, marcos ornamentados—, (b) manda extraer la paleta de la foto en vez de imponer la de marca, sin hex de Frostbyte en el prompt, (c) exige que la foto toque un borde y se salga por él, porque sin esa regla firme el modelo devuelve foto centrada con marco, y (d) exige cada texto una sola vez y copiado carácter por carácter, tras una prueba con el título duplicado. La fidelidad del resultado depende del generador; no se promete identidad píxel a píxel. El usuario revisa la tarjeta antes de compartir. La UI avisa de que la foto se procesa fuera de Frostbyte y no se guarda, sin nombrar proveedores: el nombre del proveedor no es información del cliente y envejece con cada cambio.

Validación: build frontend, claves de ambos proveedores verificadas contra la API real (Gemini generó una imagen; OpenAI lista `gpt-image-1.5`) y pruebas de API con proveedor simulado (archivo inválido, límites, ausencia de clave, resultado, fallo del proveedor, respuesta sin imagen, throttle, prompt, cadena de respaldo y estadísticas). Pendiente prueba real de generación por Jaime y publicación de ambas ramas. No se ha probado el resultado visual del modelo con una foto personal.
