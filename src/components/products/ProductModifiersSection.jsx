import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Layers, Loader2, ExternalLink } from 'lucide-react';
import { modifiersService } from '@/services/modifiers.service';

/**
 * Sección del formulario de producto para asociarle grupos de opciones
 * (modificadores: carnes, salsas, bebida, etc.) con override de min/max.
 * Requiere un producto ya guardado (necesita su id/slug).
 */
export default function ProductModifiersSection({ product }) {
  const queryClient = useQueryClient();
  const businessSlug = product?.business_slug;
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const { data: productModifiers, isLoading, isError } = useQuery({
    queryKey: ['product-modifiers', product?.slug],
    queryFn: () => modifiersService.getProductModifiers(product.slug),
    enabled: !!product?.slug,
  });

  const { data: groupsData } = useQuery({
    queryKey: ['modifier-groups', businessSlug],
    queryFn: () => modifiersService.getGroups({ business: businessSlug, active_only: false }),
    enabled: !!businessSlug,
  });

  const groups = Array.isArray(groupsData) ? groupsData : [];
  const links = Array.isArray(productModifiers) ? productModifiers : [];
  const groupsById = useMemo(() => {
    const m = new Map();
    groups.forEach((g) => m.set(g.id, g));
    return m;
  }, [groups]);

  // Solo los vínculos activos bloquean re-asociar un grupo
  const linkedIds = new Set(links.filter((l) => l.is_active !== false).map((l) => l.group));
  const availableGroups = groups.filter((g) => !linkedIds.has(g.id) && g.is_active);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['product-modifiers', product.slug] });

  const showError = (e, fallback) => {
    const d = e?.response?.data;
    alert(d?.non_field_errors?.[0] || d?.group?.[0] || d?.detail || fallback);
  };

  const linkMutation = useMutation({
    mutationFn: (groupId) =>
      modifiersService.linkGroupToProduct({
        product: product.id,
        group: Number(groupId),
        display_order: links.length,
      }),
    onSuccess: () => {
      invalidate();
      setSelectedGroupId('');
    },
    onError: (e) => showError(e, 'No se pudo agregar el grupo.'),
  });

  const unlinkMutation = useMutation({
    mutationFn: (id) => modifiersService.unlinkGroupFromProduct(id),
    onSuccess: invalidate,
    onError: (e) => showError(e, 'No se pudo quitar el grupo.'),
  });

  const overrideMutation = useMutation({
    mutationFn: ({ id, data }) => modifiersService.updateProductModifier(id, data),
    onSuccess: invalidate,
    onError: (e) => showError(e, 'No se pudo guardar el ajuste.'),
  });

  const eff = (override, base) => (override === null || override === undefined ? base : override);

  // El producto debe estar guardado para asignarle grupos.
  if (!product?.id || !product?.slug) {
    return (
      <div className="fb-card p-6">
        <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-secondary" />
          Grupos de opciones
        </h2>
        <p className="text-sm text-gray">Guarda el producto primero para asignarle grupos de opciones.</p>
      </div>
    );
  }

  return (
    <div className="fb-card space-y-4 p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-light flex items-center gap-2">
          <Layers className="w-5 h-5 text-secondary" />
          Grupos de opciones
        </h2>
        <Link
          to="/productos/modificadores"
          className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-secondary/80"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Gestionar grupos
        </Link>
      </div>

      <p className="text-sm text-gray">
        Define cómo se configura este producto: carnes, salsas, tamaños, bebida, etc.
        Cada grupo permite elegir entre un mínimo y un máximo de opciones.
      </p>

      {isError ? (
        <p className="text-sm text-red-400 py-2">No se pudieron cargar los grupos del producto.</p>
      ) : isLoading ? (
        <div className="flex items-center gap-2 text-gray text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : (
        <>
          {/* Grupos asociados */}
          {links.length > 0 ? (
            <div className="space-y-3">
              {links.map((pm) => {
                const group = groupsById.get(pm.group);
                const optionCount = group?.options?.length ?? 0;
                return (
                  <div
                    key={pm.id}
                    className="bg-white/[0.06] border border-white/[0.12] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-light font-semibold">
                          {group?.name || `Grupo #${pm.group}`}
                        </p>
                        <p className="text-xs text-gray mt-0.5">
                          {optionCount} {optionCount === 1 ? 'opción' : 'opciones'} ·{' '}
                          elige {eff(pm.min_select_override, group?.min_select)}–
                          {eff(pm.max_select_override, group?.max_select)}
                          {eff(pm.min_select_override, group?.min_select) > 0
                            ? ' · obligatorio'
                            : ' · opcional'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => unlinkMutation.mutate(pm.id)}
                        disabled={unlinkMutation.isPending}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                        title="Quitar grupo de este producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Override min/max para este producto */}
                    <div className="grid grid-cols-2 gap-3 mt-3 max-w-xs">
                      <label className="text-xs text-gray">
                        Mín. (vacío = usar del grupo)
                        <input
                          key={`min-${pm.id}-${pm.min_select_override ?? ''}`}
                          type="number"
                          min="0"
                          defaultValue={pm.min_select_override ?? ''}
                          placeholder={`${group?.min_select ?? 0}`}
                          onBlur={(e) => {
                            const v = e.target.value === '' ? null : Number(e.target.value);
                            if (v !== (pm.min_select_override ?? null)) {
                              overrideMutation.mutate({ id: pm.id, data: { min_select_override: v } });
                            }
                          }}
                          className="mt-1 w-full px-3 py-1.5 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light text-sm focus:border-white/30 focus:outline-none"
                        />
                      </label>
                      <label className="text-xs text-gray">
                        Máx. (vacío = usar del grupo)
                        <input
                          key={`max-${pm.id}-${pm.max_select_override ?? ''}`}
                          type="number"
                          min="0"
                          defaultValue={pm.max_select_override ?? ''}
                          placeholder={`${group?.max_select ?? 1}`}
                          onBlur={(e) => {
                            const v = e.target.value === '' ? null : Number(e.target.value);
                            if (v !== (pm.max_select_override ?? null)) {
                              overrideMutation.mutate({ id: pm.id, data: { max_select_override: v } });
                            }
                          }}
                          className="mt-1 w-full px-3 py-1.5 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light text-sm focus:border-white/30 focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray italic py-2">
              Este producto aún no tiene grupos de opciones.
            </p>
          )}

          {/* Agregar grupo */}
          {availableGroups.length > 0 ? (
            <div className="flex gap-2 pt-2">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light text-sm focus:border-white/30 focus:outline-none"
              >
                <option value="" className="bg-dark">
                  Agregar grupo de opciones…
                </option>
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-dark">
                    {g.name} (elige {g.min_select}–{g.max_select})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => selectedGroupId && linkMutation.mutate(selectedGroupId)}
                disabled={!selectedGroupId || linkMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          ) : (
            groups.length === 0 && (
              <p className="text-sm text-gray pt-2">
                No hay grupos de opciones para este negocio.{' '}
                <Link to="/productos/modificadores" className="text-secondary hover:underline">
                  Crea el primero
                </Link>
                .
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}
