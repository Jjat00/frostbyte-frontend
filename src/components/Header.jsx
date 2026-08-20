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

/**
 * Estilo de los enlaces del nav de escritorio.
 *
 * El padding es compacto y solo se ensancha en pantallas muy anchas: con la
 * marca, el estado del local, los seis enlaces y el botón de la carta, la fila
 * llegaba a desbordarse por la derecha (el avatar y "Ver Carta" quedaban fuera
 * de pantalla) antes de los 1500 px.
 */
const navLinkCls = (extra = "") =>
  cn(
    navigationMenuTriggerStyle(),
    "bg-transparent px-2.5 2xl:px-4 font-medium tracking-wide whitespace-nowrap",
    extra
  );

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
  { key: "desguayabator", label: "Desguayabator", href: "#desguayabator", categorySlug: null },
  { key: "agua", label: "Agua", href: "#agua", categorySlug: null },
  { key: "granizados", label: "Granizados", href: "#granizados", categorySlug: "granizados" },
  { key: "frappes", label: "Frappes", href: "#frappes", categorySlug: "frappes" },
  { key: "sodas", label: "Sodas Italianas", href: "#sodas", categorySlug: "sodas-italianas" },
  { key: "micheladas", label: "Micheladas", href: "#micheladas", categorySlug: "micheladas" },
  { key: "cervezas", label: "Cervezas", href: "#cervezas", categorySlug: "cervezas" },
  { key: "cuates", label: "Cuates", href: "#cuates", categorySlug: "cuates" },
  { key: "luladas", label: "Luladas", href: "#luladas", categorySlug: "luladas" },
  { key: "mocktails", label: "Cocteles", href: "#mocktails", categorySlug: "mocktails" },
  { key: "shots", label: "Shots", href: "#shots", categorySlug: "shots" },
  { key: "vinos", label: "Vinos", href: "#vinos", categorySlug: "vinos" },
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
    { title: "Desguayabator", href: "#desguayabator", description: "Bebida helada para curar guayabos. Electrolit + Bonfiest.", categorySlug: null },
    { title: "Agua", href: "#agua", description: "Agua pura y refrescante para hidratarte.", categorySlug: null },
    { title: "Granizados", href: "#granizados", description: "Mango, Maracumango, Lulo y más.", categorySlug: "granizados" },
    { title: "Frappés", href: "#frappes", description: "Café, Oreo, Fresa, Brownie.", categorySlug: "frappes" },
    { title: "Sodas Italianas", href: "#sodas", description: "Refrescantes sodas de Fresa y Maracuyá.", categorySlug: "sodas-italianas" },
    { title: "Micheladas", href: "#micheladas", description: "Poker, Budweiser y Corona con nuestra mezcla secreta.", categorySlug: "micheladas" },
    { title: "Cervezas", href: "#cervezas", description: "Poker, Budweiser, Corona y Coronita bien frías.", categorySlug: "cervezas" },
    { title: "Cuates", href: "#cuates", description: "Cócteles con tequila mexicano. Limón, Fresa y Mango.", categorySlug: "cuates" },
    { title: "Luladas", href: "#luladas", description: "Refrescantes luladas preparadas con lulo natural.", categorySlug: "luladas" },
    { title: "Cócteles", href: "#mocktails", description: "Mojitos, Margaritas, Moscow Mule y más.", categorySlug: "mocktails" },
    { title: "Shots", href: "#shots", description: "Ginebra, Vodka, Whisky, Tequila y Ron.", categorySlug: "shots" },
    { title: "Vinos", href: "#vinos", description: "Copas de Gato Negro y Casillero del Diablo.", categorySlug: "vinos" },
    { title: "Recomendador", href: "#que-te-provoca", description: "Deja que te recomendemos la bebida perfecta.", categorySlug: null },
    { title: "Descuento Redes", href: "#descuento-redes", description: "Siguenos en redes y obtendras un descuento.", categorySlug: null },
    { title: "Descuento Cumple", href: "#descuento-cumple", description: "Si es tu cumple, tendras un descuento especial.", categorySlug: null },
    { title: "Pedir Cancion", href: "#solicitar-cancion", description: "Pide tu cancion favorita y la ponemos para ti.", categorySlug: null },
    { title: "Tu Opinion", href: "#feedback", description: "Dejanos tu feedback, sugerencias o comentarios.", categorySlug: null },
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
          ? "bg-dark/92 border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 flex-shrink-0"
          >
            <img
              src="/logo.png"
              alt="Frostbyte - Granizados y Cocteles en Cumbal"
              width={40}
              height={40}
              className="w-9 h-9 md:w-10 md:h-10 object-contain"
            />
            {/* En móvil comparte fila con el estado del local y el avatar */}
            <span className="text-xl 2xl:text-2xl font-bold text-light tracking-wider whitespace-nowrap">
              FROSTBYTE
            </span>
          </motion.a>

          {/* Estado del local: visible en la carta (/) y en la vista de mesa (/mesa/*) */}
          <StoreStatusBadge
            isOpen={storeConfig?.is_open}
            className="mr-auto ml-3 flex-shrink-0"
          />

          {/* El nav entero (seis enlaces + cuenta + botón) no cabe por debajo
              de 1280 px: hasta ahí manda el menú de hamburguesa, que lleva lo
              mismo y ya muestra el avatar de quien tiene sesión. */}
          <div className="hidden xl:flex items-center min-w-0">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent px-2.5 2xl:px-4 text-gray hover:text-primary focus:text-primary font-medium tracking-wide">
                    Productos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 rounded-xl border border-white/[0.08] bg-dark/95 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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
                        className={navLinkCls(
                          "text-emerald-400 hover:text-emerald-300 focus:text-emerald-300 font-bold flex items-center gap-1.5"
                        )}
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
                        className={navLinkCls(
                          "text-gray hover:text-primary focus:text-primary"
                        )}
                      >
                        Frostbyte Play
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
                        className={navLinkCls(
                          "text-gray hover:text-primary focus:text-primary"
                        )}
                      >
                        {item.name}
                      </NavigationMenuLink>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className={navLinkCls(
                            "text-gray hover:text-primary focus:text-primary"
                          )}
                        >
                          {item.name}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
                {showMyOrders && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navLinkCls(
                        "text-gray hover:text-primary focus:text-primary"
                      )}
                    >
                      <Link to="/mis-pedidos" className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Mis pedidos
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
                {/* Acceso del staff: sigue en el header porque el equipo entra
                    cada turno, pero apagado y con el nombre de a quién sirve.
                    Lo que confundía no era su presencia sino la etiqueta
                    "Login" junto a "Entrar": dos sinónimos, ningún dueño. */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={navLinkCls(
                      "text-white/35 hover:text-primary focus:text-primary text-xs"
                    )}
                  >
                    <Link
                      to="/login"
                      aria-label="Acceso equipo"
                      className="flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span className="hidden 2xl:inline">Acceso equipo</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {isCustomerAuthenticated ? (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/mi-cuenta"
                        aria-label="Mi cuenta"
                        className="ml-1 grid place-items-center rounded-full ring-1 ring-white/15 transition-all hover:ring-white/35"
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
                    <NavigationMenuLink asChild>
                      {/* Mismo nombre que la pestaña de la barra en móvil:
                          un destino con dos etiquetas se lee como dos sitios */}
                      <Link
                        to="/mi-cuenta"
                        className="fb-btn ml-1 rounded-full px-4 py-2 text-[0.7rem]"
                      >
                        <UserCircle2 className="w-4 h-4" />
                        Mi cuenta
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="fb-btn fb-btn--accent ml-3 flex-shrink-0 whitespace-nowrap px-4 py-2 2xl:ml-6"
            >
              Ver la carta
            </button>
          </div>

          {/* Rastro de sesión en móvil: el avatar solo existía en escritorio,
              así que en el celular no había forma de saber si habías entrado
              sin abrir el menú. Al invitado no se le repite la puerta aquí:
              la barra inferior ya lleva "Mi cuenta" con etiqueta y sin
              competir por el poco ancho de esta fila. */}
          {isCustomerAuthenticated && (
            <Link
              to="/mi-cuenta"
              aria-label="Mi cuenta"
              className="xl:hidden mr-2.5 grid place-items-center rounded-full ring-1 ring-white/15 transition-all hover:ring-white/35"
            >
              <CustomerAvatar customer={customer} className="w-8 h-8 text-sm" />
            </Link>
          )}

          <button
            className="xl:hidden text-light"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
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
            className="fb-card xl:hidden mt-4 max-h-[calc(100vh-80px)] space-y-4 overflow-y-auto px-4 pb-6 pt-4"
          >
            {/* Domicilios y Mi cuenta no se repiten en móvil: son pestañas
                fijas de la barra inferior (CustomerTabBar). Este menú se queda
                con lo que la barra no cubre: la carta y el resto de
                secciones. */}
            <a
              href="#carta"
              className="block text-[0.85rem] font-medium text-primary transition-colors hover:text-primary/80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Carta completa
            </a>

            {/* De 768 px en adelante la barra inferior ya no está y el nav
                completo todavía no entra: ese tramo se queda sin puerta a los
                domicilios y a la cuenta si no se repiten aquí. */}
            <div className="hidden md:block space-y-4">
              {inAppOrdering && (
                <Link
                  to="/domicilios"
                  className="flex items-center gap-2 text-[0.85rem] font-medium text-secondary transition-colors hover:text-secondary/80"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bike className="w-4 h-4" />
                  Domicilios
                </Link>
              )}
              {showMyOrders && (
                <Link
                  to="/mis-pedidos"
                  className="flex items-center gap-2 text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ClipboardList className="w-4 h-4" />
                  Mis pedidos
                </Link>
              )}
              <Link
                to="/mi-cuenta"
                className="flex items-center gap-2 text-[0.85rem] font-medium text-light/70 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isCustomerAuthenticated ? (
                  <CustomerAvatar
                    customer={customer}
                    className="w-6 h-6 text-xs"
                  />
                ) : (
                  <UserCircle2 className="w-4 h-4" />
                )}
                Mi cuenta
              </Link>
            </div>
            <div className="border-t border-white/[0.08] pt-3 space-y-4">
              <p className="fb-eyebrow">Bebidas</p>
              {visibleBeverages.map((section) => (
                <a
                  key={section.key}
                  href={section.href}
                  className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {section.label}
                </a>
              ))}
            </div>
            <div className="border-t border-white/[0.08] pt-3 space-y-4">
              <p className="fb-eyebrow">Más en Frostbyte</p>
              <a
                href="#que-te-provoca"
                className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recomendador de bebidas
              </a>
              <a
                href="#descuento-redes"
                className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Descuento por redes
              </a>
              <a
                href="#descuento-cumple"
                className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Descuento de cumpleaños
              </a>
              <a
                href="#solicitar-cancion"
                className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pedir canción
              </a>
              <a
                href="#feedback"
                className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tu opinión
              </a>
            </div>
            <div className="border-t border-white/[0.08] pt-4 space-y-4">
              {/* Frostbyte Play - Solo mostrar en rutas de mesa */}
              {isTableRoute && (
                <Link
                  to="/game"
                  className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Frostbyte Play
                </Link>
              )}
              <a
                href="https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ubicación
              </a>
              <a
                href="https://wa.me/573164277879"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[0.85rem] font-medium text-light/55 transition-colors hover:text-light"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                WhatsApp
              </a>
              {/* Puerta del staff. Está aquí abajo y no arriba porque el
                  cliente no la necesita, pero el equipo entra cada turno: al
                  pie de la carta completa le quedaba demasiado lejos. Con el
                  nombre propio ya no se confunde con "Mi cuenta", que era el
                  problema de la vieja etiqueta "Login". */}
              <Link
                to="/login"
                className="flex items-center gap-2 text-[0.78rem] font-medium text-light/35 transition-colors hover:text-light/70"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="w-3.5 h-3.5" />
                Acceso equipo
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("menu")
                  ?.scrollIntoView({ behavior: "smooth" });
                setIsMobileMenuOpen(false);
              }}
              className="fb-btn fb-btn--accent w-full"
            >
              Ver la carta
            </button>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
