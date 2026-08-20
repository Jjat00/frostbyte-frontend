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
    <div className="fb-screen fb-screen--plain min-h-screen text-light">
      <Helmet>
        <title>{title} | Frostbyte</title>
        {description && <meta name="description" content={description} />}
      </Helmet>

      {/* Nav minimal */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-dark/95">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-display flex items-center gap-2 text-[0.82rem] font-semibold tracking-[0.14em] text-light transition-colors hover:text-light/70"
          >
            <ArrowLeft size={16} />
            FROSTBYTE
          </Link>
          <span className="fb-eyebrow hidden sm:inline-block">
            Legal
          </span>
        </div>
      </nav>

      {/* Contenido */}
      <main className="container mx-auto px-5 pb-16 pt-28">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10 border-b border-white/[0.08] pb-8">
            <h1 className="font-display text-[1.35rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light sm:text-[1.6rem]">
              {title}
            </h1>
            {lastUpdated && (
              <p className="mt-3 text-[0.75rem] text-light/40">
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
      <h2 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">{title}</h2>
    )}
    <div className="space-y-3 text-[0.82rem] leading-relaxed text-light/55 [&_a:hover]:text-light [&_a]:text-light/80 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-1 [&_strong]:font-medium [&_strong]:text-light">
      {children}
    </div>
  </section>
);

export default LegalPage;
