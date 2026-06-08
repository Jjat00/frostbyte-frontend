import React from "react";
import { cn } from "@/lib/utils";

/**
 * GruposDraw — sorteo de grupos del Mundial 2026 recreado EN CÓDIGO (sin imagen).
 * Reproduce el estilo del afiche oficial del sorteo: bloques de color vibrantes
 * de fondo + 12 tarjetas blancas (A–L) con cabecera negra, banderas y selecciones.
 * Colombia (Grupo K) va resaltada en oro.
 */

const G = (flag, name, opts = {}) => ({ flag, name, ...opts });

// Slots de repechaje (sin bandera única): se muestran con un chip "REP".
const PO = (code) => ({ flag: null, name: code, po: true });

const GROUPS = [
  { id: "A", teams: [G("🇲🇽", "México"), G("🇿🇦", "Sudáfrica"), G("🇰🇷", "Corea del Sur"), PO("CZE/DEN/IRL/MKD")] },
  { id: "B", teams: [G("🇨🇦", "Canadá"), PO("BIH/ITA/NIR/WAL"), G("🇶🇦", "Catar"), G("🇨🇭", "Suiza")] },
  { id: "C", teams: [G("🇧🇷", "Brasil"), G("🇲🇦", "Marruecos"), G("🇭🇹", "Haití"), G("🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Escocia")] },
  { id: "D", teams: [G("🇺🇸", "Estados Unidos"), G("🇵🇾", "Paraguay"), G("🇦🇺", "Australia"), PO("KOS/ROU/SVK/TUR")] },
  { id: "E", teams: [G("🇩🇪", "Alemania"), G("🇨🇼", "Curazao"), G("🇨🇮", "Costa de Marfil"), G("🇪🇨", "Ecuador")] },
  { id: "F", teams: [G("🇳🇱", "Países Bajos"), G("🇯🇵", "Japón"), PO("ALB/POL/SWE/UKR"), G("🇹🇳", "Túnez")] },
  { id: "G", teams: [G("🇧🇪", "Bélgica"), G("🇪🇬", "Egipto"), G("🇮🇷", "Irán"), G("🇳🇿", "Nueva Zelanda")] },
  { id: "H", teams: [G("🇪🇸", "España"), G("🇨🇻", "Cabo Verde"), G("🇸🇦", "Arabia Saudita"), G("🇺🇾", "Uruguay")] },
  { id: "I", teams: [G("🇫🇷", "Francia"), G("🇸🇳", "Senegal"), PO("BOL/IRQ/SUR"), G("🇳🇴", "Noruega")] },
  { id: "J", teams: [G("🇦🇷", "Argentina"), G("🇩🇿", "Argelia"), G("🇦🇹", "Austria"), G("🇯🇴", "Jordania")] },
  { id: "K", teams: [G("🇵🇹", "Portugal"), PO("COD/JAM/NCL"), G("🇺🇿", "Uzbekistán"), G("🇨🇴", "Colombia", { hl: true })] },
  { id: "L", teams: [G("🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Inglaterra"), G("🇭🇷", "Croacia"), G("🇬🇭", "Ghana"), G("🇵🇦", "Panamá")] },
];

const TeamRow = ({ t }) => (
  <li
    className={cn(
      "flex items-center gap-2 px-2 py-1.5 sm:px-2.5",
      t.hl && "bg-gold/30",
    )}
  >
    {t.flag ? (
      <span className="shrink-0 text-base leading-none sm:text-lg" aria-hidden>
        {t.flag}
      </span>
    ) : (
      <span
        className="shrink-0 rounded bg-dark px-1 py-px text-[8px] font-black uppercase tracking-wide text-white"
        aria-hidden
      >
        Rep
      </span>
    )}
    <span
      className={cn(
        "leading-tight text-dark",
        t.po
          ? "break-all text-[9px] font-semibold sm:text-[10px]"
          : "text-[11px] font-semibold sm:text-[12px]",
        t.hl && "font-black",
      )}
    >
      {t.name}
    </span>
    {t.hl && (
      <span className="ml-auto shrink-0 text-[10px]" aria-hidden>
        ⭐
      </span>
    )}
  </li>
);

const GroupCard = ({ id, teams }) => (
  <div
    role="group"
    aria-label={`Grupo ${id}`}
    className={cn(
      "overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10",
      id === "K" && "ring-2 ring-gold",
    )}
  >
    <div className="bg-[#0b0d10] py-1.5 text-center">
      <span className="t26-display text-[11px] font-black uppercase tracking-wider text-white sm:text-xs">
        Grupo {id}
      </span>
    </div>
    <ul className="divide-y divide-black/[0.07]">
      {teams.map((t, i) => (
        <TeamRow key={`${id}-${i}`} t={t} />
      ))}
    </ul>
  </div>
);

export const GruposDraw = ({ className = "" }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-2xl p-4 shadow-2xl shadow-black/40 sm:p-6",
      className,
    )}
  >
    {/* Módulos geométricos de fondo (cuadrados + cuartos de círculo, estilo
        afiche del sorteo) */}
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-br-full bg-red-600" />
      <div className="absolute -left-12 top-1/4 h-72 w-72 rounded-tr-full bg-blue-600" />
      <div className="absolute left-[28%] -top-[10%] h-[130%] w-1/2 -rotate-6 rounded-[3rem] bg-green-600" />
      <div className="absolute -right-12 -top-12 h-56 w-56 rounded-bl-full bg-blue-700" />
      <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-tl-full bg-gold" />
      <div className="absolute inset-0 bg-dark/25" />
    </div>

    {/* Cabecera */}
    <div className="relative mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="t26-num text-3xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-4xl">
          26
        </span>
        <div className="leading-tight">
          <p className="t26-display text-xs font-black uppercase tracking-wide text-white drop-shadow sm:text-sm">
            Mundial 2026
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/85 sm:text-[10px]">
            Resultados del sorteo
          </p>
        </div>
      </div>
      <span className="hidden rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white md:inline">
        48 selecciones · 12 grupos
      </span>
    </div>

    {/* Grilla de grupos */}
    <div className="relative grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 lg:grid-cols-4">
      {GROUPS.map((g) => (
        <GroupCard key={g.id} {...g} />
      ))}
    </div>
  </div>
);

export default GruposDraw;
