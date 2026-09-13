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
 * Tres frenos para que no se vuelva plaga:
 * - Una vez por sesión (sessionStorage).
 * - Nunca más de tres veces en el mismo dispositivo (localStorage).
 * - Nunca más si tocó el botón de seguir: a quien ya siguió no se le insiste.
 *
 * Es una hoja inferior, no un modal centrado: en el celular se descarta con
 * el pulgar y no tapa la carta entera. El velo no lleva `backdrop-filter`,
 * por las GPU de gama baja.
 */

const DELAY_MS = 75000;
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
                className="font-display m-0 mb-2 mt-4 text-lg font-semibold leading-snug tracking-[0.04em] text-light"
              >
                Lo que sale nuevo, sale primero ahí
              </h3>
              <p className="mb-5 text-[0.8rem] leading-relaxed text-light/55">
                Bebidas nuevas, lo que suena esta noche y las promos del fin de
                semana en {SOCIAL_HANDLE}.
              </p>

              <SocialLink
                network="instagram"
                source={SOCIAL_SOURCE.POPUP}
                onClick={handleFollow}
                className="fb-btn fb-btn--accent w-full"
              >
                <InstagramIcon size={15} />
                Seguir en Instagram
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
