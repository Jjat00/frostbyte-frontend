import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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
import FrostbytePlay from "@/components/FrostbytePlay";
import SocialDiscountBanner from "@/components/SocialDiscountBanner";
import BirthdayDiscountBanner from "@/components/BirthdayDiscountBanner";
import SalaVipBanner from "@/components/SalaVipBanner";
import DomiciliosBanner from "@/components/DomiciliosBanner";
import PartidoColombiaBanner from "@/components/PartidoColombiaBanner";
import PollaMundialBanner from "@/components/PollaMundialBanner";
import DrinkRecommender from "@/components/DrinkRecommender";
import AccessCodeBanner from "@/components/order-tracker/AccessCodeBanner";
import OrderMiniBar from "@/components/order-tracker/OrderMiniBar";
import OrderTracker from "@/components/order-tracker/OrderTracker";
import OrderReadyAlert from "@/components/order-tracker/OrderReadyAlert";
import { publicOrdersService } from "@/services/publicOrders.service";
import { env } from "@/config/env";

function TablePage() {
  const { tableNumber, floor: floorParam } = useParams();
  const [showTracker, setShowTracker] = useState(false);
  const [showReadyAlert, setShowReadyAlert] = useState(false);
  const prevStatusRef = useRef(null);

  // El QR nuevo trae el piso en la ruta (/mesa/:floor/:tableNumber). El QR
  // legacy (/mesa/:tableNumber) no lo trae → asumimos piso 2 (stickers actuales).
  const floor = Number.isNaN(parseInt(floorParam, 10)) ? 2 : parseInt(floorParam, 10);

  // Parse table number
  const tableNum =
    tableNumber?.toLowerCase() === "barra" ? 0 : parseInt(tableNumber);

  // Restore verified order from sessionStorage
  const getStoredCode = () => sessionStorage.getItem("frostbyte_order_code");
  const [verifiedCode, setVerifiedCode] = useState(getStoredCode);

  // Poll order data if verified
  const {
    data: order,
    isError,
  } = useQuery({
    queryKey: ["public-order", verifiedCode],
    queryFn: () => publicOrdersService.verifyOrder(verifiedCode),
    enabled: !!verifiedCode,
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 1,
  });

  // Detect status change to "ready"
  useEffect(() => {
    if (order?.status === "ready" && prevStatusRef.current && prevStatusRef.current !== "ready") {
      setShowReadyAlert(true);
    }
    if (order?.status) {
      prevStatusRef.current = order.status;
    }
  }, [order?.status]);

  // Clear verified code on error (invalid code)
  useEffect(() => {
    if (isError && verifiedCode) {
      sessionStorage.removeItem("frostbyte_order_code");
      setVerifiedCode(null);
    }
  }, [isError, verifiedCode]);

  const handleVerified = useCallback((orderData, code) => {
    sessionStorage.setItem("frostbyte_order_code", code);
    setVerifiedCode(code);
    prevStatusRef.current = orderData.status;
  }, []);

  useEffect(() => {
    if (tableNumber) {
      const apiUrl = env.API_BASE_URL;
      const tableNum =
        tableNumber.toLowerCase() === "barra" ? 0 : parseInt(tableNumber);

      fetch(`${apiUrl}/tables/register-visit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_number: tableNum,
          floor,
        }),
      }).catch((error) => {
        console.error("Error al registrar visita:", error);
      });
    }
  }, [tableNumber, floor]);

  const tableLabel =
    tableNumber?.toLowerCase() === "barra" ? "Barra" : `Mesa ${tableNumber}`;
  const displayName = `${tableLabel} · Piso ${floor}`;

  return (
    <>
      <Helmet>
        <title>Frostbyte - {displayName}</title>
        <meta
          name="description"
          content="Experimenta el futuro de las bebidas heladas. Frostbyte ofrece granizados y frappés premium con sabores únicos. Sabores vibrantes, experiencia única."
        />
      </Helmet>
      <div className="min-h-screen bg-dark overflow-hidden">
        <Header />
        <main>
          <Hero />

          {/* Order Tracker: MiniBar si ya verificado, o banner de código */}
          {order ? (
            <div className="container mx-auto px-4 py-3">
              <OrderMiniBar
                order={order}
                onClick={() => setShowTracker(true)}
              />
            </div>
          ) : (
            <AccessCodeBanner
              onVerified={handleVerified}
            />
          )}

          {/* Promo del partido de Colombia (granizado gratis por marcador
              exacto). Solo aparece si hay partido en vivo o próximo. */}
          <PartidoColombiaBanner />

          <QuickNav />
          {/* Anuncio de la Polla Mundialista — igual que en la carta pública,
              presente varias veces con distintas variantes. */}
          <PollaMundialBanner variant="feature" />
          <CartaList />
          {/* Secciones del menú renderizadas dinámicamente según categorías activas */}
          <MenuSections />
          <Desguayabator />
          <WaterSection />
          {/* Domicilios: aviso del nuevo servicio con las líneas de WhatsApp
              que reciben pedidos (para el próximo antojo desde la casa). */}
          <DomiciliosBanner />
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
          <FrostbytePlay />
          <Features />
        </main>
        <Footer />
        <ScrollToCarta />
        <Toaster />

        {/* Order Tracker Panel */}
        <OrderTracker
          order={order}
          show={showTracker}
          onClose={() => setShowTracker(false)}
        />

        {/* Ready Alert */}
        <OrderReadyAlert
          show={showReadyAlert}
          onClose={() => setShowReadyAlert(false)}
        />
      </div>
    </>
  );
}

export default TablePage;
