import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detectar si estamos en una ruta de mesa
  const isTableRoute = location.pathname.startsWith('/mesa/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const productLinks = [
    {
      title: "🩹 Desguayabator",
      href: "#desguayabator",
      description: "Bebida helada para curar guayabos. Electrolit + Bonfiest.",
    },
    {
      title: "💧 Agua",
      href: "#agua",
      description: "Agua pura y refrescante para hidratarte.",
    },
    {
      title: "Granizados",
      href: "#granizados",
      description: "Mango, Maracumango, Lulo y más.",
    },
    {
      title: "Frappés",
      href: "#frappes",
      description: "Café, Oreo, Fresa, Brownie.",
    },
    {
      title: "Sodas Italianas",
      href: "#sodas",
      description: "Refrescantes sodas de Fresa y Maracuyá.",
    },
    {
      title: "Micheladas",
      href: "#micheladas",
      description: "Poker, Budweiser y Corona con nuestra mezcla secreta.",
    },
    {
      title: "🍺 Cervezas",
      href: "#cervezas",
      description: "Poker, Budweiser, Corona y Coronita bien frías.",
    },
    {
      title: "🍹 Cuates",
      href: "#cuates",
      description: "Cócteles con tequila mexicano. Limón, Fresa y Mango.",
    },
    {
      title: "Cócteles",
      href: "#mocktails",
      description: "Mojitos, Margaritas, Moscow Mule y más.",
    },
    {
      title: "Shots",
      href: "#shots",
      description: "Ginebra, Vodka, Whisky, Tequila y Ron.",
    },
    {
      title: "🍷 Vinos",
      href: "#vinos",
      description: "Copas de Gato Negro y Casillero del Diablo.",
    },
    {
      title: "✨ Recomendador",
      href: "#que-te-provoca",
      description: "Deja que te recomendemos la bebida perfecta.",
    },
    {
      title: "📱 Descuento Redes",
      href: "#descuento-redes",
      description: "Siguenos en redes y obtendras un descuento.",
    },
    {
      title: "🎂 Descuento Cumple",
      href: "#descuento-cumple",
      description: "Si es tu cumple, tendras un descuento especial.",
    },
    {
      title: "🎵 Pedir Cancion",
      href: "#solicitar-cancion",
      description: "Pide tu cancion favorita y la ponemos para ti.",
    },
    {
      title: "💬 Tu Opinion",
      href: "#feedback",
      description: "Dejanos tu feedback, sugerencias o comentarios.",
    },
  ];

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
          ? "backdrop-blur-xl bg-white/[0.04] border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
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

          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide">
                    Productos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] backdrop-blur-xl bg-dark/90 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
                      {productLinks.map((component) => (
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
              className="ml-6 backdrop-blur-sm bg-gradient-to-r from-primary/90 to-secondary/90 text-dark font-bold hover:shadow-[0_0_25px_rgba(255,0,212,0.4)] transition-all duration-300"
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
            className="md:hidden mt-4 pb-6 pt-4 px-4 space-y-4 backdrop-blur-xl bg-white/[0.04] rounded-2xl border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <a
              href="#carta"
              className="block text-primary hover:text-primary/80 transition-colors duration-300 font-bold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Carta Completa
            </a>
            <div className="border-t border-white/[0.08] pt-3 space-y-4">
              <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold">Bebidas</p>
              <a
                href="#desguayabator"
                className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🩹 Desguayabator
              </a>
              <a
                href="#agua"
                className="block text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                💧 Agua
              </a>
              <a
                href="#granizados"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Granizados
              </a>
              <a
                href="#frappes"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Frappes
              </a>
              <a
                href="#sodas"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sodas Italianas
              </a>
              <a
                href="#micheladas"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Micheladas
              </a>
              <a
                href="#cervezas"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🍺 Cervezas
              </a>
              <a
                href="#cuates"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🍹 Cuates
              </a>
              <a
                href="#mocktails"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cocteles
              </a>
              <a
                href="#shots"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shots
              </a>
              <a
                href="#vinos"
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🍷 Vinos
              </a>
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
              className="w-full backdrop-blur-sm bg-gradient-to-r from-primary/90 to-secondary/90 text-dark font-bold shadow-[0_0_20px_rgba(255,0,212,0.2)]"
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
