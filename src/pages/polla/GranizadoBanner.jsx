import React, { useEffect, useReducer, useState } from "react";
import { CupSoda, Check, Clock } from "lucide-react";
import { useGranizado, useRedeemGranizado } from "@/hooks/usePolla";

/**
 * Card del granizado gratis ganado por acertar el marcador exacto de Colombia.
 *
 * Solo aparece si el cliente tiene un premio PENDIENTE (no vencido). Muestra el
 * partido, un contador hacia el vencimiento (24 h) y el código. El personal de
 * Frostbyte toca "Marcar como entregado" en el mostrador para reclamarlo.
 */

// Tiempo restante hasta `expiresAt` en texto corto; null si ya venció.
function timeLeft(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

const GranizadoBanner = () => {
  const { data } = useGranizado();
  const redeem = useRedeemGranizado();
  const [confirmId, setConfirmId] = useState(null);

  // Re-render cada minuto para refrescar el contador.
  const [, tick] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const rewards = data?.rewards ?? [];
  const pending = rewards.find(
    (r) => r.status === "pending" && timeLeft(r.expires_at),
  );
  const redeemedNow = rewards.find(
    (r) => r.id === confirmId && r.status === "redeemed",
  );

  if (!pending && !redeemedNow) return null;

  // Confirmación tras entregar (ya no hay pendiente).
  if (redeemedNow && !pending) {
    return (
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-grass/40 bg-grass/10 px-4 py-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grass/20 text-grass">
          <Check size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-light">¡Granizado entregado!</p>
          <p className="text-xs text-gray">Disfrútalo. Gracias por jugar la Polla.</p>
        </div>
      </div>
    );
  }

  const left = timeLeft(pending.expires_at);
  const onRedeem = () => {
    setConfirmId(pending.id);
    redeem.mutate(pending.id);
  };

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-gold/40 bg-linear-to-r from-gold/[0.10] to-grass/[0.08]">
      <span aria-hidden className="block h-1 bg-linear-to-r from-gold to-grass" />
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-gold">
          <CupSoda size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
            Granizado gratis
          </p>
          <p className="font-black leading-tight text-light">¡Ganaste un granizado!</p>
          <p className="mt-0.5 text-xs text-gray">
            Acertaste el marcador de {pending.match}.
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-gold">
            <Clock size={13} /> Reclámalo en Frostbyte · vence en {left}
          </p>
          {pending.code && (
            <p className="mt-1 text-[11px] text-gray">
              Código: <span className="font-mono font-bold text-light">{pending.code}</span>
            </p>
          )}

          <div className="mt-3 rounded-xl border border-white/10 bg-dark/30 p-2.5">
            <p className="text-[11px] leading-snug text-gray">
              Muéstrale esta pantalla al personal de Frostbyte. Ellos tocan el botón
              al entregarte el granizado.
            </p>
            <button
              type="button"
              onClick={onRedeem}
              disabled={redeem.isPending}
              className="mt-2 w-full rounded-lg bg-linear-to-r from-gold to-grass px-4 py-2.5 text-sm font-black text-dark transition active:scale-[0.98] disabled:opacity-60"
            >
              {redeem.isPending ? "Marcando…" : "Marcar como entregado"}
            </button>
            {redeem.isError && (
              <p className="mt-1.5 text-[11px] text-red-400">
                {redeem.error?.response?.data?.detail ||
                  "No se pudo marcar. Intenta de nuevo."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GranizadoBanner;
