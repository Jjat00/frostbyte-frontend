import { useMemo } from 'react';

/**
 * Selector de mesa/barra agrupado por piso.
 *
 * El valor (`value`) y el que se reporta en `onChange` es el ID de la mesa
 * (no el número), porque los números se repiten entre pisos. Envía ese ID al
 * backend como `table_id`.
 *
 * @param {Array} tables - Lista de mesas (de ordersService.getTables()).
 * @param {string|number} value - ID de la mesa seleccionada ('' si ninguna).
 * @param {Function} onChange - Recibe el evento del <select>.
 */
const TableSelect = ({
  tables,
  value,
  onChange,
  className = '',
  id,
  placeholder = 'Selecciona una mesa o barra',
}) => {
  const groups = useMemo(() => {
    const byFloor = new Map();
    for (const table of tables || []) {
      if (table.is_active === false) continue;
      const floor = table.floor ?? 0;
      if (!byFloor.has(floor)) byFloor.set(floor, []);
      byFloor.get(floor).push(table);
    }
    return [...byFloor.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([floor, list]) => ({
        floor,
        tables: [...list].sort((a, b) => a.table_number - b.table_number),
      }));
  }, [tables]);

  return (
    <select id={id} value={value} onChange={onChange} className={className}>
      <option value="">{placeholder}</option>
      {groups.map(({ floor, tables: floorTables }) => (
        <optgroup key={floor} label={floor ? `Piso ${floor}` : 'Sin piso'}>
          {floorTables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.table_name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

export default TableSelect;
