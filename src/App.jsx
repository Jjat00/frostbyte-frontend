import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import CelebrationCardBanner from "@/components/CelebrationCardBanner";
import AmorAmistadHero from "@/components/AmorAmistadHero";
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
import DrinkRecommender from "@/components/DrinkRecommender";
import CustomerTabBar, { tabBarSpacing } from "@/components/CustomerTabBar";
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
      <div className={`theme-amor-amistad min-h-screen bg-dark overflow-hidden ${tabBarSpacing}`}>
        <Header />
        <main className="aa-menu-body">
          <AmorAmistadHero />
          <QuickNav />
          <CelebrationCardBanner />
          {/* Domicilios: aviso del nuevo servicio con las líneas de WhatsApp
              que reciben pedidos. Encabeza la carta para máxima visibilidad;
              abajo se repite como strip compacto. */}
          <DomiciliosBanner />
          <CartaList />
          {/* Secciones del menú renderizadas dinámicamente según categorías activas */}
          <MenuSections />
          <Desguayabator />
          <WaterSection />
          {/* Recordatorio compacto de domicilios al cierre de la carta */}
          <DomiciliosBanner variant="strip" />
          <DrinkRecommender />
          <SocialDiscountBanner />
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
        <Toaster />
      </div>
    </>
  );
}

export default App;
