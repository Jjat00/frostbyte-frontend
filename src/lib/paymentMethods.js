import { Banknote, Building, CreditCard, Smartphone } from "lucide-react";

/**
 * Métodos de pago del local (espejo de Order.PaymentMethod en el backend).
 *
 * PAYMENT_METHODS tiene TODOS los métodos que existen en la base de datos: se
 * usa solo para leer pedidos históricos, que siguen mostrando con qué se
 * cobraron.
 *
 * ACTIVE_PAYMENT_METHODS son los que el local acepta hoy y los únicos que se
 * ofrecen al cobrar o al pedir. El backend rechaza cualquier otro
 * (Order.ACTIVE_PAYMENT_METHODS), así que esta lista debe ir a la par.
 */
export const PAYMENT_METHODS = {
  cash: { id: "cash", label: "Efectivo", icon: Banknote },
  nequi: { id: "nequi", label: "Nequi", icon: Smartphone },
  card: { id: "card", label: "Tarjeta", icon: CreditCard },
  transfer: { id: "transfer", label: "Transferencia", icon: Building },
  daviplata: { id: "daviplata", label: "Daviplata", icon: Smartphone },
};

export const ACTIVE_PAYMENT_METHODS = [
  PAYMENT_METHODS.cash,
  PAYMENT_METHODS.nequi,
];

export const getPaymentMethodLabel = (id) => PAYMENT_METHODS[id]?.label || "";
