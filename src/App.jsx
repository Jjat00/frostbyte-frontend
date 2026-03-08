import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
// import Gallery from "@/components/Gallery";
// import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import QuickNav from "@/components/QuickNav";
import MenuSections from "@/components/MenuSections";
import Desguayabator from "@/components/Desguayabator";
import ScrollToCarta from "@/components/ScrollToMenu";
import SolicitarCancion from "@/components/SolicitarCancion";
import FeedbackSection from "@/components/FeedbackSection";
import SocialDiscountBanner from "@/components/SocialDiscountBanner";
import BirthdayDiscountBanner from "@/components/BirthdayDiscountBanner";
import DrinkRecommender from "@/components/DrinkRecommender";
import { env } from "@/config/env";

// 8M - Dia Internacional de la Mujer
import Hero8M from "@/components/womens-day/Hero8M";
import FloatingPetals from "@/components/womens-day/FloatingPetals";
import GrowingStem from "@/components/womens-day/GrowingStem";
import RoseScrollAccent from "@/components/womens-day/RoseScrollAccent";
import FloralDivider from "@/components/womens-day/FloralDivider";
import ScrollFelizDia from "@/components/womens-day/ScrollFelizDia";

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
          <Hero8M />
          <QuickNav />
          <FloralDivider variant={0} />
          {/* Secciones del menú renderizadas dinámicamente según categorías activas */}
          <MenuSections />
          <FloralDivider variant={1} />
          <Desguayabator />
          <FloralDivider variant={2} />
          <DrinkRecommender />
          <SocialDiscountBanner />
          <BirthdayDiscountBanner />
          <FloralDivider variant={3} />
          <SolicitarCancion />
          <FeedbackSection />
          <Features />
          {/* <Gallery /> */}
          {/* <Contact /> */}
        </main>
        <Footer />
        <ScrollToCarta />
        <Toaster />
        {/* 8M overlays */}
        <FloatingPetals />
        <GrowingStem />
        <RoseScrollAccent />
        <ScrollFelizDia />
      </div>
    </>
  );
}

export default App;
