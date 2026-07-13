// Líneas de WhatsApp que reciben pedidos a domicilio.
// Compartidas entre el banner de la carta y la vista /domicilios.
export const WHATSAPP_LINES = [
  { display: "320 528 8348", number: "573205288348" },
  { display: "311 781 4338", number: "573117814338" },
];

const WA_TEXT = encodeURIComponent(
  "Hola, quiero hacer un pedido a domicilio"
);

export const waLink = (number) => `https://wa.me/${number}?text=${WA_TEXT}`;
