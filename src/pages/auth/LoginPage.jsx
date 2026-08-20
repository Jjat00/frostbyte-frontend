import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir al home
    if (isAuthenticated) {
      navigate('/seleccionar-negocio');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Limpiar errores al montar
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.username, formData.password);
    if (result.success) {
      navigate('/seleccionar-negocio');
    }
  };

  return (
    <div className="fb-screen flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <img loading="lazy" decoding="async" src="/logo.png" alt="Frostbyte" className="h-14 w-14" />
          </motion.div>
          <h1 className="font-display text-[1.35rem] font-semibold tracking-[0.16em] text-light">FROSTBYTE</h1>
          <p className="fb-eyebrow mt-3">Acceso equipo</p>
        </div>

        {/* Login Card */}
        <div className="fb-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-red-500/25 p-3.5 text-red-300"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-[0.78rem]">{error}</span>
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="fb-eyebrow">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-light/30" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] pl-12 pr-4 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="fb-eyebrow">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-light/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] pl-12 pr-12 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-light/35 transition-colors hover:text-light"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="fb-btn fb-btn--accent w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </motion.button>
          </form>

          {/* Back to menu */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-[0.78rem] text-light/45 transition-colors hover:text-light"
            >
              ← Volver a la carta
            </a>
          </div>

          {/* Rescate: este formulario es solo del equipo. El cliente que llega
              aquí por error no tiene usuario ni contraseña que poner, y antes
              se quedaba sin salida. */}
          <div className="mt-5 border-t border-white/[0.07] pt-5 text-center">
            <p className="text-[0.78rem] text-light/50">
              ¿Eres cliente?{" "}
              <Link
                to="/mi-cuenta"
                className="text-light underline-offset-4 hover:underline"
              >
                Tu cuenta se crea con Google →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[0.7rem] text-light/30">
          © 2026 Frostbyte. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

