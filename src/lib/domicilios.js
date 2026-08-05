// Líneas de WhatsApp que reciben pedidos a domicilio.
// Compartidas entre el banner de la carta y la vista /domicilios.
export const WHATSAPP_LINES = [
  { display: "311 781 4338", number: "573117814338" },
];

const WA_TEXT = encodeURIComponent(
  "Hola, quiero hacer un pedido a domicilio"
);

export const waLink = (number) => `https://wa.me/${number}?text=${WA_TEXT}`;

// Estados en los que un pedido sigue vivo para el cliente (lo espera).
// Compartido por "Mi cuenta" y el aviso de la barra inferior.
export const ACTIVE_ORDER_STATUSES = ["pending", "preparing", "ready"];

export const isActiveOrder = (order) =>
  ACTIVE_ORDER_STATUSES.includes(order?.status);
