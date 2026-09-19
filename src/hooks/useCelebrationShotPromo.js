import { useEffect, useState } from 'react';
import { isCampaign } from '@/config/campaign';

// Solo el 19 de septiembre, en Colombia, incluso si la pestaña queda abierta.
const START = Date.parse('2026-09-19T00:00:00-05:00');
const END = Date.parse('2026-09-20T00:00:00-05:00');
export const isCelebrationShotDay = (now = Date.now()) =>
  isCampaign('amor-amistad') && now >= START && now < END;

export default function useCelebrationShotPromo() {
  const [active, setActive] = useState(isCelebrationShotDay);
  useEffect(() => {
    const update = () => setActive(isCelebrationShotDay());
    const timer = window.setInterval(update, 30_000);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return active;
}
