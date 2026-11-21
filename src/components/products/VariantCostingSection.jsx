import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, Plus, Trash2, Loader2, Save, ExternalLink, RotateCcw } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import {
  costingFigures,
  formatCOP,
  formatPct,
  marginTone,
  toNumber,
  TARGET_FOOD_COST,
} from '@/lib/costing';

const inputClass =
  'w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-[0.85rem] text-light placeholder:text-light/25 transition-colors focus:border-white/30 focus:outline-none';

/**
 * Sección del formulario de producto que arma la receta de cada variante a
 * partir de la materia prima del inventario y muestra su costo real frente al
 * precio de venta. Requiere un producto ya guardado (necesita sus variantes).
 */
export default function VariantCostingSection({ product }) {
  const queryClient = useQueryClient();
  const businessSlug = product?.business_slug;
  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants.filter((v) => v.id) : []),
    [product?.variants]
  );

  const [activeVariantId, setActiveVariantId] = useState(null);
  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const nextKey = useRef(1);

  // Variante activa: la por defecto, o la primera.
  useEffect(() => {
    if (!variants.length) return;
    if (activeVariantId && variants.some((v) => v.id === activeVariantId)) return;
    const def = variants.find((v) => v.is_default) || variants[0];
    setActiveVariantId(def.id);
  }, [variants, activeVariantId]);

  const activeVariant = variants.find((v) => v.id === activeVariantId) || null;

  const { data: materialsData } = useQuery({
    queryKey: ['raw-materials', businessSlug],
    queryFn: () => inventoryService.getMaterials({ business: businessSlug }),
    enabled: !!businessSlug,
    staleTime: 5 * 60 * 1000,
  });
  const materials = useMemo(() => {
    const list = Array.isArray(materialsData) ? materialsData : materialsData?.results || [];
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [materialsData]);
  const materialsById = useMemo(() => {
    const m = new Map();
    materials.forEach((mat) => m.set(mat.id, mat));
    return m;
  }, [materials]);

  const {
    data: costing,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['variant-costing', activeVariantId],
    queryFn: () => inventoryService.getVariantCosting(activeVariantId),
    enabled: !!activeVariantId,
  });

  // Carga la receta guardada en el editor (solo si no hay cambios sin guardar).
  useEffect(() => {
    if (!costing || dirty) return;
    setRows(
      (costing.ingredients || []).map((ing) => ({
        key: nextKey.current++,
        raw_material_id: ing.raw_material_id,
        quantity: String(toNumber(ing.quantity)),
        notes: ing.notes || '',
      }))
    );
    setError('');
  }, [costing]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveMutation = useMutation({
    mutationFn: (items) => inventoryService.saveVariantRecipe(activeVariantId, items),
    onSuccess: (data) => {
      setDirty(false);
      setError('');
      queryClient.setQueryData(['variant-costing', activeVariantId], data);
      queryClient.invalidateQueries({ queryKey: ['costing-summary'] });
    },
    onError: (e) => {
      const d = e?.response?.data;
      const msg =
        typeof d?.items === 'string'
          ? d.items
          : d?.detail || 'No se pudo guardar la receta.';
      setError(msg);
    },
  });

  // ---- edición local ----
  const updateRow = (key, field, value) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
    setDirty(true);
    setError('');
  };
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { key: nextKey.current++, raw_material_id: '', quantity: '', notes: '' },
    ]);
    setDirty(true);
  };
  const removeRow = (key) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
    setDirty(true);
  };
  const discard = () => {
    setDirty(false);
    setRows(
      (costing?.ingredients || []).map((ing) => ({
        key: nextKey.current++,
        raw_material_id: ing.raw_material_id,
        quantity: String(toNumber(ing.quantity)),
        notes: ing.notes || '',
      }))
    );
    setError('');
  };
  const switchVariant = (id) => {
    if (id === activeVariantId) return;
    if (dirty && !window.confirm('Hay cambios sin guardar en esta variante. ¿Descartarlos?')) {
      return;
    }
    setDirty(false);
    setRows([]);
    setError('');
    setActiveVariantId(id);
  };

  const handleSave = () => {
    const items = [];
    for (const r of rows) {
      const id = Number(r.raw_material_id);
      const qty = toNumber(r.quantity);
      if (!id) {
        setError('Hay una fila sin materia prima elegida.');
        return;
      }
      if (qty <= 0) {
        setError(`La cantidad de "${materialsById.get(id)?.name || 'un ingrediente'}" debe ser mayor a 0.`);
        return;
      }
      items.push({ raw_material_id: id, quantity: qty, notes: r.notes || '' });
    }
    saveMutation.mutate(items);
  };

  // ---- cifras en vivo ----
  const computed = rows.map((r) => {
    const mat = materialsById.get(Number(r.raw_material_id));
    const qty = toNumber(r.quantity);
    const unitCost = toNumber(mat?.cost_per_unit);
    return { ...r, material: mat, subtotal: qty * unitCost, unitCost };
  });
  const totalCost = computed.reduce((acc, r) => acc + r.subtotal, 0);
  const hasRecipe = computed.some((r) => r.material && toNumber(r.quantity) > 0);
  const price = toNumber(activeVariant?.price);
  const figures = costingFigures(price, totalCost, hasRecipe);
  const usedIds = new Set(computed.map((r) => Number(r.raw_material_id)).filter(Boolean));

  if (!product?.id || !variants.length) {
    return (
      <div className="fb-card p-6">
        <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-secondary" />
          Costo real
        </h2>
        <p className="text-sm text-gray">
          Guarda el producto con al menos una variante para armar su receta y ver su costo.
        </p>
      </div>
    );
  }

  return (
    <div className="fb-card space-y-4 p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-light flex items-center gap-2">
          <Calculator className="w-5 h-5 text-secondary" />
          Costo real
        </h2>
        <Link
          to="/productos/costeo"
          className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-secondary/80"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Costeo del catálogo
        </Link>
      </div>

      <p className="text-sm text-gray">
        Qué lleva cada variante y cuánto cuesta de verdad. El costo de cada materia prima sale del
        inventario y se actualiza con cada compra; la cantidad va en la unidad de la materia prima.
      </p>

      {/* Selector de variante */}
      {variants.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => switchVariant(v.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                v.id === activeVariantId
                  ? 'bg-secondary/20 text-secondary'
                  : 'bg-white/[0.06] text-gray hover:text-light'
              }`}
            >
              {v.name}
              {!v.is_active && ' · inactiva'}
            </button>
          ))}
        </div>
      )}

      {isError ? (
        <p className="text-sm text-red-400 py-2">No se pudo cargar la receta de la variante.</p>
      ) : isLoading || !activeVariant ? (
        <div className="flex items-center gap-2 text-gray text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : (
        <>
          {/* Filas de ingredientes */}
          {computed.length > 0 ? (
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_7.5rem_8rem_2.25rem] gap-2 px-1 text-[0.7rem] uppercase tracking-wide text-gray">
                <span>Materia prima</span>
                <span>Cantidad</span>
                <span className="text-right">Costo</span>
                <span />
              </div>
              {computed.map((r) => (
                <div
                  key={r.key}
                  className="grid grid-cols-[minmax(0,1fr)_2.25rem] sm:grid-cols-[minmax(0,1fr)_7.5rem_8rem_2.25rem] gap-2 items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-2"
                >
                  <select
                    value={r.raw_material_id || ''}
                    onChange={(e) => updateRow(r.key, 'raw_material_id', e.target.value)}
                    className={inputClass}
                  >
                    <option value="" className="bg-dark">
                      Elige una materia prima…
                    </option>
                    {materials.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                        className="bg-dark"
                        disabled={usedIds.has(m.id) && Number(r.raw_material_id) !== m.id}
                      >
                        {m.name} ({m.unit_abbreviation})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeRow(r.key)}
                    className="sm:order-last p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors justify-self-end"
                    title="Quitar ingrediente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={r.quantity}
                      onChange={(e) => updateRow(r.key, 'quantity', e.target.value)}
                      // Enter en este campo no debe enviar el formulario del producto
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                      placeholder="0"
                      className={inputClass}
                    />
                    <span className="text-xs text-gray w-8 shrink-0">
                      {r.material?.unit_abbreviation || ''}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex sm:flex-col items-baseline sm:items-end justify-between gap-1 px-1">
                    <span className="text-[0.7rem] text-gray">
                      {r.material ? `${formatCOP(r.unitCost)} / ${r.material.unit_abbreviation}` : ''}
                    </span>
                    <span className="text-sm font-semibold text-light tabular-nums">
                      {r.material ? formatCOP(r.subtotal) : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray py-2">
              Esta variante aún no tiene receta. Agrega lo que lleva, incluidos desechables (vaso,
              plato, pitillo).
            </p>
          )}

          <button
            type="button"
            onClick={addRow}
            disabled={!materials.length}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Agregar ingrediente
          </button>
          {!materials.length && (
            <p className="text-xs text-gray">
              No hay materia prima registrada para este negocio.{' '}
              <Link to="/inventario/materiales" className="text-secondary">
                Créala en Inventario
              </Link>
              .
            </p>
          )}

          {/* Cifras */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 rounded-xl bg-white/[0.04] p-4">
            <Figure label="Costo real" value={hasRecipe ? formatCOP(totalCost) : '—'} strong />
            <Figure label="Precio guardado" value={formatCOP(price)} />
            <Figure label="Ganancia" value={formatCOP(figures.profit)} tone={marginTone(figures.marginPct)} />
            <Figure label="Margen" value={formatPct(figures.marginPct)} tone={marginTone(figures.marginPct)} />
            <Figure label="Food cost" value={formatPct(figures.foodCostPct)} />
            <Figure
              label={`Sugerido (food cost ${Math.round(TARGET_FOOD_COST * 100)} %)`}
              value={formatCOP(figures.suggestedPrice)}
            />
          </div>
          {hasRecipe && figures.suggestedPrice !== null && figures.suggestedPrice !== price && (
            <p className="text-xs text-gray">
              Con la regla de la casa (costo × 2 redondeado a miles hacia abajo) el precio sería{' '}
              <span className="text-light font-medium">{formatCOP(figures.suggestedPrice)}</span>.
              El precio se cambia arriba, en la variante.
            </p>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 flex-wrap">
            {dirty && (
              <button
                type="button"
                onClick={discard}
                className="flex items-center gap-1.5 px-4 py-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Descartar
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 border border-secondary/35 bg-secondary/[0.1] text-light rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar receta
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Figure({ label, value, tone = 'text-light', strong = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.7rem] uppercase tracking-wide text-gray truncate">{label}</p>
      <p className={`${strong ? 'text-lg' : 'text-base'} font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
