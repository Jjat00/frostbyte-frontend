import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { usePollaMissions } from "@/hooks/usePolla";

// "invite" no cuenta como misión (se gestiona como referidos), igual que en
// MisionesTab. Mantener sincronizado con HIDDEN_MISSIONS de esa pestaña.
const HIDDEN = ["invite"];

/**
 * Recordatorio para ganar puntos extra completando misiones e invitando al
 * parche. Enlaza a la pestaña Misiones. Muestra cuántas quedan pendientes
 * (cuando ya cargaron) para dar un gancho concreto.
 */
const MissionsBanner = () => {
  const { data } = usePollaMissions();
  const missions = (data?.missions ?? []).filter((m) => !HIDDEN.includes(m.code));
  const pending = missions.filter((m) => !m.done).length;
  const allDone = missions.length > 0 && pending === 0;

  if (allDone) return null;

  const title = "Suma puntos extra";
  const subtitle =
    pending > 0
      ? `Completa ${pending} ${pending === 1 ? "misión" : "misiones"} e invita a tu parche para ganar puntos.`
      : "Completa misiones e invita a tu parche para ganar puntos.";

  return (
    <Link
      to="/misiones"
      className="group relative mb-5 block w-full overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-r from-primary/[0.08] to-secondary/[0.06] text-left transition-colors hover:from-primary/[0.14] hover:to-secondary/[0.10]"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary to-secondary"
      />
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
          <Sparkles size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
            Misiones · puntos extra
          </p>
          <p className="truncate font-black text-light">{title}</p>
          <p className="line-clamp-2 text-xs leading-snug text-gray">{subtitle}</p>
        </div>
        <ChevronRight
          size={18}
          className="shrink-0 text-gray transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
};

export default MissionsBanner;
