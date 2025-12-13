import React from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

// Icono de TikTok personalizado
const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const Footer = () => {
  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/frostbyte.col/",
      label: "Instagram",
    },
    {
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@frostbyte.col",
      label: "TikTok",
    },
  ];

  return (
    <footer className="bg-dark-secondary border-t border-gray/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-dark">F</span>
              </div>
              <span className="text-2xl font-bold text-light tracking-wider">
                FROSTBYTE
              </span>
            </div>
            <p className="text-gray leading-relaxed">
              Experimenta el futuro de las bebidas heladas. Granizados y frappés
              inspirados en el cyberpunk que superan los límites del sabor.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-light font-bold text-lg mb-4 block">
              Enlaces Rápidos
            </span>
            <nav className="space-y-2">
              <a
                href="#products"
                className="block text-gray hover:text-primary transition-colors duration-300"
              >
                Productos
              </a>
              <a
                href="#features"
                className="block text-gray hover:text-primary transition-colors duration-300"
              >
                Características
              </a>
              <a
                href="#gallery"
                className="block text-gray hover:text-primary transition-colors duration-300"
              >
                Galería
              </a>
              <a
                href="#contact"
                className="block text-gray hover:text-primary transition-colors duration-300"
              >
                Contacto
              </a>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-light font-bold text-lg mb-4 block">
              Síguenos
            </span>
            <p className="text-gray mb-4">
              Únete a nuestra comunidad cyberpunk en redes sociales
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  className="w-10 h-10 bg-dark border border-gray/30 rounded-lg flex items-center justify-center text-gray hover:text-primary hover:border-primary/50 transition-all duration-300"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray text-sm">
              © 2025 Frostbyte. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray hover:text-primary transition-colors duration-300 text-sm"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-gray hover:text-primary transition-colors duration-300 text-sm"
              >
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
