import React from 'react';
import { Bike, Coins, MapPin, Phone } from 'lucide-react';
import TableSelect from './TableSelect';

/**
 * Bloque "dónde se entrega" del formulario de tomar pedidos.
 *
 * Casi todo pedido que se toma en el panel es de mesa, así que la mesa es lo
 * que se ve; el domicilio está detrás de un checkbox. Cubre el caso raro pero
 * real de quien llega al local, encarga y pide que se lo lleven a la casa:
 * antes ese pedido se tomaba como de mesa con la dirección escondida en las
 * notas, y a la hora de despacharlo no aparecía como domicilio en ninguna
 * vista (ver DeliveryInfo.jsx, que es lo que lee el domiciliario).
 *
 * Al marcar domicilio el pedido deja de tener mesa y el teléfono sube hasta
 * aquí: deja de ser opcional, porque sin número nadie puede llamar si no da
 * con la dirección. La ubicación en el mapa no se pide —eso es del pedido que
 * el cliente hace desde la app— porque aquí el cliente está de frente.
 *
 * Se monta dos veces (panel de escritorio y hoja de móvil) con el mismo
 * estado, así que cada instancia necesita su propio `idPrefix`.
 */
const DeliveryFields = ({
  isDelivery,
  onToggleDelivery,
  tables,
  selectedTable,
  onTableChange,
  address,
  onAddressChange,
  phone,
  onPhoneChange,
  reference,
  onReferenceChange,
  fee,
  onFeeChange,
  idPrefix = 'entrega',
  padY = 'py-2.5',
}) => {
  const inputClass = `w-full pl-10 pr-4 ${padY} rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-light placeholder:text-light/25 focus:border-white/30 focus:outline-none`;
  const deliveryId = `${idPrefix}-domicilio`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={deliveryId}
          checked={isDelivery}
          onChange={(e) => onToggleDelivery(e.target.checked)}
          className="w-5 h-5 rounded border-white/[0.12] bg-white/[0.09] text-secondary focus:ring-secondary/50"
        />
        <label
          htmlFor={deliveryId}
          className="flex items-center gap-1.5 text-sm text-light cursor-pointer select-none"
        >
          <Bike className="w-4 h-4 text-gray" />
          Domicilio
        </label>
      </div>

      {isDelivery ? (
        <>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
            <input
              type="text"
              placeholder="Dirección de entrega *"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
            <input
              type="tel"
              inputMode="tel"
              placeholder="Celular del cliente *"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray/50" />
            <input
              type="text"
              placeholder="Indicaciones para llegar (opcional)"
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              placeholder="Valor del envío"
              value={fee}
              onChange={(e) => onFeeChange(e.target.value)}
              className={inputClass}
            />
          </div>
          {(!address.trim() || !phone.trim()) && (
            <p className="text-xs text-red-400">
              La dirección y el celular son obligatorios para el domicilio
            </p>
          )}
        </>
      ) : (
        <>
          <label
            htmlFor={`${idPrefix}-mesa`}
            className="block text-sm font-medium text-light"
          >
            Mesa/Barra <span className="text-red-400">*</span>
          </label>
          <TableSelect
            id={`${idPrefix}-mesa`}
            tables={tables}
            value={selectedTable}
            onChange={onTableChange}
            className={`w-full px-4 ${padY} rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm text-light focus:border-white/30 focus:outline-none`}
          />
          {!selectedTable && (
            <p className="text-xs text-red-400">
              Debes seleccionar una mesa o barra
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryFields;
