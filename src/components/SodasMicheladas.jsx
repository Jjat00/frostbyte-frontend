import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cherry, Citrus } from 'lucide-react';

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="group relative"
  >
    <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
       <div className="h-48 overflow-hidden relative">
         <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent z-10 opacity-60"></div>
         {product.image}
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-20 -mt-12">
        <div className={`w-12 h-12 bg-gradient-to-br ${product.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <product.icon className="text-dark" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray mb-4 flex-grow text-sm">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {product.price}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);


const SodasMicheladas = () => {
  const products = [
    {
      id: 1,
      name: 'Soda Italiana de Fresa',
      description: 'Refrescante soda carbonatada con jarabe de fresa natural y hielo.',
      price: '$9.000 COP',
      icon: Cherry,
      gradient: 'from-red-400 to-pink-500',
      image: <img alt="Soda italiana de fresa roja brillante con burbujas y hielo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1651170021822-fa88d243d2f3" />
    },
    {
      id: 2,
      name: 'Soda Italiana de Maracuyá',
      description: 'Exótica soda burbujeante infusionada con la acidez tropical del maracuyá.',
      price: '$9.000 COP',
      icon: Citrus,
      gradient: 'from-yellow-400 to-orange-500',
      image: <img alt="Soda italiana de maracuyá amarilla con semillas y burbujas" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1689555256964-aeabc20d1d3c" />
    }
  ];

  return (
    <section id="sodas" className="py-20 bg-dark-secondary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary rounded-full filter blur-[100px]"></div>
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
            SODAS <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ITALIANAS</span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Refrescantes, burbujeantes y llenas de sabor frutal.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SodasMicheladas;