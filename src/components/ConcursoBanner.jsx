import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCurrentContest } from "@/hooks/useContest";
import ConcursoPoster from "@/components/concurso/ConcursoPoster";

/**
 * Anuncio del concurso vigente en la carta y en las mesas (hoy: disfraces
 * de Halloween). Es el póster completo, no una tarjeta más: tiene que
 * frenar el scroll.
 *
 * Manda `Contest.is_published`: sin concurso publicado el backend responde
 * null y aquí no se pinta nada. Por eso no cuelga de la campaña de Halloween:
 * el staff lo enciende o lo apaga desde el panel sin redeploy.
 */
const ConcursoBanner = () => {
  const { data: contest } = useCurrentContest();
  if (!contest) return null;

  return (
    <section id="concurso" className="theme-concurso cz-ground relative">
      <ConcursoPoster
        contest={contest}
        cta={
          <Link to="/concurso" className="cz-cta">
            {contest.registrations_open ? "Inscríbete" : "Ver el concurso"}
            <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
        }
      />
    </section>
  );
};

export default ConcursoBanner;
