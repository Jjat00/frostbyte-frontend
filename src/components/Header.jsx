import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
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
      title: "Cócteles",
      href: "#mocktails",
      description: "Mojitos, Margaritas, Moscow Mule y más.",
    },
  ];

  const navItems = [
    { name: "Características", href: "#features" },
    { name: "Galería", href: "#gallery" },
    { name: "Contacto", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
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

                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      href={item.href}
                      className={`${navigationMenuTriggerStyle()} bg-transparent text-gray hover:text-primary focus:text-primary font-medium tracking-wide`}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <Button
              onClick={() =>
                document
                  .getElementById("granizados")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="ml-6 bg-gradient-to-r from-primary to-secondary text-dark font-bold hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
            >
              Ordenar Ahora
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
            className="md:hidden mt-4 pb-4 space-y-4"
          >
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
              href="#mocktails"
              className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cócteles
            </a>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-gray hover:text-primary transition-colors duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <Button
              onClick={() => {
                document
                  .getElementById("granizados")
                  ?.scrollIntoView({ behavior: "smooth" });
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-primary to-secondary text-dark font-bold"
            >
              Ordenar Ahora
            </Button>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
