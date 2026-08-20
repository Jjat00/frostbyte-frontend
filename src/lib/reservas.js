// Contacto de reservas.
//
// Las reservas en línea (`reservations_enabled`) siguen apagadas: el módulo
// existe pero lo opera el staff. Mientras tanto el cliente reserva mesa, grupo
// o Sala VIP por este número, escribiendo o llamando. Compartido por el hero,
// el banner de la Sala VIP y la vista /reservas.
export const RESERVATIONS_PHONE = {
  display: "318 237 1257",
  number: "573182371257",
};

const DEFAULT_TEXT = "Hola, quiero hacer una reserva";

export const reservationsWaLink = (text = DEFAULT_TEXT) =>
  `https://wa.me/${RESERVATIONS_PHONE.number}?text=${encodeURIComponent(text)}`;

export const reservationsTelLink = `tel:+${RESERVATIONS_PHONE.number}`;
