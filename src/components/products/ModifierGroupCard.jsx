import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Pencil, Check, X, Star, Loader2 } from 'lucide-react';
import { modifiersService } from '@/services/modifiers.service';

function formatDelta(value) {
  const n = Number(value) || 0;
  if (n === 0) return 'Gratis';
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Math.abs(n));
  return `${n > 0 ? '+' : '-'}${formatted}`;
}

/**
 * Card de un grupo de modificadores con CRUD de sus opciones y edicion del grupo.
 * `onChanged` se llama tras cualquier cambio para refrescar la lista del padre.
 */
export default function ModifierGroupCard({ group, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: group.name,
    min_select: group.min_select,
    max_select: group.max_select,
  });
  const [newOption, setNewOption] = useState({ name: '', price_delta: '', is_default: false });
  const [error, setError] = useState('');

  // Re-sincroniza el form de edicion si el grupo se refresca y no se esta editando
  useEffect(() => {
    if (!editing) {
      setForm({ name: group.name, min_select: group.min_select, max_select: group.max_select });
    }
  }, [group.name, group.min_select, group.max_select, editing]);

  const options = group.options || [];

  const updateGroup = useMutation({
    mutationFn: (data) => modifiersService.updateGroup(group.id, data),
    onSuccess: () => {
      setEditing(false);
      setError('');
      onChanged?.();
    },
    onError: (e) => setError(e.response?.data?.non_field_errors?.[0] || 'No se pudo guardar el grupo.'),
  });

  const deleteGroup = useMutation({
    mutationFn: () => modifiersService.deleteGroup(group.id),
    onSuccess: () => onChanged?.(),
  });

  const createOption = useMutation({
    mutationFn: (data) => modifiersService.createOption(data),
    onSuccess: () => {
      setNewOption({ name: '', price_delta: '', is_default: false });
      setError('');
      onChanged?.();
    },
    onError: (e) => setError(e.response?.data?.non_field_errors?.[0] || 'No se pudo agregar la opción.'),
  });

  const deleteOption = useMutation({
    mutationFn: (id) => modifiersService.deleteOption(id),
    onSuccess: () => onChanged?.(),
  });

  const handleAddOption = () => {
    if (!newOption.name.trim()) return;
    createOption.mutate({
      group: group.id,
      name: newOption.name.trim(),
      price_delta: Number(newOption.price_delta) || 0,
      is_default: newOption.is_default,
    });
  };

  return (
    <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-5 space-y-4">
      {/* Encabezado del grupo */}
      {editing ? (
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
            placeholder="Nombre del grupo"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-gray">
              Mínimo a elegir
              <input
                type="number"
                min="0"
                value={form.min_select}
                onChange={(e) => setForm({ ...form, min_select: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light text-sm"
              />
            </label>
            <label className="text-xs text-gray">
              Máximo a elegir
              <input
                type="number"
                min="0"
                value={form.max_select}
                onChange={(e) => setForm({ ...form, max_select: Number(e.target.value) })}
                className="mt-1 w-full px-3 py-1.5 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light text-sm"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateGroup.mutate(form)}
              disabled={updateGroup.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/20 text-secondary rounded-lg text-sm hover:bg-secondary/30 disabled:opacity-40"
            >
              <Check className="w-4 h-4" /> Guardar
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setForm({ name: group.name, min_select: group.min_select, max_select: group.max_select }); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray hover:text-light rounded-lg text-sm"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-light">{group.name}</h3>
            <p className="text-xs text-gray mt-0.5">
              Elige {group.min_select}–{group.max_select} ·{' '}
              {group.is_required ? 'obligatorio' : 'opcional'} ·{' '}
              {options.length} {options.length === 1 ? 'opción' : 'opciones'}
              {group.business_name ? ` · ${group.business_name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-1.5 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg"
              title="Editar grupo"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`¿Eliminar el grupo "${group.name}" y sus opciones?`)) deleteGroup.mutate();
              }}
              disabled={deleteGroup.isPending}
              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
              title="Eliminar grupo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Opciones */}
      <div className="space-y-2">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="flex items-center justify-between gap-2 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              {opt.is_default && <Star className="w-3.5 h-3.5 text-secondary fill-secondary shrink-0" />}
              <span className="text-light text-sm truncate">{opt.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs ${Number(opt.price_delta) ? 'text-secondary' : 'text-gray'}`}>
                {formatDelta(opt.price_delta)}
              </span>
              <button
                type="button"
                onClick={() => deleteOption.mutate(opt.id)}
                className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                title="Eliminar opción"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agregar opción */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <input
          value={newOption.name}
          onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
          placeholder="Nueva opción (ej: Pollo)"
          className="flex-1 min-w-[140px] px-3 py-1.5 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light text-sm focus:border-secondary/50 focus:outline-none"
        />
        <input
          type="number"
          value={newOption.price_delta}
          onChange={(e) => setNewOption({ ...newOption, price_delta: e.target.value })}
          placeholder="$ extra"
          className="w-24 px-3 py-1.5 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light text-sm focus:border-secondary/50 focus:outline-none"
        />
        <label className="flex items-center gap-1.5 text-xs text-gray cursor-pointer">
          <input
            type="checkbox"
            checked={newOption.is_default}
            onChange={(e) => setNewOption({ ...newOption, is_default: e.target.checked })}
            className="w-4 h-4 rounded bg-dark text-secondary"
          />
          Preseleccionada
        </label>
        <button
          type="button"
          onClick={handleAddOption}
          disabled={!newOption.name.trim() || createOption.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/20 text-secondary rounded-lg text-sm hover:bg-secondary/30 disabled:opacity-40"
        >
          {createOption.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Agregar
        </button>
      </div>
    </div>
  );
}
