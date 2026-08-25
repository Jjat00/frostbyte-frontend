import { useEffect } from "react";

// Carga una hoja de Google Fonts solo cuando se visita la página que la usa.
// No se retira al desmontar: el navegador ya la tiene cacheada y quitarla
// provocaría FOUT al volver a entrar.
export function useGoogleFonts(href) {
  useEffect(() => {
    if (document.querySelector(`link[data-hero-font="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-hero-font", href);
    document.head.appendChild(link);
  }, [href]);
}
