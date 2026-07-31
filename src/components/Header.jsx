import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  LogIn,
  ClipboardList,
  Bike,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import CustomerAvatar from "@/components/auth/CustomerAvatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useActiveCategories, useStoreConfig } from "@/hooks";
import StoreStatusBadge from "@/components/StoreStatusBadge";

const ListItem = React.forwardRef(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none text-light">
              {title}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-gray">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";

/**
 * Configuración de secciones de bebidas para el menú mobile/desktop.
 * categorySlug: slug de la categoría en BD (null = siempre visible)
 */
const BEVERAGE_SECTIONS = [
  { key: "desguayabator", label: "🩹 Desguayabator", href: "#desguayabator", categorySlug: null, className: "text-emerald-400 hover:text-emerald-300" },
  { key: "agua", label: "💧 Agua", href: "#agua", categorySlug: null, className: "text-cyan-400 hover:text-cyan-300" },
  { key: "granizados", label: "Granizados", href: "#granizados", categorySlug: "granizados" },
  { key: "frappes", label: "Frappes", href: "#frappes", categorySlug: "frappes" },
  { key: "sodas", label: "Sodas Italianas", href: "#sodas", categorySlug: "sodas-italianas" },
  { key: "micheladas", label: "Micheladas", href: "#micheladas", categorySlug: "micheladas" },
  { key: "cervezas", label: "🍺 Cervezas", href: "#cervezas", categorySlug: "cervezas" },
  { key: "cuates", label: "🍹 Cuates", href: "#cuates", categorySlug: "cuates" },
  { key: "luladas", label: "🍋 Luladas", href: "#luladas", categorySlug: "luladas", className: "text-lime-400 hover:text-lime-300" },
  { key: "mocktails", label: "Cocteles", href: "#mocktails", categorySlug: "mocktails" },
  { key: "shots", label: "Shots", href: "#shots", categorySlug: "shots" },
  { key: "vinos", label: "🍷 Vinos", href: "#vinos", categorySlug: "vinos" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: categoriesData } = useActiveCategories();
  const isCustomerAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const customer = useCustomerAuthStore((s) => s.customer);
  const { data: storeConfig } = useStoreConfig();
  // Sin domicilios en linea activos no hay pedidos de cliente que mostrar
  const inAppOrdering = !!storeConfig?.customer_ordering_enabled;
  const showMyOrders = isCustomerAuthenticated && inAppOrdering;

  // Detectar si estamos en una ruta de mesa
  const isTableRoute = location.pathname.startsWith('/mesa/');

  // Obtener los slugs de categorías activas
  const activeCategorySlugs = useMemo(() => {
    if (!categoriesData?.results) return new Set();
    return new Set(
      categoriesData.results
        .filter((cat) => cat.is_active)
        .map((cat) => cat.slug)
    );
  }, [categoriesData]);

  // Filtrar secciones de bebidas según categorías activas
  const visibleBeverages = useMemo(() => {
    return BEVERAGE_SECTIONS.filter((section) => {
      if (!section.categorySlug) return true;
      return activeCategorySlugs.has(section.categorySlug);
    });
  }, [activeCategorySlugs]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const productLinks = [
    { title: "🩹 Desguayabator", href: "#desguayabator", description: "Bebida helada para curar guayabos. Electrolit + Bonfiest.", categorySlug: null },
    { title: "💧 Agua", href: "#agua", description: "Agua pura y refrescante para hidratarte.", categorySlug: null },
    { title: "Granizados", href: "#granizados", description: "Mango, Maracumango, Lulo y más.", categorySlug: "granizados" },
    { title: "Frappés", href: "#frappes", description: "Café, Oreo, Fresa, Brownie.", categorySlug: "frappes" },
    { title: "Sodas Italianas", href: "#sodas", description: "Refrescantes sodas de Fresa y Maracuyá.", categorySlug: "sodas-italianas" },
    { title: "Micheladas", href: "#micheladas", description: "Poker, Budweiser y Corona con nuestra mezcla secreta.", categorySlug: "micheladas" },
    { title: "🍺 Cervezas", href: "#cervezas", description: "Poker, Budweiser, Corona y Coronita bien frías.", categorySlug: "cervezas" },
    { title: "🍹 Cuates", href: "#cuates", description: "Cócteles con tequila mexicano. Limón, Fresa y Mango.", categorySlug: "cuates" },
    { title: "🍋 Luladas", href: "#luladas", description: "Refrescantes luladas preparadas con lulo natural.", categorySlug: "luladas" },
    { title: "Cócteles", href: "#mocktails", description: "Mojitos, Margaritas, Moscow Mule y más.", categorySlug: "mocktails" },
    { title: "Shots", href: "#shots", description: "Ginebra, Vodka, Whisky, Tequila y Ron.", categorySlug: "shots" },
    { title: "🍷 Vinos", href: "#vinos", description: "Copas de Gato Negro y Casillero del Diablo.", categorySlug: "vinos" },
    { title: "✨ Recomendador", href: "#que-te-provoca", description: "Deja que te recomendemos la bebida perfecta.", categorySlug: null },
    { title: "📱 Descuento Redes", href: "#descuento-redes", description: "Siguenos en redes y obtendras un descuento.", categorySlug: null },
    { title: "🎂 Descuento Cumple", href: "#descuento-cumple", description: "Si es tu cumple, tendras un descuento especial.", categorySlug: null },
    { title: "🎵 Pedir Cancion", href: "#solicitar-cancion", description: "Pide tu cancion favorita y la ponemos para ti.", categorySlug: null },
    { title: "💬 Tu Opinion", href: "#feedback", description: "Dejanos tu feedback, sugerencias o comentarios.", categorySlug: null },
  ];

  // Filtrar productLinks del desktop según categorías activas
  const visibleProductLinks = useMemo(() => {
    return productLinks.filter((link) => {
      if (!link.categorySlug) return true;
      return activeCategorySlugs.has(link.categorySlug);
    });
  }, [activeCategorySlugs]);

  const navItems = [
    {
      name: "Ubicación",
      href: "https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu",
      external: true,
    },
    { name: "WhatsApp", href: "https://wa.me/573164277879", external: true },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "liquid-glass backdrop-blur-xl bg-white/[0.08] border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <img
              src="/logo.png"
              alt="Frostbyte - Granizados y Cocteles en Cumbal"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold text-light tracking-wider">
              FROSTBYTE
            </span>
          </motion.a>

          {/* Estado del local: visible en la carta (/) y en la vista de mesa (/mesa/*) */}
          <StoreStatusBadge isOpen={storeConfig?.is_open} className="mr-auto ml-3" />

          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide">
                    Productos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="liquid-glass grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] backdrop-blur-xl bg-dark/90 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
                      {visibleProductLinks.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Domicilios: entrada directa a la tienda de pedidos */}
                {inAppOrdering && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/domicilios"
                        className={`${navigationMenuTriggerStyle()} bg-transparent text-emerald-400 hover:text-emerald-300 focus:text-emerald-300 font-bold tracking-wide flex items-center gap-1.5`}
                      >
                        <Bike className="w-4 h-4" />
                        Domicilios
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {/* Frostbyte Play - Solo mostrar en rutas de mesa */}
                {isTableRoute && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/game"
                        className={`${navigationMenuTriggerStyle()} bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide`}
                      >
                        🎮 Frostbyte Play
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.external ? (
                      <NavigationMenuLink
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${navigationMenuTriggerStyle()} bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide`}
                      >
                        {item.name}
                      </NavigationMenuLink>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className={`${navigationMenuTriggerStyle()} bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide`}
                        >
                          {item.name}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/polla-mundial"
                      className={`${navigationMenuTriggerStyle()} bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide`}
                    >
                      Polla Mundialista
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {showMyOrders && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={`${navigationMenuTriggerStyle()} bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide`}
                    >
                      <Link to="/mis-pedidos" className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Mis pedidos
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
                {isCustomerAuthenticated ? (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/mi-cuenta"
                        aria-label="Mi cuenta"
                        className="ml-1 grid place-items-center rounded-full ring-2 ring-gold/40 hover:ring-gold transition-all"
                      >
                        <CustomerAvatar
                          customer={customer}
                          className="w-8 h-8 text-sm"
                        />
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={`${navigationMenuTriggerStyle()} bg-transparent text-gold hover:text-gold/80 focus:text-gold/80 font-medium tracking-wide`}
                    >
                      <Link to="/mi-cuenta" className="flex items-center gap-2">
                        <UserCircle2 className="w-4 h-4" />
                        Entrar
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={`${navigationMenuTriggerStyle()} bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide`}
                  >
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Button
              onClick={() =>
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="ml-6 backdrop-blur-sm bg-gradient-to-r from-primary/90 to-secondary/90 text-dark font-bold hover:shadow-[0_0_25px_color-mix(in_srgb,var(--color-primary)_40%,transparent)] transition-all duration-300"
            >
              Ver Carta
            </Button>
          </div>

          <button
            className="md:hidden text-light"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="liquid-glass md:hidden mt-4 pb-6 pt-4 px-4 space-y-4 backdrop-blur-xl bg-white/[0.08] rounded-2xl border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <Link
              to="/polla-mundial"
              className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🏆 Polla Mundialista
            </Link>
            {inAppOrdering && (
              <Link
                to="/domicilios"
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-dark font-bold text-center shadow-[0_0_20px_rgba(52,211,153,0.25)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Bike className="w-5 h-5" />
                Pedir a Domicilio
              </Link>
            )}
            <a
              href="#carta"
              className="block text-primary hover:text-primary/80 transition-colors duration-300 font-bold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Carta Completa
            </a>
            <div className="border-t border-white/[0.08] pt-3 space-y-4">
              <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold">Bebidas</p>
              {visibleBeverages.map((section) => (
                <a
                  key={section.key}
                  href={section.href}
                  className={`block ${section.className || "text-gray hover:text-primary"} transition-colors duration-300 font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {section.label}
                </a>
              ))}
            </div>
            <div className="border-t border-white/[0.08] pt-3 space-y-4">
              <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold">Mas en Frostbyte</p>
              <a
                href="#que-te-provoca"
                className="block text-violet-400 hover:text-violet-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ✨ Recomendador de Bebidas
              </a>
              <a
                href="#descuento-redes"
                className="block text-pink-400 hover:text-pink-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📱 Descuento por Redes
              </a>
              <a
                href="#descuento-cumple"
                className="block text-amber-400 hover:text-amber-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎂 Descuento de Cumple
              </a>
              <a
                href="#solicitar-cancion"
                className="block text-green-400 hover:text-green-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎵 Pedir Cancion
              </a>
              <a
                href="#feedback"
                className="block text-teal-400 hover:text-teal-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                💬 Tu Opinion
              </a>
            </div>
            <div className="border-t border-white/[0.08] pt-4 space-y-4">
              {/* Frostbyte Play - Solo mostrar en rutas de mesa */}
              {isTableRoute && (
                <Link
                  to="/game"
                  className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🎮 Frostbyte Play
                </Link>
              )}
              {showMyOrders && (
                <Link
                  to="/mis-pedidos"
                  className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ClipboardList className="w-4 h-4" />
                  Mis pedidos
                </Link>
              )}
              {isCustomerAuthenticated ? (
                <Link
                  to="/mi-cuenta"
                  className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CustomerAvatar
                    customer={customer}
                    className="w-6 h-6 text-xs"
                  />
                  Mi cuenta
                </Link>
              ) : (
                <Link
                  to="/mi-cuenta"
                  className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserCircle2 className="w-4 h-4" />
                  Entrar
                </Link>
              )}
              <Link
                to="/login"
                className="flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <a
                href="https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📍 Ubicación
              </a>
              <a
                href="https://wa.me/573164277879"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-green-400 hover:text-green-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                💬 WhatsApp
              </a>
            </div>
            <Button
              onClick={() => {
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" });
                setIsMobileMenuOpen(false);
              }}
              className="w-full backdrop-blur-sm bg-gradient-to-r from-primary/90 to-secondary/90 text-dark font-bold shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
            >
              Ver Carta
            </Button>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
