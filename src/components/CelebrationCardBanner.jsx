import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CelebrationCardBanner() {
  return <section className="aa-card-banner" aria-labelledby="card-banner-title">
    <span className="aa-card-banner-mark" aria-hidden="true">&</span>
    <div><p className="aa-kicker">Hecha con tu foto</p><h2 id="card-banner-title">Hay recuerdos que merecen una tarjeta.</h2><p>Una dedicatoria tuya, los colores de ustedes y un detalle de Frostbyte.</p></div>
    <Link to="/amor-amistad/tarjeta" className="aa-button aa-button--primary">Crear mi tarjeta <ArrowUpRight size={16} aria-hidden="true" /></Link>
  </section>;
}
