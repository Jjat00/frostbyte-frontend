import { AlertTriangle } from "lucide-react";
import { splitOrderNotes } from "@/lib/orderNotes";

/**
 * Las notas del pedido, con el recado separado de lo que pidió el cliente.
 *
 * Un pedido de WhatsApp puede entrar sin la ubicación o sin el método de pago
 * (ver apps/whatsapp/missing.py): eso no es una nota, es algo que alguien
 * tiene que preguntarle al cliente, y si se lee igual que "sin ají" no lo
 * pregunta nadie. En cocina no aparece: ahí no se piden direcciones.
 */
const OrderNotes = ({ notes, showMissing = true, className = "" }) => {
  const { missing, notes: text } = splitOrderNotes(notes);
  if (!missing && !text) return null;

  return (
    <div className={`space-y-1 ${className}`}>
      {showMissing && missing && (
        <p className="flex items-start gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
          <span>Falta por confirmar con el cliente: {missing}</span>
        </p>
      )}
      {text && (
        <p className="text-xs text-secondary bg-secondary/10 px-2 py-1 rounded">
          📝 {text}
        </p>
      )}
    </div>
  );
};

export default OrderNotes;
