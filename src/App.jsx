import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
// import Gallery from "@/components/Gallery";
// import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Granizados from "@/components/Granizados";
import Frappes from "@/components/Frappes";
import SodasMicheladas from "@/components/SodasMicheladas";
import Mocktails from "@/components/Mocktails";
import Shots from "@/components/Shots";
import Micheladas from "@/components/Micheladas";
import QuickNav from "@/components/QuickNav";
import Desguayabator from "@/components/Desguayabator";
import ScrollToCarta from "@/components/ScrollToMenu";
import Vinos from "@/components/Vinos";
import Cervezas from "@/components/Cervezas";
import Cuates from "@/components/Cuates";
import SolicitarCancion from "@/components/SolicitarCancion";
import { env } from "@/config/env";

function App() {
  useEffect(() => {
    // Registrar visita a la página principal
    fetch(`${env.API_BASE_URL}/pages/register-visit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: "/" }),
    }).catch((error) => {
      console.error("Error al registrar visita:", error);
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Frostbyte - Granizados</title>
        <meta
          name="description"
          content="Experimenta el futuro de las bebidas heladas. Frostbyte ofrece granizados y frappés premium con un toque cyberpunk. Sabores neón, vibras eléctricas."
        />
      </Helmet>
      <div className="min-h-screen bg-dark overflow-hidden">
        <Header />
        <main>
          <Hero />
          <QuickNav />
          <Granizados />
          <Frappes />
          <SodasMicheladas />
          <Micheladas />
          <Cervezas />
          <Cuates />
          <Mocktails />
          <Shots />
          <Vinos />
          <Desguayabator />
          <SolicitarCancion />
          <Features />
          {/* <Gallery /> */}
          {/* <Contact /> */}
        </main>
        <Footer />
        <ScrollToCarta />
        <Toaster />
      </div>
    </>
  );
}

export default App;
