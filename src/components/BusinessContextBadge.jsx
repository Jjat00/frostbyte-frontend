import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight } from 'lucide-react';
import { businessService } from '@/services/business.service';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { cn } from '@/lib/utils';

// Punto de color por negocio (alineado con BusinessSelector)
function dotClass(color) {
  const map = { blue: 'bg-secondary', orange: 'bg-orange-400' };
  return map[color] || 'bg-primary';
}

/**
 * Insignia PASIVA del negocio activo.
 *
 * A diferencia de BusinessSelector, no es un selector dentro del módulo: solo
 * muestra en qué negocio estás (elegido en la pantalla de selección tras el
 * login) y, al hacer clic, te lleva de vuelta a esa pantalla para cambiar.
 * Así, una vez dentro de un negocio, ningún módulo vuelve a preguntar.
 */
export default function BusinessContextBadge({ label = 'Negocio activo', className }) {
  const navigate = useNavigate();
  const { selectedBusinessSlug } = useBusinessStore();

  const { data } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const businesses = Array.isArray(data) ? data : data?.results || [];
  const active = businesses.find((b) => b.slug === selectedBusinessSlug);
  const name = selectedBusinessSlug ? active?.name || 'Negocio' : 'Consolidado';

  return (
    <div className={className}>
      {label && (
        <span className="block text-[11px] uppercase tracking-wider text-gray mb-1.5">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => navigate('/seleccionar-negocio')}
        title="Cambiar de negocio"
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-light hover:bg-white/[0.1] transition-colors"
      >
        {selectedBusinessSlug ? (
          <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', dotClass(active?.color))} />
        ) : (
          <Layers className="w-4 h-4 text-primary shrink-0" />
        )}
        <span className="flex-1 text-left text-sm font-medium truncate">{name}</span>
        <ChevronRight className="w-4 h-4 text-gray shrink-0" />
      </button>
    </div>
  );
}
