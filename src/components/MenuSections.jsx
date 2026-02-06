import React, { useMemo } from "react";
import { useActiveCategories } from "@/hooks";

// Importar todos los componentes de secciones
import Granizados from "./Granizados";
import Frappes from "./Frappes";
import SodasMicheladas from "./SodasMicheladas";
import Mocktails from "./Mocktails";
import Shots from "./Shots";
import Micheladas from "./Micheladas";
import Vinos from "./Vinos";
import Cervezas from "./Cervezas";
import Cuates from "./Cuates";

/**
 * Mapa de slug de categoría a componente de sección
 * Cada categoría en la BD tiene un slug que corresponde a un componente visual
 */
const SECTION_COMPONENTS = {
  granizados: Granizados,
  frappes: Frappes,
  sodas: SodasMicheladas,
  "sodas-micheladas": SodasMicheladas,
  "sodas-italianas": SodasMicheladas,
  mocktails: Mocktails,
  cocteles: Mocktails,
  shots: Shots,
  micheladas: Micheladas,
  vinos: Vinos,
  cervezas: Cervezas,
  cuates: Cuates,
};

/**
 * Skeleton de sección que se muestra mientras cargan las categorías.
 * Simula la estructura visual de una sección del menú.
 */
const SectionSkeleton = () => (
  <section className="py-20 relative overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16 animate-pulse">
        <div className="h-10 bg-white/10 rounded-lg w-48 mx-auto mb-4"></div>
        <div className="h-5 bg-white/5 rounded w-80 mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 max-w-7xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-56 h-56 rounded-full bg-white/5 border-4 border-white/10 mb-4"></div>
            <div className="h-10 bg-white/10 rounded-lg w-3/4 mb-3"></div>
            <div className="h-4 bg-white/5 rounded w-full max-w-xs mb-4"></div>
            <div className="flex gap-6">
              <div className="h-8 bg-white/5 rounded w-16"></div>
              <div className="h-8 bg-white/5 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/**
 * Componente que renderiza dinámicamente las secciones del menú
 * basándose en las categorías activas de la base de datos.
 * Solo se muestran las secciones cuya categoría esté marcada como activa (is_active=true)
 */
const MenuSections = () => {
  const { data: categoriesData, isLoading } = useActiveCategories();

  // Obtener las categorías activas ordenadas por display_order
  const activeCategories = useMemo(() => {
    if (!categoriesData?.results) return [];

    return categoriesData.results
      .filter((cat) => cat.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }, [categoriesData]);

  // Mientras cargan las categorías, mostrar skeletons de secciones
  if (isLoading) {
    return (
      <>
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </>
    );
  }

  return (
    <>
      {activeCategories.map((category) => {
        const SectionComponent = SECTION_COMPONENTS[category.slug];
        if (!SectionComponent) return null;
        return (
          <SectionComponent
            key={category.slug}
            showExtras={category.show_extras}
          />
        );
      })}
    </>
  );
};

export default MenuSections;
