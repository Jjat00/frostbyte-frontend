import React from 'react';
import useCelebrationShotPromo from '@/hooks/useCelebrationShotPromo';
import { SOCIAL_HANDLE, SOCIAL } from '@/lib/social';

export default function CelebrationShotReminder() {
  const active = useCelebrationShotPromo();
  if (!active) return null;
  return <aside className="aa-shot-reminder" aria-label="Promoción de Amor y Amistad">
    <strong>Hoy tu dedicatoria viene con un shot gratis.</strong>{' '}
    Publica tu foto o tarjeta en Instagram, etiqueta a{' '}
    <a href={SOCIAL.instagram.url} target="_blank" rel="noopener noreferrer">{SOCIAL_HANDLE}</a>
    {' '}y muéstranos la publicación en Frostbyte para reclamarlo.
    {' '}Solo hoy, 19 de septiembre de 2026.
  </aside>;
}
