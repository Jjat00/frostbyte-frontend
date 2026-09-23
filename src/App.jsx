import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import CampaignBanner from "@/components/CampaignBanner";
import CampaignHero from "@/components/CampaignHero";
import Features from "@/components/Features";
// import HiringSection from "@/components/HiringSection";
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
import SocialFollowPopup from "@/components/SocialFollowPopup";
import BirthdayDiscountBanner from "@/components/BirthdayDiscountBanner";
import SalaVipBanner from "@/components/SalaVipBanner";
import DomiciliosBanner from "@/components/DomiciliosBanner";
import ConcursoBanner from "@/components/ConcursoBanner";
import DrinkRecommender from "@/components/DrinkRecommender";
import CustomerTabBar, { tabBarSpacing } from "@/components/CustomerTabBar";
import { env } from "@/config/env";
import { campaignThemeClass, campaignBodyClass } from "@/config/campaign";

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
      <div className={`${campaignThemeClass} min-h-screen bg-dark overflow-clip ${tabBarSpacing}`}>
        <Header />
        <main className={campaignBodyClass}>
          <CampaignHero />
          <QuickNav />
          <CampaignBanner />
          {/* Anuncio de contratacion apagado el 2026-09-13. Se vuelve a
              encender descomentando esta linea y su import. */}
          {/* <HiringSection /> */}
          {/* Domicilios: aviso del nuevo servicio con las líneas de WhatsApp
              que reciben pedidos. Encabeza la carta para máxima visibilidad;
              abajo se repite como strip compacto. */}
          <DomiciliosBanner />
          {/* Concurso vigente (disfraces): solo existe si el staff lo publica */}
          <ConcursoBanner />
          {/* Ultimo bloque antes de la carta: por aqui pasa todo el que baja
              a verla. Estuvo despues de CartaList unas horas, pero esa
              seccion mide 4.400 px, asi que el descuento caia en el pixel
              7.500 y no lo veia nadie. */}
          <SocialDiscountBanner />
          <CartaList />
          {/* Secciones del menú renderizadas dinámicamente según categorías activas */}
          <MenuSections />
          <Desguayabator />
          <WaterSection />
          {/* Recordatorio compacto de domicilios al cierre de la carta */}
          <DomiciliosBanner variant="strip" />
          <DrinkRecommender />
          <BirthdayDiscountBanner />
          {/* Sala VIP (piso 3): promoción sin precios, el interesado pide
              información al personal o por WhatsApp */}
          <SalaVipBanner />
          <SolicitarMusica />
          <FeedbackSection />
          <Features />
          {/* <Gallery /> */}
          {/* <Contact /> */}
        </main>
        <Footer />
        {/* El pedido en línea vive en /domicilios (la carta es solo vitrina):
            allí se monta CartLayer con la barra de carrito. */}
        <ScrollToCarta />
        <CustomerTabBar />
        {/* Aparece pasado un rato, nunca al entrar */}
        <SocialFollowPopup />
        <Toaster />
      </div>
    </>
  );
}

export default App;
