import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Zap, Search, Users } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

/**
 * Frostbyte Play: los juegos de la mesa. Solo se monta en `/mesa/*`.
 *
 * El 2026-08-20 pasó al lenguaje del hero. Se fueron los tres orbes con
 * `animate-pulse`, el brillo pulsante sobre cada tarjeta y los dos mandos que
 * se balanceaban en bucle junto al titular: movimiento infinito en una página
 * que ya castiga las GPU de gama baja.
 *
 * Cada juego conserva su color como chip, que es lo que los distingue de un
 * vistazo.
 */

const games = [
  {
    id: "duelo-frostbyte",
    name: "Duelo Frostbyte",
    description:
      "Juego de reflejos ultra rápido. Compite con tus amigos para ver quién reacciona más rápido.",
    icon: Zap,
    minPlayers: 2,
    gradient: "from-violet-500 via-purple-500 to-amber-500",
    features: ["Juego de reflejos", "Rondas rápidas"],
  },
  {
    id: "impostor-frostbyte",
    name: "Impostor Frostbyte",
    description:
      "Descubre al impostor entre tus amigos. Un celular, muchas sospechas. Encuentra quién no pertenece.",
    icon: Search,
    minPlayers: 3,
    gradient: "from-red-500 via-rose-500 to-orange-500",
    features: ["Juego de deducción", "Conversación en grupo"],
  },
];

const GameCard = ({ game }) => {
  const navigate = useNavigate();
  const Icon = game.icon;

  return (
    <div className="fb-card fb-reveal flex h-full flex-col p-6">
      <span
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-[12px] bg-linear-to-br ${game.gradient} opacity-90`}
      >
        <Icon className="h-[18px] w-[18px] text-dark" />
      </span>

      <h3 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
        {game.name}
      </h3>

      <p className="mt-3 text-[0.78rem] leading-relaxed text-light/55">
        {game.description}
      </p>

      <ul className="mt-4 space-y-1.5 text-[0.72rem] text-light/45">
        {game.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-light/25">·</span>
            <span>{f}</span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <Users className="h-3 w-3 text-light/25" />
          <span>{game.minPlayers}+ jugadores</span>
        </li>
      </ul>

      <button
        type="button"
        onClick={() => navigate(`/game/${game.id}/instrucciones`)}
        className="fb-btn fb-btn--accent mt-6 w-full"
      >
        <Play className="h-3.5 w-3.5" />
        Jugar
      </button>
    </div>
  );
};

const FrostbytePlay = () => {
  return (
    <section
      id="frostbyte-play"
      className="fb-section py-16"
      style={{ "--fb-accent": "#8b5cf6", "--fb-accent-2": "#f59e0b" }}
    >
      <div className="container relative z-10 mx-auto px-5">
        <SectionHeading
          eyebrow="En tu mesa"
          title="Frostbyte Play"
          description="Juegos rápidos para compartir con tus amigos mientras esperas el pedido."
          className="mb-12"
        />

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FrostbytePlay;
