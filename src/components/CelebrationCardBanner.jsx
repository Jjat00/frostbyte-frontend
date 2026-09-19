import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import useCelebrationShotPromo from '@/hooks/useCelebrationShotPromo';
import { SOCIAL_HANDLE } from '@/lib/social';

export default function CelebrationCardBanner() {
  const shotPromo = useCelebrationShotPromo();
  return <section className="aa-card-banner" aria-labelledby="card-banner-title">
    <span className="aa-card-banner-mark" aria-hidden="true">&</span>
    <div><p className="aa-kicker">{shotPromo ? 'Solo hoy · Amor y Amistad' : 'Hecha con tu foto'}</p><h2 id="card-banner-title">{shotPromo ? 'Una dedicatoria para ellos. Un shot gratis para ti.' : 'Hay recuerdos que merecen una tarjeta.'}</h2><p>{shotPromo ? `Publica tu foto o tarjeta en Instagram, etiqueta a ${SOCIAL_HANDLE} y muéstrala en Frostbyte para reclamar tu shot.` : 'Una dedicatoria tuya, los colores de ustedes y un detalle de Frostbyte.'}</p></div>
    <Link to="/amor-amistad/tarjeta" className="aa-button aa-button--primary">{shotPromo ? 'Crear mi dedicatoria' : 'Crear mi tarjeta'} <ArrowUpRight size={16} aria-hidden="true" /></Link>
  </section>;
}
