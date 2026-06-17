import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Radio, CupSoda } from "lucide-react";
import Flag from "@/components/polla/Flag";
import { Mundial26Backdrop } from "@/components/mundial/Sistema26";
import { usePollaMatches } from "@/hooks/usePolla";
import { isColombiaMatch, COLOMBIA_TRICOLOR_H } from "@/pages/polla/ColombiaBanner";
import { matchTime, matchDayLabel, matchDayKey } from "@/data/mundial2026";
import { useCountdown, formatCountdownLong } from "@/hooks/useCountdown";

/**
 * Promo de partido de Colombia para la carta pública (raíz y mesas).
 *
 * Self-contained y dinámico: carga los partidos de la Polla y muestra el
 * próximo partido de Colombia (o el que está en vivo) con el gancho de la
 * promo "acierta el marcador exacto y te ganas un granizado gratis". Cuando
 * Colombia no tiene partido próximo no renderiza nada, así se apaga solo al
 * final del Mundial sin tocar código.
 *
 * Reutiliza la lógica e identidad visual de ColombiaBanner (tricolor) + la
 * paleta Sistema 26 (oro/verde). Sin blur pesado: la home se repinta en
 * celulares de gama baja (ver index.css).
 */

const TEAM_CODE = "COL";

/* "hoy" / "mañana" / "el Vie 19 jun" en hora de Colombia */
const dayPhrase = (kickoff) => {
  const key = matchDayKey(kickoff);
  const now = Date.now();
  if (key === matchDayKey(new Date(now))) return "hoy";
  if (key === matchDayKey(new Date(now + 86_400_000))) return "mañana";
  return `el ${matchDayLabel(kickoff)}`;
};

const CountdownText = ({ kickoff }) => {
  const cd = useCountdown(kickoff, { maxResolutionMs: 60_000 });
  return (
    <b className="font-black tabular-nums text-light">{formatCountdownLong(cd)}</b>
  );
};

const PartidoColombiaBanner = () => {
  const { data: matches = [] } = usePollaMatches({});

  const live = matches.find((m) => isColombiaMatch(m) && m.status === "live");
  const next = matches
    .filter((m) => isColombiaMatch(m) && m.status === "upcoming")
    .sort((a, b) => a.kickoff - b.kickoff)[0];
  const match = live || next;
  if (!match) return null;

  const rival = match.home.code === TEAM_CODE ? match.away : match.home;
  const isLive = Boolean(live);

  return (
    <section className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link
          to="/polla-mundial"
          className="group relative block overflow-hidden rounded-3xl border border-gold/40 bg-dark hover:border-gold/70 transition-colors duration-300"
        >
          {/* Línea superior tricolor de Colombia */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 z-20 h-1"
            style={{ background: COLOMBIA_TRICOLOR_H }}
          />
          {/* Capa decorativa afiche Mundial 26 (ligera en GPU) */}
          <Mundial26Backdrop />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-6">
            {/* Granizado */}
            <div className="shrink-0">
              <img
                src="/mundial/granizado-promo.webp"
                alt="Granizado Frostbyte de premio"
                loading="lazy"
                decoding="async"
                width={600}
                height={600}
                className="h-28 w-28 sm:h-32 sm:w-32 object-contain drop-shadow-[0_0_18px_rgba(242,197,61,0.35)]"
              />
            </div>

            {/* Texto */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              {isLive ? (
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-400">
                  <Radio size={12} className="animate-pulse" />
                  En vivo {match.minute != null && <>&middot; {match.minute}&apos;</>}
                </p>
              ) : (
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FCD116]">
                  <Flag iso2="co" name="Colombia" size={16} rounded="rounded-sm" />
                  Juega Colombia {dayPhrase(match.kickoff)}
                </p>
              )}

              <h3 className="mt-1 text-2xl sm:text-3xl font-black leading-tight text-light">
                Colombia <span className="text-gray">vs</span> {rival.name}
              </h3>

              {isLive ? (
                <p className="mt-0.5 text-sm text-gray">
                  Vamos{" "}
                  <b className="tabular-nums text-light">
                    {match.home_score ?? 0} - {match.away_score ?? 0}
                  </b>
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-gray">
                  {matchTime(match.kickoff)} &middot; arranca en{" "}
                  <CountdownText kickoff={match.kickoff} />
                </p>
              )}

              {/* Gancho de la promo */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-grass/40 bg-grass/10 px-3 py-2 text-left">
                <CupSoda size={18} className="shrink-0 text-grass" />
                <p className="text-xs sm:text-sm font-semibold text-light leading-snug">
                  Acierta el <span className="text-gold">marcador exacto</span> en la Polla y te
                  ganas un <span className="text-grass">granizado gratis</span>.
                </p>
              </div>
            </div>

            {/* CTA */}
            <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-grass to-gold px-5 py-3 text-sm font-bold text-dark shadow-lg shadow-grass/30 group-hover:shadow-gold/50 transition-all duration-300">
              {isLive ? "Ver en la Polla" : "Haz tu pronóstico"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </motion.div>
    </section>
  );
};

export default PartidoColombiaBanner;
