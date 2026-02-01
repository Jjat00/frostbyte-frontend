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
  mocktails: Mocktails,
  cocteles: Mocktails,
  shots: Shots,
  micheladas: Micheladas,
  vinos: Vinos,
  cervezas: Cervezas,
  cuates: Cuates,
};

/**
 * Componente que renderiza dinámicamente las secciones del menú
 * basándose en las categorías activas de la base de datos.
 * Solo se muestran las secciones cuya categoría esté marcada como activa (is_active=true)
 */
const MenuSections = () => {
  const { data: categoriesData, isLoading } = useActiveCategories();

  // Obtener los slugs de las categorías activas ordenados por display_order
  const activeSections = useMemo(() => {
    if (!categoriesData?.results) return [];

    return categoriesData.results
      .filter((cat) => cat.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map((cat) => cat.slug);
  }, [categoriesData]);

  // Mientras carga, no mostrar nada (las secciones tienen sus propios skeletons)
  if (isLoading) {
    return null;
  }

  return (
    <>
      {activeSections.map((slug) => {
        const SectionComponent = SECTION_COMPONENTS[slug];
        if (!SectionComponent) return null;
        return <SectionComponent key={slug} />;
      })}
    </>
  );
};

export default MenuSections;
