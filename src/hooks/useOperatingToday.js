import { useEffect, useState } from 'react';
import { isoDay, msUntilNextCutoff, operatingToday } from '@/lib/periods';

/**
 * El día de operación en curso, que cambia solo al pasar el corte de la
 * madrugada aunque la pantalla siga abierta, y se revisa al volver a la
 * pestaña (los temporizadores se duermen con el celular bloqueado).
 */
export default function useOperatingToday(cutoffHour = 0) {
  const [today, setToday] = useState(() => operatingToday(new Date(), cutoffHour));

  useEffect(() => {
    let timer;
    const refresh = () => {
      const now = operatingToday(new Date(), cutoffHour);
      setToday((prev) => (isoDay(prev) === isoDay(now) ? prev : now));
      clearTimeout(timer);
      timer = setTimeout(refresh, msUntilNextCutoff(new Date(), cutoffHour));
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [cutoffHour]);

  return today;
}
