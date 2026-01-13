import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Granizados from "@/components/Granizados";
import Frappes from "@/components/Frappes";
import SodasMicheladas from "@/components/SodasMicheladas";
import Mocktails from "@/components/Mocktails";
import Shots from "@/components/Shots";
import Micheladas from "@/components/Micheladas";
import QuickNav from "@/components/QuickNav";
import Desguayabator from "@/components/Desguayabator";
import ScrollToMenu from "@/components/ScrollToMenu";
import Vinos from "@/components/Vinos";
import Cervezas from "@/components/Cervezas";
import Cuates from "@/components/Cuates";
import SolicitarCancion from "@/components/SolicitarCancion";
import { env } from "@/config/env";

function TablePage() {
  const { tableNumber } = useParams();

  useEffect(() => {
    if (tableNumber) {
      // Registrar visita a la mesa o barra
      const apiUrl = env.API_BASE_URL;

      // Si es "barra", usar table_number: 0, sino usar el número de la mesa
      const tableNum =
        tableNumber.toLowerCase() === "barra" ? 0 : parseInt(tableNumber);

      fetch(`${apiUrl}/tables/register-visit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_number: tableNum,
        }),
      }).catch((error) => {
        console.error("Error al registrar visita:", error);
      });
    }
  }, [tableNumber]);

  const displayName =
    tableNumber?.toLowerCase() === "barra" ? "Barra" : `Mesa ${tableNumber}`;

  return (
    <>
      <Helmet>
        <title>Frostbyte - {displayName}</title>
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
        </main>
        <Footer />
        <ScrollToMenu />
        <Toaster />
      </div>
    </>
  );
}

export default TablePage;
