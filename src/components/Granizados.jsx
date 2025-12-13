import React from 'react';
import { motion } from 'framer-motion';
import { Citrus, Apple, Grape, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ProductCard = ({ product, index, handleOrder }) => (
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
          <Button
            onClick={() => handleOrder(product.name)}
            className="bg-gradient-to-r from-primary to-secondary text-dark font-bold hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
          >
            Pedir
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);

const Granizados = () => {
  const { toast } = useToast();

  const products = [
    {
      id: 1,
      name: 'Mango',
      description: 'Dulce pulpa de mango maduro transformada en hielo refrescante.',
      price: '$10.000 COP',
      icon: Sun,
      gradient: 'from-yellow-400 to-orange-500',
      image: <img alt="Granizado de mango amarillo brillante con trozos de fruta fresca" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1565167273685-6a58b9d5ff97" />
    },
    {
      id: 2,
      name: 'Mango Biche',
      description: 'La acidez perfecta del mango verde con sal y limón.',
      price: '$10.000 COP',
      icon: Citrus,
      gradient: 'from-lime-400 to-green-600',
      image: <img alt="Granizado de mango biche verde con sal y limón en el borde" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1595548151928-3f0b60efc847" />
    },
    {
      id: 3,
      name: 'Maracumango',
      description: 'Fusión exótica entre la dulzura del mango y la pasión del maracuyá.',
      price: '$12.000 COP',
      icon: Sun,
      gradient: 'from-orange-400 to-yellow-300',
      image: <img alt="Granizado bicolor mezclando amarillo y naranja de mango y maracuyá" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1625860650806-871900fe2c36" />
    },
    {
      id: 4,
      name: 'Maracuyá',
      description: 'Pura fruta de la pasión convertida en una experiencia helada vibrante.',
      price: '$11.000 COP',
      icon: Citrus,
      gradient: 'from-yellow-300 to-orange-400',
      image: <img alt="Granizado de maracuyá amarillo con semillas negras visibles" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1700540220755-daeb64eeac8b" />
    },
    {
      id: 5,
      name: 'Lulo',
      description: 'El sabor único y ácido del lulo colombiano en su máxima expresión.',
      price: '$11.000 COP',
      icon: Moon,
      gradient: 'from-green-300 to-lime-500',
      image: <img alt="Granizado de lulo color verde claro con textura espumosa" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://images.unsplash.com/photo-1698761098052-49709207d828" />
    }
  ];

  const handleOrder = (productName) => {
    toast({
      title: "🚧 Característica Próximamente!",
      description: `La orden para ${productName} aún no está implementada.`,
      duration: 4000,
    });
  };

  return (
    <section id="granizados" className="py-20 bg-dark-secondary relative overflow-hidden">
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
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">GRANIZADOS</span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Hielo triturado a la perfección con los sabores frutales más intensos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} handleOrder={handleOrder} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Granizados;