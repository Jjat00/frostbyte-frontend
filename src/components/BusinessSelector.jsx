import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { businessService } from '@/services/business.service';
import { useBusinessStore } from '@/stores/useBusinessStore';
import { cn } from '@/lib/utils';

const ALL_OPTION = { slug: '', name: 'Todos los negocios', color: '' };

// Mapea el color de marca del negocio a una clase de punto
function dotClass(color) {
  const map = {
    blue: 'bg-secondary',
    orange: 'bg-orange-400',
    '': 'bg-gradient-to-br from-secondary to-primary',
  };
  return map[color] || 'bg-primary';
}

/**
 * Selector global de negocio (Frostbyte / Frostbyte Food / Todos).
 * Lee/escribe useBusinessStore; los listados y dashboards lo consumen.
 */
export default function BusinessSelector({ label = 'Negocio' }) {
  const { selectedBusinessSlug, setSelectedBusiness } = useBusinessStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const businesses = Array.isArray(data) ? data : data?.results || [];
  // "Todos" solo tiene sentido cuando hay mas de un negocio
  const options = businesses.length > 1 ? [ALL_OPTION, ...businesses] : businesses;
  const current = options.find((b) => b.slug === selectedBusinessSlug) || options[0] || ALL_OPTION;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && <span className="block text-[11px] uppercase tracking-wider text-gray mb-1.5">{label}</span>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-light hover:bg-white/[0.1] transition-colors"
      >
        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', dotClass(current.color))} />
        <span className="flex-1 text-left text-sm font-medium truncate">{current.name}</span>
        <ChevronDown className={cn('w-4 h-4 text-gray transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-lg border border-white/[0.12] bg-dark-secondary/95 backdrop-blur-xl overflow-hidden py-1 shadow-xl"
          >
            {options.map((b) => (
              <li key={b.slug || 'all'}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBusiness(b.slug);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-light hover:bg-white/[0.08] transition-colors"
                >
                  <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', dotClass(b.color))} />
                  <span className="flex-1 truncate">{b.name}</span>
                  {b.slug === selectedBusinessSlug && <Check className="w-4 h-4 text-secondary" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
