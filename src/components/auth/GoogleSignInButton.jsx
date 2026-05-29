import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { AlertTriangle, Loader2 } from "lucide-react";
import { env } from "@/config";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";

/**
 * Botón de "Iniciar sesión con Google" para clientes.
 *
 * Usa Google Identity Services (componente oficial <GoogleLogin>), que
 * devuelve un `credential` (id_token). Ese token se envía al backend, que
 * lo verifica y emite el JWT de la sesión de cliente.
 *
 * Props:
 *  - onSuccess(user): callback tras autenticar correctamente.
 *  - onError(message): callback ante un fallo.
 */
const GoogleSignInButton = ({ onSuccess, onError }) => {
  const loginWithGoogle = useCustomerAuthStore((s) => s.loginWithGoogle);
  const [submitting, setSubmitting] = useState(false);

  // Sin Client ID configurado el botón de Google no puede funcionar.
  if (!env.GOOGLE_CLIENT_ID) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-left text-sm text-amber-200">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <span>
          El inicio de sesión con Google aún no está configurado. Falta definir
          <code className="mx-1 rounded bg-black/30 px-1">VITE_GOOGLE_CLIENT_ID</code>.
        </span>
      </div>
    );
  }

  const handleCredential = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      onError?.("No recibimos las credenciales de Google.");
      return;
    }
    setSubmitting(true);
    const result = await loginWithGoogle(credential);
    setSubmitting(false);
    if (result.success) {
      onSuccess?.(result.user);
    } else {
      onError?.(result.error);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex justify-center [color-scheme:light]">
        <GoogleLogin
          onSuccess={handleCredential}
          onError={() => onError?.("No se pudo iniciar sesión con Google.")}
          theme="filled_black"
          shape="pill"
          size="large"
          text="continue_with"
          locale="es"
          width="280"
        />
      </div>

      {submitting && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-dark/70 text-sm text-light backdrop-blur-sm">
          <Loader2 size={16} className="animate-spin" />
          Iniciando sesión…
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
