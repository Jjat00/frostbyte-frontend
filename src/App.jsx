import React from "react";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Granizados from "@/components/Granizados";
import Frappes from "@/components/Frappes";
import SodasMicheladas from "@/components/SodasMicheladas";
import Mocktails from "@/components/Mocktails";

function App() {
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
          <Granizados />
          <Frappes />
          <SodasMicheladas />
          <Mocktails />
          <Features />
          <Gallery />
          <Contact />
        </main>
        <Footer />
        <Toaster />
      </div>
    </>
  );
}

export default App;
