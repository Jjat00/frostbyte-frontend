import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import SocialLink, { SOCIAL_ICON } from "@/components/SocialLink";
import { SOCIAL_HANDLE, SOCIAL_SOURCE } from "@/lib/social";

const InstagramIcon = SOCIAL_ICON.instagram;

/**
 * Invitación a seguir la cuenta, diferida.
 *
 * Deliberadamente NO aparece al entrar. Quien acaba de escanear el QR con sed
 * viene a mirar la carta, y un popup en ese momento se cierra por reflejo y
 * quema la primera impresión. Aparece cuando la visita ya lleva rato, que es
 * cuando la persona está cómoda y el gesto se lee como invitación y no como
 * peaje.
 *
 * El retardo bajó de 75 a 45 s el 2026-09-21: con los primeros nueve días
 * medidos, esta hoja trajo 10 clics a Instagram contra los 11 del hero
 * teniendo muchas menos oportunidades de salir, así que se le dan más
 * visitas sin tocar los frenos. Lo que no se toca es el principio: sigue
 * llegando después de que la persona ya estuvo leyendo, nunca al entrar.
 *
 * Tres frenos para que no se vuelva plaga:
 * - Una vez por sesión (sessionStorage).
 * - Nunca más de tres veces en el mismo dispositivo (localStorage).
 * - Nunca más si tocó el botón de seguir: a quien ya siguió no se le insiste.
 *
 * Es una hoja inferior, no un modal centrado: en el celular se descarta con
 * el pulgar y no tapa la carta entera. El velo no lleva `backdrop-filter`,
 * por las GPU de gama baja.
 *
 * El texto es el mínimo: petición, cuenta y botón. Una hoja que interrumpe
 * se gana el permiso siendo corta; explicar por qué seguir la cuenta pedía
 * leer un párrafo antes de poder cerrarla.
 */

const DELAY_MS = 45000;
const STORAGE_KEY = "frostbyte_social_popup";
const SESSION_KEY = "frostbyte_social_popup_session";
const MAX_VIEWS = 3;

// Cualquier acceso a storage puede reventar (modo privado, cookies
// bloqueadas). Si falla, el popup simplemente no aparece: nunca al revés.
const readState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { views: 0, done: false };
  } catch {
    return { views: 0, done: false };
  }
};

const writeState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sin persistencia el popup reaparecerá en la próxima visita. Aceptable.
  }
};

const SocialFollowPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const state = readState();
    if (state.done || state.views >= MAX_VIEWS) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      writeState({ ...state, views: state.views + 1 });
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Da igual: el tope de localStorage ya limita las apariciones.
      }
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const close = useCallback(() => setIsVisible(false), []);

  // Quien toca seguir no vuelve a verlo nunca.
  const handleFollow = () => {
    writeState({ ...readState(), done: true });
    close();
  };

  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isVisible, close]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-dark/70"
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-popup-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-[71] pb-[env(safe-area-inset-bottom)] sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-5 sm:pb-5"
          >
            <div className="fb-sheet relative mx-auto w-full rounded-t-2xl p-5 sm:max-w-sm sm:rounded-2xl sm:p-6">
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] text-light/50 transition-colors hover:border-white/25 hover:text-light"
              >
                <X size={16} />
              </button>

              <span className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/[0.1] bg-white/[0.04]">
                <InstagramIcon size={19} className="text-light/70" />
              </span>

              <h3
                id="social-popup-title"
                className="font-display m-0 mb-1.5 mt-4 text-xl font-semibold leading-snug tracking-[0.03em] text-light"
              >
                Síguenos en Instagram
              </h3>
              <p className="mb-6 text-[0.85rem] text-light/55">{SOCIAL_HANDLE}</p>

              <SocialLink
                network="instagram"
                source={SOCIAL_SOURCE.POPUP}
                onClick={handleFollow}
                className="fb-btn fb-btn--lg fb-btn--solid w-full"
              >
                <InstagramIcon size={17} />
                Seguir
              </SocialLink>

              <button
                type="button"
                onClick={close}
                className="mt-3 w-full text-center text-[0.7rem] text-light/35 transition-colors hover:text-light/60"
              >
                Ahora no
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SocialFollowPopup;
