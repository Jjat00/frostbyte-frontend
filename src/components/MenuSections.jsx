import React, { useMemo } from "react";
import { useActiveCategories } from "@/hooks";
import FloralDivider from "@/components/womens-day/FloralDivider";

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

  // Mientras carga, no mostrar nada (las secciones tienen sus propios skeletons)
  if (isLoading) {
    return null;
  }

  // Filter to renderable categories
  const renderableCategories = activeCategories.filter(
    (cat) => SECTION_COMPONENTS[cat.slug]
  );

  return (
    <>
      {renderableCategories.map((category, index) => {
        const SectionComponent = SECTION_COMPONENTS[category.slug];
        return (
          <React.Fragment key={category.slug}>
            <SectionComponent showExtras={category.show_extras} />
            {index < renderableCategories.length - 1 && (
              <FloralDivider variant={index} />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default MenuSections;
