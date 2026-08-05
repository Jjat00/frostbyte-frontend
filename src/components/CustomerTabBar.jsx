import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bike, UserCircle2, UtensilsCrossed } from "lucide-react";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { useMyOrders, useStoreConfig } from "@/hooks";
import { isActiveOrder } from "@/lib/domicilios";

/**
 * Barra inferior de navegación del cliente (solo móvil).
 *
 * Tres destinos fijos — Carta · Domicilios · Mi cuenta — con los mismos
 * nombres que ya usan las rutas y el header. Existe porque el acceso a la
 * cuenta y a la tienda vivían al final del menú hamburguesa: nadie los
 * encontraba.
 *
 * Decisiones que conviene no deshacer sin querer:
 * - "Mi cuenta" se llama igual con y sin sesión: una pestaña que cambia de
 *   nombre desorienta; es la pantalla la que explica qué hay detrás.
 * - "Mis pedidos" NO tiene pestaña propia (es vista hija de la cuenta), pero
 *   el pedido en curso se anuncia como punto verde sobre "Mi cuenta". Sin eso
 *   el seguimiento en vivo volvería a ser invisible.
 * - Fondo casi sólido, sin blur: la carta ya castiga las GPU de gama baja.
 *
 * Se monta explícitamente en las pantallas públicas de cliente (carta,
 * domicilios, cuenta, pedidos, reservas). Nunca en rutas de staff.
 */

// Hueco que deben dejar al fondo las páginas que la montan para que su último
// contenido no quede tapado (alto de la barra + un respiro).
export const tabBarSpacing = "pb-[calc(4.5rem+env(safe-area-inset-bottom))]";

const CustomerTabBar = () => {
  const location = useLocation();
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const { data: storeConfig } = useStoreConfig();
  const inAppOrdering = !!storeConfig?.customer_ordering_enabled;

  // El punto de aviso solo interesa a quien tiene sesión y puede pedir.
  // Refresco lento: la pantalla del pedido tiene su propio WebSocket en vivo.
  const { data: ordersData } = useMyOrders({
    enabled: isAuthenticated && inAppOrdering,
    refetchInterval: 60 * 1000,
  });
  const hasActiveOrder = (ordersData?.results || []).some(isActiveOrder);

  const { pathname } = location;
  const tabs = useMemo(
    () =>
      [
        {
          to: "/",
          label: "Carta",
          icon: UtensilsCrossed,
          active: pathname === "/",
          activeClass: "text-primary",
        },
        inAppOrdering && {
          to: "/domicilios",
          label: "Domicilios",
          icon: Bike,
          active: pathname.startsWith("/domicilios"),
          activeClass: "text-emerald-400",
        },
        {
          to: "/mi-cuenta",
          label: "Mi cuenta",
          icon: UserCircle2,
          // Las vistas hijas de la cuenta mantienen la pestaña encendida
          active: ["/mi-cuenta", "/mis-pedidos", "/mis-reservas"].some((p) =>
            pathname.startsWith(p)
          ),
          activeClass: "text-gold",
          dot: hasActiveOrder,
        },
      ].filter(Boolean),
    [pathname, inAppOrdering, hasActiveOrder]
  );

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-dark/95 border-t border-white/[0.1] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch">
        {tabs.map(({ to, label, icon: Icon, active, activeClass, dot }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              aria-current={active ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-1 transition-colors ${
                active ? activeClass : "text-white/45 hover:text-white/70"
              }`}
            >
              <span className="relative">
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 2} />
                {dot && (
                  <span
                    aria-hidden
                    className="absolute -top-0.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-dark"
                  />
                )}
              </span>
              <span className="text-[11px] font-bold tracking-wide leading-none">
                {label}
              </span>
              {dot && <span className="sr-only">(tienes un pedido en curso)</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CustomerTabBar;
