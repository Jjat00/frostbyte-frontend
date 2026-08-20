import React from "react";
import { Zap, Heart, Sparkles, Star } from "lucide-react";
import { useProductsByCategory } from "@/hooks";
import SectionHeading from "@/components/SectionHeading";

/**
 * El Desguayabator: la bebida más famosa de la casa.
 *
 * El 2026-08-20 pasó al lenguaje del hero (`minimal.css`). Se fueron las tres
 * capas de resplandor con `animate-pulse` (una de 600 px con blur de 200 px),
 * la rejilla de fondo y las cuatro entradas de GSAP — el titular escalaba
 * desde 3× y el precio rebotaba con un `elastic.out`. Lo que queda es el
 * argumento: qué lleva, cuánto cuesta y en qué sabores.
 *
 * El verde de la sección vive ahora en el velo del fondo y en el hilo; el
 * color de cada sabor, en su chip.
 */

const formatPrice = (price) => {
  if (!price) return "$0";
  return `$${Number(price).toLocaleString("es-CO")}`;
};

// Color de contenido: el sabor de cada Electrolit.
const flavorStyles = {
  "desguayabator-maracuya": { icon: Star, gradient: "from-yellow-400 to-orange-500" },
  "desguayabator-fresa": { icon: Heart, gradient: "from-pink-400 to-red-500" },
  "desguayabator-coco": { icon: Sparkles, gradient: "from-white to-gray-300" },
  "desguayabator-naranja-mandarina": { icon: Zap, gradient: "from-orange-400 to-orange-600" },
};

const getFlavorStyles = (product) =>
  flavorStyles[product.slug?.toLowerCase() || ""] || {
    icon: Zap,
    gradient: "from-emerald-400 to-cyan-400",
  };

const FlavorCard = ({ product }) => {
  const styles = getFlavorStyles(product);
  const Icon = styles.icon;

  // Simplificar el nombre (quitar "Desguayabator ")
  const displayName = product.name.replace("Desguayabator ", "");

  return (
    <div className="fb-card fb-card--link fb-card--lift flex h-full flex-col p-4 sm:p-5">
      <span
        className={`mb-3.5 flex h-9 w-9 items-center justify-center rounded-[11px] bg-linear-to-br ${styles.gradient} opacity-90`}
      >
        <Icon className="text-dark" size={17} />
      </span>

      <h3 className="font-display text-[0.88rem] font-semibold uppercase tracking-[0.12em] text-light">
        {displayName}
      </h3>

      <p className="mt-2 hidden text-[0.75rem] leading-relaxed text-light/55 sm:block">
        {product.description}
      </p>

      <div className="mt-auto border-t border-white/[0.06] pt-3.5">
        <span className="text-[0.62rem] uppercase tracking-[0.14em] text-light/35">
          Electrolit + Bonfiest
        </span>
      </div>
    </div>
  );
};

const FlavorSkeleton = () => (
  <div className="fb-card h-full animate-pulse p-4 sm:p-5">
    <div className="mb-3.5 h-9 w-9 rounded-[11px] bg-white/[0.06]" />
    <div className="mb-2 h-4 w-3/4 rounded bg-white/[0.06]" />
    <div className="mb-4 hidden h-3 w-full rounded bg-white/[0.04] sm:block" />
    <div className="h-3 w-32 rounded bg-white/[0.04]" />
  </div>
);

const INGREDIENTES = [
  { Icon: Zap, nombre: "Electrolit", papel: "Hidratación total" },
  { Icon: Heart, nombre: "Bonfiest", papel: "Alivio express" },
];

const Desguayabator = () => {
  const { data, isLoading, error } = useProductsByCategory("desguayabator");

  const products = data?.results || [];

  // Obtener precio del primer producto (todos cuestan igual)
  const defaultPrice = products[0]?.variants?.[0]?.price || "12000";

  return (
    <section
      id="desguayabator"
      className="fb-section py-16 sm:py-20"
      style={{ "--fb-accent": "#10b981", "--fb-accent-2": "#22d3ee" }}
    >
      <div className="container relative z-10 mx-auto px-5">
        <SectionHeading
          eyebrow="Cura guayabos"
          title="Desguayabator"
          description="La bebida más famosa de Cumbal para curar el guayabo. Fórmula de la casa con Electrolit y Bonfiest para revivir después de una noche épica."
          className="mb-9"
        />

        {/* Qué lleva y cuánto cuesta: las dos preguntas, juntas */}
        <div className="fb-reveal mx-auto mb-12 flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row">
          {INGREDIENTES.map(({ Icon, nombre, papel }) => (
            <div
              key={nombre}
              className="fb-card flex flex-1 items-center gap-3 p-4"
            >
              <Icon size={17} className="flex-shrink-0 text-emerald-400" />
              <span className="min-w-0">
                <span className="block text-[0.82rem] font-medium text-light">
                  {nombre}
                </span>
                <span className="block text-[0.65rem] text-light/45">
                  {papel}
                </span>
              </span>
            </div>
          ))}

          <div className="fb-card fb-card--accent flex flex-1 flex-col justify-center p-4 text-center sm:text-left">
            <span className="fb-eyebrow block">Precio único</span>
            <span className="mt-1.5 block text-xl font-medium text-light">
              {formatPrice(defaultPrice)}
            </span>
            <span className="mt-0.5 block text-[0.65rem] text-light/45">
              Cualquier sabor
            </span>
          </div>
        </div>

        <div className="mb-6 text-center">
          <span className="fb-eyebrow">Elige tu sabor de Electrolit</span>
        </div>

        {error && (
          <div className="fb-inset mb-8 p-4 text-center text-[0.8rem] text-light/70">
            Error al cargar los productos.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading
            ? [...Array(4)].map((_, i) => <FlavorSkeleton key={i} />)
            : products.map((product) => (
                <FlavorCard key={product.id} product={product} />
              ))}
        </div>

        <p className="mt-10 text-center text-[0.75rem] text-light/45">
          <span className="text-light/70">Pro tip:</span> pídelo antes de que el
          guayabo te gane la batalla.
        </p>
      </div>
    </section>
  );
};

export default Desguayabator;
