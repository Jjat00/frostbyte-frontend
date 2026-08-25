/**
 * Lo que la app ya le ofrece al cliente, en un solo sitio.
 *
 * Las opciones de hero (/hero11…/hero20) tienen que enseñar ese valor de
 * un vistazo, así que comparten esta lista: las rutas y los nombres salen
 * de aquí y cada propuesta elige el subconjunto y el tono que le sirven.
 * Los nombres coinciden con los de la barra inferior y el header — que una
 * pestaña se llame distinto según la pantalla desorienta.
 */

export const SERVICIOS = {
  carta: {
    id: "carta",
    nombre: "Carta",
    to: "/",
    breve: "Granizados, frappés, cocteles y shots",
    detalle: "Toda la carta con fotos, precios y lo que hay hoy.",
  },
  domicilios: {
    id: "domicilios",
    nombre: "Domicilios",
    to: "/domicilios",
    breve: "Hasta tu puerta, 1,5 km a la redonda",
    detalle: "Arma el pedido y págalo en efectivo o Nequi al recibir.",
  },
  cuenta: {
    id: "cuenta",
    nombre: "Mi cuenta",
    to: "/mi-cuenta",
    breve: "Tus pedidos y reservas en un solo lugar",
    detalle: "Entra con Google y sigue tu pedido en vivo.",
  },
  reservas: {
    id: "reservas",
    nombre: "Reservas",
    to: "/reservas",
    breve: "Mesa, grupo o Sala VIP",
    detalle: "Pides la hora que quieres y el equipo te la confirma.",
  },
  juegos: {
    id: "juegos",
    nombre: "Juegos",
    to: "/game",
    breve: "Duelo e Impostor con tu parche",
    detalle: "Creas la sala, pasas el código y juegan desde el celular.",
  },
  musica: {
    id: "musica",
    nombre: "Pedir canción",
    to: "/#solicitar-cancion",
    breve: "Tú decides qué suena",
    detalle: "Pide la canción y suena en el piso donde estás.",
  },
  provoca: {
    id: "provoca",
    nombre: "¿Qué te provoca?",
    to: "/#que-te-provoca",
    breve: "Te decimos qué pedir",
    detalle: "Respondes tres cosas y te recomendamos la bebida.",
  },
  descuentos: {
    id: "descuentos",
    nombre: "Descuentos",
    to: "/#descuento-redes",
    breve: "Por seguirnos y por tu cumpleaños",
    detalle: "Dos formas de pagar menos por lo mismo.",
  },
};

/** Los seis que mejor resumen la app, en el orden en que se entienden. */
export const SERVICIOS_CLAVE = [
  SERVICIOS.carta,
  SERVICIOS.domicilios,
  SERVICIOS.cuenta,
  SERVICIOS.reservas,
  SERVICIOS.juegos,
  SERVICIOS.musica,
];

export const SERVICIOS_TODOS = Object.values(SERVICIOS);
