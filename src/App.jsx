import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
// import Gallery from "@/components/Gallery";
// import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import QuickNav from "@/components/QuickNav";
import CartaList from "@/components/CartaList";
import MenuSections from "@/components/MenuSections";
import Desguayabator from "@/components/Desguayabator";
import WaterSection from "@/components/WaterSection";
import ScrollToCarta from "@/components/ScrollToMenu";
import SolicitarMusica from "@/components/SolicitarMusica";
import FeedbackSection from "@/components/FeedbackSection";
import SocialDiscountBanner from "@/components/SocialDiscountBanner";
import BirthdayDiscountBanner from "@/components/BirthdayDiscountBanner";
import SalaVipBanner from "@/components/SalaVipBanner";
import DomiciliosBanner from "@/components/DomiciliosBanner";
import PollaMundialBanner from "@/components/PollaMundialBanner";
import PartidoColombiaBanner from "@/components/PartidoColombiaBanner";
import DrinkRecommender from "@/components/DrinkRecommender";
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
      <div className="min-h-screen bg-dark overflow-hidden">
        <Header />
        <main>
          <Hero />
          <QuickNav />
          {/* Domicilios: aviso del nuevo servicio con las líneas de WhatsApp
              que reciben pedidos. Encabeza la carta para máxima visibilidad;
              abajo se repite como strip compacto. */}
          <DomiciliosBanner />
          {/* Promo del partido de Colombia: solo aparece cuando la selección
              tiene un partido en vivo o próximo (granizado gratis por acertar
              el marcador exacto). Encabeza la carta. */}
          <PartidoColombiaBanner />
          {/* Anuncio de la Polla Mundialista — aparece varias veces a lo largo
              de la carta con distintas variantes para mantener el premio
              ($500.000) visible sin saturar. */}
          <PollaMundialBanner variant="feature" />
          <CartaList />
          {/* Secciones del menú renderizadas dinámicamente según categorías activas */}
          <MenuSections />
          <Desguayabator />
          <WaterSection />
          {/* Recordatorio compacto de domicilios al cierre de la carta */}
          <DomiciliosBanner variant="strip" />
          <PollaMundialBanner variant="strip" />
          <DrinkRecommender />
          <SocialDiscountBanner />
          <BirthdayDiscountBanner />
          {/* Sala VIP (piso 3): promoción sin precios, el interesado pide
              información al personal o por WhatsApp */}
          <SalaVipBanner />
          <SolicitarMusica />
          <PollaMundialBanner variant="prize" />
          <FeedbackSection />
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
