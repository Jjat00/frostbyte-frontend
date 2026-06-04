/**
 * Utilidades del código de invitación de la Polla (referidos).
 *
 * El "enlace de invitación" es la URL de la Polla con `?ref=CODIGO`. Cuando un
 * amigo lo abre, capturamos el código y lo guardamos en localStorage para
 * aplicarlo justo después de que inicie sesión con Google (ver
 * useCustomerAuthStore.loginWithGoogle).
 *
 * IMPORTANTE: la captura se ejecuta en main.jsx al arranque, ANTES de montar el
 * router. Si esperáramos a un componente, el <Navigate> de la landing (que
 * redirige a /partidos a los usuarios ya logueados) descartaría el `?ref=`.
 */
const REF_STORAGE_KEY = "frostbyte_polla_ref";
// El backend usa códigos de 6 chars del alfabeto A-Z2-9 (sin 0/O/1/I/L). Acá
// solo validamos forma básica para no guardar basura.
const REF_PATTERN = /^[A-Z0-9]{4,8}$/;

/**
 * Lee `?ref=` de la URL actual, lo guarda y limpia el parámetro de la barra de
 * direcciones (cosmético: evita recapturas y que se comparta un ref ajeno).
 */
export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("ref");
    if (!raw) return;

    const code = raw.trim().toUpperCase();
    if (REF_PATTERN.test(code)) {
      localStorage.setItem(REF_STORAGE_KEY, code);
    }

    // Quitar ?ref= de la URL sin recargar.
    params.delete("ref");
    const qs = params.toString();
    const newUrl =
      window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState({}, "", newUrl);
  } catch {
    // Entornos sin localStorage/history: ignorar silenciosamente.
  }
}

/** Devuelve el código de invitación guardado (o null) y lo borra. */
export function consumeStoredReferral() {
  if (typeof window === "undefined") return null;
  try {
    const code = localStorage.getItem(REF_STORAGE_KEY);
    if (code) localStorage.removeItem(REF_STORAGE_KEY);
    return code || null;
  } catch {
    return null;
  }
}

/** Construye el enlace de invitación a partir de un código. */
export function buildReferralLink(code) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/polla-mundial?ref=${code}`;
}
