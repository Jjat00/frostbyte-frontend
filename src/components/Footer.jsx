import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
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
              Experimenta el futuro de las bebidas heladas. Granizados y frappés inspirados en el cyberpunk que superan los límites del sabor.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-light font-bold text-lg mb-4 block">Enlaces Rápidos</span>
            <nav className="space-y-2">
              <a href="#products" className="block text-gray hover:text-primary transition-colors duration-300">
                Productos
              </a>
              <a href="#features" className="block text-gray hover:text-primary transition-colors duration-300">
                Características
              </a>
              <a href="#gallery" className="block text-gray hover:text-primary transition-colors duration-300">
                Galería
              </a>
              <a href="#contact" className="block text-gray hover:text-primary transition-colors duration-300">
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
            <span className="text-light font-bold text-lg mb-4 block">Síguenos</span>
            <p className="text-gray mb-4">
              Únete a nuestra comunidad cyberpunk en redes sociales
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
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
              <a href="#" className="text-gray hover:text-primary transition-colors duration-300 text-sm">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray hover:text-primary transition-colors duration-300 text-sm">
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