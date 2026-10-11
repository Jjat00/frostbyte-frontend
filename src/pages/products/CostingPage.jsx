import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Loader2, Search, ArrowUpDown, PencilLine } from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { formatCOP, formatPct, marginTone, toNumber } from '@/lib/costing';

const SORTS = [
  { value: 'margin_asc', label: 'Peor margen primero' },
  { value: 'margin_desc', label: 'Mejor margen primero' },
  { value: 'cost_desc', label: 'Mayor costo' },
  { value: 'name', label: 'Nombre' },
];

const selectClass =
  'w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-[0.85rem] text-light focus:border-white/30 focus:outline-none';

/**
 * Costeo de todo el catálogo: una fila por variante con precio, costo real,
 * margen y precio sugerido, y cuánto del catálogo está costeado.
 */
export default function CostingPage() {
  const { selectedBusinessSlug } = useBusinessStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [onlyUncosted, setOnlyUncosted] = useState(false);
  const [sort, setSort] = useState('margin_asc');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costing-summary', selectedBusinessSlug],
    queryFn: () =>
      inventoryService.getCostingSummary(
        selectedBusinessSlug ? { business: selectedBusinessSlug } : {}
      ),
  });

  const items = data?.items || [];
  const summary = data?.summary;
  const targetMargin = toNumber(summary?.target_margin_pct) || 50;

  const categories = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      if (it.category_slug && !map.has(it.category_slug)) {
        map.set(it.category_slug, it.category_name);
      }
    });
    return [...map.entries()];
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items.filter((it) => {
      if (category && it.category_slug !== category) return false;
      if (onlyUncosted && it.has_recipe) return false;
      if (q && !`${it.product_name} ${it.variant_name}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const margin = (it) => (it.margin_pct === null ? null : toNumber(it.margin_pct));
    const nullsLast = (a, b, cmp) => {
      if (a === null && b === null) return 0;
      if (a === null) return 1;
      if (b === null) return -1;
      return cmp(a, b);
    };
    list = [...list].sort((a, b) => {
      if (sort === 'margin_asc') return nullsLast(margin(a), margin(b), (x, y) => x - y);
      if (sort === 'margin_desc') return nullsLast(margin(a), margin(b), (x, y) => y - x);
      if (sort === 'cost_desc') {
        return nullsLast(
          a.cost === null ? null : toNumber(a.cost),
          b.cost === null ? null : toNumber(b.cost),
          (x, y) => y - x
        );
      }
      return `${a.product_name} ${a.variant_name}`.localeCompare(
        `${b.product_name} ${b.variant_name}`,
        'es'
      );
    });
    return list;
  }, [items, search, category, onlyUncosted, sort]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-light flex items-center gap-2">
          <Calculator className="w-7 h-7 text-secondary" />
          Costeo
        </h1>
        <p className="text-gray mt-1">
          Cuánto cuesta de verdad cada variante según su receta, frente a lo que se cobra. Objetivo
          de la casa: margen del {Math.round(targetMargin)} % (costo × 2).
        </p>
      </div>

      {isError ? (
        <p className="text-sm text-red-400">No se pudo cargar el costeo del catálogo.</p>
      ) : isLoading ? (
        <div className="flex items-center gap-2 text-gray text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi
              label="Catálogo costeado"
              value={`${formatPct(summary?.coverage_pct).replace(' %', '')} %`}
              hint={`${summary?.costed_variants ?? 0} de ${summary?.total_variants ?? 0} variantes`}
            />
            <Kpi
              label="Margen promedio"
              value={formatPct(summary?.avg_margin_pct)}
              tone={marginTone(summary?.avg_margin_pct)}
              hint="de lo ya costeado"
            />
            <Kpi
              label="Bajo el objetivo"
              value={String(summary?.below_target_count ?? 0)}
              tone={summary?.below_target_count ? 'text-red-400' : 'text-light'}
              hint={`margen menor al ${Math.round(targetMargin)} %`}
            />
            <Kpi
              label="Sin receta"
              value={String(summary?.uncosted_variants ?? 0)}
              tone={summary?.uncosted_variants ? 'text-yellow-400' : 'text-light'}
              hint="todavía no se sabe su costo"
            />
          </div>

          {/* Filtros */}
          <div className="fb-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_13rem_auto] gap-3 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto o variante…"
                className={`${selectClass} pl-9`}
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value="" className="bg-dark">
                Todas las categorías
              </option>
              {categories.map(([slug, name]) => (
                <option key={slug} value={slug} className="bg-dark">
                  {name}
                </option>
              ))}
            </select>
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={`${selectClass} pl-9`}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-dark">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-light whitespace-nowrap">
              <input
                type="checkbox"
                checked={onlyUncosted}
                onChange={(e) => setOnlyUncosted(e.target.checked)}
                className="w-4 h-4 rounded border-gray/20 bg-dark text-secondary focus:ring-secondary"
              />
              Solo sin receta
            </label>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-gray py-6 text-center">
              {items.length === 0
                ? 'No hay variantes activas en este negocio.'
                : 'Ninguna variante coincide con el filtro.'}
            </p>
          ) : (
            <>
              {/* Tabla (escritorio) */}
              <div className="hidden md:block fb-card p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[0.7rem] uppercase tracking-wide text-gray">
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium text-right">Precio</th>
                      <th className="px-4 py-3 font-medium text-right">Costo</th>
                      <th className="px-4 py-3 font-medium text-right">Margen</th>
                      <th className="px-4 py-3 font-medium text-right">Food cost</th>
                      <th className="px-4 py-3 font-medium text-right">Sugerido</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((it) => (
                      <tr key={it.variant_id} className="border-t border-white/[0.06]">
                        <td className="px-4 py-3">
                          <p className="text-light font-medium">
                            {it.product_name}{' '}
                            <span className="text-gray font-normal">· {it.variant_name}</span>
                          </p>
                          <p className="text-xs text-gray">
                            {it.category_name}
                            {!selectedBusinessSlug && ` · ${it.business_name}`}
                            {it.has_recipe
                              ? ` · ${it.ingredient_count} ${it.ingredient_count === 1 ? 'ingrediente' : 'ingredientes'}`
                              : ' · sin receta'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-light">{formatCOP(it.price)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-light">{formatCOP(it.cost)}</td>
                        <td className={`px-4 py-3 text-right tabular-nums font-semibold ${marginTone(it.margin_pct)}`}>
                          {formatPct(it.margin_pct)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-light">{formatPct(it.food_cost_pct)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-light">{formatCOP(it.suggested_price)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/productos/editar/${it.product_slug}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-secondary/80"
                          >
                            <PencilLine className="w-3.5 h-3.5" />
                            {it.has_recipe ? 'Editar' : 'Costear'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas (móvil) */}
              <div className="md:hidden space-y-3">
                {visible.map((it) => (
                  <Link
                    key={it.variant_id}
                    to={`/productos/editar/${it.product_slug}`}
                    className="fb-card block p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-light font-medium truncate">
                          {it.product_name} <span className="text-gray font-normal">· {it.variant_name}</span>
                        </p>
                        <p className="text-xs text-gray">
                          {it.category_name}
                          {it.has_recipe ? ` · ${it.ingredient_count} ingr.` : ' · sin receta'}
                        </p>
                      </div>
                      <span className={`text-lg font-bold tabular-nums shrink-0 ${marginTone(it.margin_pct)}`}>
                        {formatPct(it.margin_pct)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <Mini label="Precio" value={formatCOP(it.price)} />
                      <Mini label="Costo" value={formatCOP(it.cost)} />
                      <Mini label="Sugerido" value={formatCOP(it.suggested_price)} />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, hint, tone = 'text-light' }) {
  return (
    <div className="fb-card p-4">
      <p className="text-[0.7rem] uppercase tracking-wide text-gray">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
      {hint && <p className="text-xs text-gray mt-0.5">{hint}</p>}
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div>
      <p className="text-gray">{label}</p>
      <p className="text-light font-medium tabular-nums">{value}</p>
    </div>
  );
}
