import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

/**
 * Layout compartido para páginas legales (Política de Privacidad y
 * Términos de Servicio). Tema sobrio, legible y on-brand.
 */
const LegalPage = ({ title, description, lastUpdated, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-light">
      <Helmet>
        <title>{title} | Frostbyte</title>
        {description && <meta name="description" content={description} />}
      </Helmet>

      {/* Nav minimal */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-dark/60 border-b border-white/[0.06]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold tracking-widest text-light hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} />
            FROSTBYTE
          </Link>
          <span className="hidden sm:inline-block text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            Legal
          </span>
        </div>
      </nav>

      {/* Contenido */}
      <main className="container mx-auto px-4 pt-28 pb-20">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10 border-b border-white/[0.08] pb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-light leading-tight">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-gray text-sm mt-3">
                Última actualización: {lastUpdated}
              </p>
            )}
          </header>

          <div className="legal-content space-y-8">{children}</div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

/** Sección con título y cuerpo, para estructurar el documento. */
export const LegalSection = ({ title, children }) => (
  <section className="space-y-3">
    {title && (
      <h2 className="text-xl sm:text-2xl font-bold text-light">{title}</h2>
    )}
    <div className="space-y-3 text-gray leading-relaxed [&_a]:text-primary [&_a:hover]:text-secondary [&_strong]:text-light [&_li]:ml-1">
      {children}
    </div>
  </section>
);

export default LegalPage;
