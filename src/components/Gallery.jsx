import React from 'react';
import { motion } from 'framer-motion';

const Gallery = () => {
  return (
    <section id="gallery" className="py-20 bg-dark-secondary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary rounded-full filter blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
            EXPERIENCIA <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">VISUAL</span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Adéntrate en nuestro mundo iluminado con neón de perfección helada
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              alt="Granizado rosa neón con cristales de hielo"
             src="https://images.unsplash.com/photo-1586344497254-1c04ab49d618" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              alt="Frappé azul cian con crema batida"
             src="https://images.unsplash.com/photo-1671741974888-21b409f4767c" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              alt="Bebida congelada con degradado morado y rosa"
             src="https://images.unsplash.com/photo-1540786308304-429e3ea09ded" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              alt="Granizado azul eléctrico con pajita de neón"
             src="https://images.unsplash.com/photo-1592925951664-e565c31a8870" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              alt="Frappé de varias capas de colores"
             src="https://images.unsplash.com/photo-1630077466454-25764064268c" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-2xl aspect-square group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              alt="Bebidas congeladas de neón rosa y azul juntas"
             src="https://images.unsplash.com/photo-1592925951664-e565c31a8870" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;