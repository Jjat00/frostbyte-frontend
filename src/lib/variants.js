/**
 * Variantes de un producto que el cliente puede ver y pedir.
 *
 * La API publica de productos devuelve TODAS las variantes, tambien las
 * desactivadas en el panel: el listado hace `prefetch_related("variants")`
 * sin filtro y solo el endpoint `/products/<slug>/variants/` filtra por
 * `is_active`. Ese mismo serializer lo usa el panel, que si necesita ver las
 * inactivas para reactivarlas, asi que el filtro vive aqui, en el front, y
 * no en el backend.
 *
 * Toda vista de cara al cliente (carta, domicilios, pedidos) pasa por aqui
 * para que ninguna se olvide y ofrezca un precio que ya no se vende.
 */
export const activeVariants = (product) =>
  (product?.variants || []).filter((v) => v.is_active !== false);
