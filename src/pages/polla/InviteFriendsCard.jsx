import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Check, Share2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReferral } from "@/hooks/usePolla";
import { buildReferralLink } from "@/utils/referral";

const SHARE_TITLE = "Polla Mundialista Frostbyte";
// Mensaje SIN el enlace: el enlace va aparte (en `url` para navigator.share),
// así no se duplica al compartir por WhatsApp.
const SHARE_MESSAGE =
  "¡Pronostica el Mundial 2026 conmigo en la Polla de Frostbyte y compite por premios! " +
  "Entra con mi invitación:";

const InviteFriendsCard = () => {
  const { data, isLoading } = useReferral();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="mb-4 h-[150px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
    );
  }
  if (!data?.code) return null;

  const { code, qualified = 0, points = 0, cap = 5, points_per = 1 } = data;
  const link = buildReferralLink(code);
  const pct = Math.min(100, Math.round((qualified / cap) * 100));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback para navegadores sin Clipboard API (http, viejos).
      const el = document.createElement("textarea");
      el.value = link;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        /* sin-op */
      }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        // El enlace va en `url` (no en `text`) para que no se repita.
        await navigator.share({ title: SHARE_TITLE, text: SHARE_MESSAGE, url: link });
        return;
      } catch {
        // Usuario canceló o no soportado: caer a WhatsApp.
      }
    }
    // wa.me solo acepta un texto: aquí sí incluimos el enlace una vez.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${SHARE_MESSAGE} ${link}`)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="liquid-glass relative mb-4 overflow-hidden rounded-2xl border border-primary/25 p-4"
    >
      {/* Brillo decorativo */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-linear-to-br from-primary/20 to-secondary/20 text-primary">
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-black text-light">Invita a tu banda</h3>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-bold text-secondary">
              <Gift size={11} />
              {points > 0 ? `+${points} pts` : `+${points_per} pt c/u`}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-snug text-gray">
            Comparte tu enlace y suma{" "}
            <span className="font-bold text-light">{points_per} punto</span> por cada
            amigo que entre y haga su primer pronóstico (máx {cap}).
          </p>
        </div>
      </div>

      {/* Progreso */}
      <div className="relative mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-secondary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[11px] font-bold tabular-nums text-gray">
          {qualified}/{cap}
        </span>
      </div>

      {/* Acciones: compartir (principal) + copiar enlace */}
      <div className="relative mt-3 flex gap-2">
        <button
          type="button"
          onClick={share}
          className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-primary to-secondary px-3 py-2.5 text-xs font-black text-dark transition-transform active:scale-[0.98]"
        >
          <Share2 size={15} />
          Compartir enlace
        </button>
        <button
          type="button"
          onClick={copyLink}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5",
            "text-xs font-bold transition-colors active:scale-[0.98]",
            copied
              ? "border-secondary/40 bg-secondary/10 text-secondary"
              : "border-white/10 bg-white/[0.04] text-light hover:bg-white/[0.08]"
          )}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
    </motion.div>
  );
};

export default InviteFriendsCard;
