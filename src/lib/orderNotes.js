/**
 * Las notas de un pedido son dos cosas distintas en el mismo campo.
 *
 * Lo que el cliente pidió ("sin ají") es para la cocina. Lo que el agente de
 * WhatsApp no alcanzó a preguntarle (la ubicación que WhatsApp no nos entregó,
 * el método de pago) es un recado para quien atiende, y lo escribe el backend
 * en la primera línea con un prefijo fijo (apps/whatsapp/missing.py).
 *
 * Mezclados se leen igual de gris y el recado se pierde; separados, cada
 * pantalla enseña el que le toca.
 */

export const MISSING_PREFIX = "FALTA POR CONFIRMAR CON EL CLIENTE:";

export function splitOrderNotes(text) {
  const raw = (text || "").trim();
  if (!raw.startsWith(MISSING_PREFIX)) return { missing: "", notes: raw };
  const [head, ...rest] = raw.split("\n");
  return {
    missing: head.slice(MISSING_PREFIX.length).trim().replace(/\.$/, ""),
    notes: rest.join("\n").trim(),
  };
}
