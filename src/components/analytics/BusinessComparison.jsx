import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Building2, Store } from 'lucide-react';

const BUSINESS_HEX = {
  blue: 'var(--color-secondary)',
  orange: '#f59e0b',
};

function hexFor(color) {
  return BUSINESS_HEX[color] || 'var(--color-primary)';
}

/**
 * Comparativa de ingresos / gastos / ganancia por negocio + consolidado.
 * `data` viene de analyticsService.getByBusiness().
 */
export default function BusinessComparison({ data, formatCurrency, formatCurrencyFull }) {
  if (!data) return null;
  const businesses = data.businesses || [];
  const consolidated = data.consolidated;

  // Solo tiene sentido comparar si hay mas de un negocio
  if (businesses.length < 2) return null;

  const chartData = businesses.map((b) => ({
    name: b.name,
    color: b.color,
    Ingresos: b.revenue,
    Gastos: b.total_expenses,
    Ganancia: b.profit,
  }));

  const tooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="backdrop-blur-xl bg-white/[0.06] border border-secondary/30 rounded-xl p-3">
        <p className="text-xs text-secondary font-bold mb-1.5">{label}</p>
        {payload.map((e, i) => (
          <div key={i} className="flex items-center justify-between gap-6 text-xs">
            <span className="text-gray">{e.name}</span>
            <span className="font-bold text-light">{formatCurrencyFull(e.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-secondary/10 border border-secondary/20">
          <Building2 className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-bold text-light">Comparativa por negocio</h2>
          <p className="text-xs text-gray mt-0.5">{data.period?.label || 'Mes actual'}</p>
        </div>
      </div>

      {/* Cards por negocio + consolidado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        {businesses.map((b, idx) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl p-4 md:p-5"
            style={{ borderTopColor: hexFor(b.color), borderTopWidth: 3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hexFor(b.color) }} />
              <h3 className="font-bold text-light">{b.name}</h3>
              {b.floor ? <span className="text-xs text-gray ml-auto">Piso {b.floor}</span> : null}
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray">Ingresos</dt>
                <dd className="text-green-400 font-semibold">{formatCurrency(b.revenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray">Gastos</dt>
                <dd className="text-red-400 font-semibold">{formatCurrency(b.total_expenses)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/[0.08] pt-1.5">
                <dt className="text-gray">Ganancia</dt>
                <dd className={`font-bold ${b.profit >= 0 ? 'text-secondary' : 'text-red-400'}`}>
                  {formatCurrency(b.profit)}
                  <span className="text-gray font-normal text-xs ml-1">({b.profit_margin ?? 0}%)</span>
                </dd>
              </div>
            </dl>
          </motion.div>
        ))}

        {consolidated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: businesses.length * 0.05 }}
            className="bg-gradient-to-br from-secondary/15 to-primary/5 border-2 border-secondary/30 rounded-2xl p-4 md:p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-4 h-4 text-secondary" />
              <h3 className="font-bold text-light">Consolidado</h3>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray">Ingresos</dt>
                <dd className="text-green-400 font-semibold">{formatCurrency(consolidated.revenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray">Gastos</dt>
                <dd className="text-red-400 font-semibold">{formatCurrency(consolidated.total_expenses)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/[0.08] pt-1.5">
                <dt className="text-gray">Ganancia</dt>
                <dd className={`font-bold ${consolidated.profit >= 0 ? 'text-secondary' : 'text-red-400'}`}>
                  {formatCurrency(consolidated.profit)}
                  <span className="text-gray font-normal text-xs ml-1">({consolidated.profit_margin ?? 0}%)</span>
                </dd>
              </div>
            </dl>
          </motion.div>
        )}
      </div>

      {/* Barras comparativas */}
      <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-2xl p-4 md:p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
              <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} style={{ fontSize: '11px' }} />
              <Tooltip content={tooltip} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Gastos" fill="#EF4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Ganancia" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.Ganancia >= 0 ? '#8B5CF6' : '#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
