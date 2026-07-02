import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  X,
  Save,
  Loader2,
  LayoutGrid,
  AlertCircle,
  QrCode,
  Printer,
} from 'lucide-react';
import { ordersService } from '@/services/orders.service';
import QrCodeModal from '@/components/orders/QrCodeModal';
import QrPrintDialog from '@/components/orders/QrPrintDialog';

const emptyForm = { id: null, floor: 2, table_number: '', table_name: '', is_active: true };

const autoName = (number) => {
  if (number === '' || number === null || number === undefined) return '';
  return Number(number) === 0 ? 'Barra' : `Mesa ${number}`;
};

const TablesManagementPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [qrTable, setQrTable] = useState(null);
  const [showPrint, setShowPrint] = useState(false);

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables', 'manage'],
    queryFn: () => ordersService.getTables({ includeInactive: true }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  };

  const parseError = (error) => {
    const data = error?.response?.data;
    if (!data) return 'Ocurrió un error. Intenta de nuevo.';
    if (typeof data === 'string') return data;
    if (data.non_field_errors) return data.non_field_errors.join(' ');
    const first = Object.values(data)[0];
    return Array.isArray(first) ? first.join(' ') : String(first);
  };

  const createMutation = useMutation({
    mutationFn: (payload) => ordersService.createTable(payload),
    onSuccess: () => { invalidate(); closeForm(); },
    onError: (error) => setFormError(parseError(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => ordersService.updateTable(id, payload),
    onSuccess: () => { invalidate(); closeForm(); },
    onError: (error) => setFormError(parseError(error)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) =>
      is_active
        ? ordersService.updateTable(id, { is_active: true })
        : ordersService.deleteTable(id),
    onSuccess: invalidate,
  });

  const grouped = useMemo(() => {
    const byFloor = new Map();
    for (const t of tables || []) {
      const floor = t.floor ?? 0;
      if (!byFloor.has(floor)) byFloor.set(floor, []);
      byFloor.get(floor).push(t);
    }
    return [...byFloor.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([floor, list]) => ({
        floor,
        tables: [...list].sort((a, b) => a.table_number - b.table_number),
      }));
  }, [tables]);

  // Para imprimir: solo mesas activas, ordenadas por piso y número.
  const activeTables = useMemo(
    () =>
      (tables || [])
        .filter((t) => t.is_active)
        .sort((a, b) => a.floor - b.floor || a.table_number - b.table_number),
    [tables],
  );

  const openCreate = () => {
    setForm({ ...emptyForm });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (table) => {
    setForm({
      id: table.id,
      floor: table.floor,
      table_number: table.table_number,
      table_name: table.table_name,
      is_active: table.is_active,
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setFormError('');
  };

  const handleNumberChange = (value) => {
    setForm((prev) => {
      const wasAuto = prev.table_name === '' || prev.table_name === autoName(prev.table_number);
      return {
        ...prev,
        table_number: value,
        table_name: wasAuto ? autoName(value) : prev.table_name,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (form.table_number === '' || form.table_number === null) {
      setFormError('Ingresa el número de mesa (0 = Barra).');
      return;
    }
    const payload = {
      floor: Number(form.floor),
      table_number: Number(form.table_number),
      table_name: form.table_name.trim() || autoName(form.table_number),
      is_active: form.is_active,
    };
    if (form.id) {
      updateMutation.mutate({ id: form.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-6 h-6 text-secondary" />
          <div>
            <h1 className="text-xl font-bold text-light">Mesas y Barras</h1>
            <p className="text-xs text-gray">Gestiona los puntos de atención por piso</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrint(true)}
            disabled={!activeTables.length}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] border border-white/[0.12] text-light font-semibold rounded-lg hover:bg-white/[0.1] transition-colors active:scale-95 disabled:opacity-40"
            title="Imprimir todos los QR"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir QRs</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-dark font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva mesa</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-20 text-gray">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No hay mesas todavía. Crea la primera.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ floor, tables: floorTables }) => (
            <div key={floor}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-secondary uppercase tracking-wider">
                  {floor ? `Piso ${floor}` : 'Sin piso'}
                </h2>
                <span className="text-xs text-gray">({floorTables.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {floorTables.map((table) => (
                  <div
                    key={table.id}
                    className={`liquid-glass flex items-center justify-between gap-2 p-3 rounded-xl border ${
                      table.is_active
                        ? 'border-white/[0.1] bg-white/[0.04]'
                        : 'border-white/[0.06] bg-white/[0.02] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-secondary/20 text-secondary rounded-lg text-sm font-bold border-2 border-secondary/30">
                        {table.table_number === 0 ? 'B' : table.table_number}
                      </span>
                      <div className="min-w-0">
                        <p className="text-light font-medium truncate">{table.table_name}</p>
                        <p className="text-xs text-gray">
                          {table.is_active ? 'Activa' : 'Inactiva'} · {table.visit_count} visitas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setQrTable(table)}
                        className="p-2 text-gray hover:text-secondary hover:bg-white/[0.06] rounded-lg transition-colors"
                        title="Ver / descargar QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(table)}
                        className="p-2 text-gray hover:text-secondary hover:bg-white/[0.06] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {table.is_active ? (
                        <button
                          onClick={() => toggleMutation.mutate({ id: table.id, is_active: false })}
                          className="p-2 text-gray hover:text-red-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                          title="Desactivar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleMutation.mutate({ id: table.id, is_active: true })}
                          className="p-2 text-gray hover:text-green-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                          title="Reactivar"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeForm}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-0 bottom-0 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md z-50 p-4"
            >
              {/* relative: contiene el reflejo (::before/::after) dentro de la card.
                  backgroundColor inline: opaco real; el fondo translúcido de
                  .liquid-glass gana la cascada al bg-dark de utilidad y transparentaba. */}
              <form
                onSubmit={handleSubmit}
                className="liquid-glass relative border border-white/[0.12] rounded-2xl p-5 space-y-4"
                style={{ backgroundColor: 'rgba(18, 20, 31, 0.96)' }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-light">
                    {form.id ? 'Editar mesa' : 'Nueva mesa'}
                  </h3>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="p-2 text-gray hover:text-light rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray mb-1">Piso</label>
                    <input
                      type="number"
                      min="1"
                      value={form.floor}
                      onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray mb-1">Número (0 = Barra)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.table_number}
                      onChange={(e) => handleNumberChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.table_name}
                    onChange={(e) => setForm((p) => ({ ...p, table_name: e.target.value }))}
                    placeholder="Ej: Mesa 1, Barra, Terraza"
                    className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-light cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-secondary"
                  />
                  Activa (disponible para pedidos)
                </label>

                {formError && (
                  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 px-4 py-2.5 text-gray hover:text-light bg-white/[0.04] rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-dark font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de QR por mesa */}
      <AnimatePresence>
        {qrTable && <QrCodeModal table={qrTable} onClose={() => setQrTable(null)} />}
      </AnimatePresence>

      {/* Impresión masiva de QR */}
      <AnimatePresence>
        {showPrint && (
          <QrPrintDialog tables={activeTables} onClose={() => setShowPrint(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TablesManagementPage;
