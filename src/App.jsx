import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import HeroMothersDay from "@/components/mothers-day/HeroMothersDay";
import FloatingPetals from "@/components/mothers-day/FloatingPetals";
import GrowingStem from "@/components/mothers-day/GrowingStem";
import RoseScrollAccent from "@/components/mothers-day/RoseScrollAccent";
import ScrollFelizDia from "@/components/mothers-day/ScrollFelizDia";
import FloralDivider from "@/components/mothers-day/FloralDivider";
import MothersDedicationsWall from "@/components/mothers-day/DedicationsWall";
import Features from "@/components/Features";
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
import DrinkRecommender from "@/components/DrinkRecommender";
import { env } from "@/config/env";

function App() {
  useEffect(() => {
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
        {/* Capas ambientales del Mes de la Madre */}
        <FloatingPetals />
        <ScrollFelizDia />
        <GrowingStem />
        <RoseScrollAccent />
        <main className="relative z-10">
          <HeroMothersDay />
          <FloralDivider variant={0} />
          <QuickNav />
          <CartaList />
          <FloralDivider variant={1} />
          {/* Secciones del menú renderizadas dinámicamente según categorías activas */}
          <MenuSections />
          <FloralDivider variant={2} />
          <Desguayabator />
          <WaterSection />
          <FloralDivider variant={3} />
          <DrinkRecommender />
          <SocialDiscountBanner />
          <BirthdayDiscountBanner />
          <MothersDedicationsWall />
          <FloralDivider variant={4} />
          <SolicitarMusica />
          <FeedbackSection />
          <Features />
        </main>
        <Footer />
        <ScrollToCarta />
        <Toaster />
      </div>
    </>
  );
}

export default App;
