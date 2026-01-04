import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
          ? "bg-dark-secondary/95 backdrop-blur-md shadow-lg shadow-primary/10"
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
              alt="Frostbyte Logo"
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
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-dark-secondary border-gray/20">
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

                {/* Frostbyte Play - Featured */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/game"
                      className="bg-gradient-to-r from-primary to-secondary text-dark font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity mx-2"
                    >
                      🎮 Frostbyte Play
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

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
              className="ml-6 bg-gradient-to-r from-primary to-secondary text-dark font-bold hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              Ver Menú
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
            className="md:hidden mt-4 pb-6 pt-4 px-4 space-y-4 bg-dark-secondary rounded-xl border border-gray/20"
          >
            <a
              href="#desguayabator"
              className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🩹 Desguayabator
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
              Frappés
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
              Cócteles
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
            <div className="border-t border-gray/20 pt-4 space-y-4">
              <Link
                to="/game"
                className="block bg-gradient-to-r from-primary to-secondary text-dark font-bold px-4 py-3 rounded-lg text-center hover:opacity-90 transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎮 Frostbyte Play
              </Link>
              <p className="text-xs text-gray/60 text-center px-4">
                ¡Diviértete jugando mientras esperas tu pedido!
              </p>
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
              className="w-full bg-gradient-to-r from-primary to-secondary text-dark font-bold"
            >
              Ver Menú
            </Button>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
