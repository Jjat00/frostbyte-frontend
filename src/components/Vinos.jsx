import React from "react";
import { motion } from "framer-motion";
import { Wine, Sparkles } from "lucide-react";

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="group relative"
  >
    <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/20">
      <div className="h-48 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
        {product.image}
      </div>

      <div className="p-6 flex flex-col grow relative z-20 -mt-12">
        <div
          className={`w-12 h-12 bg-linear-to-br ${product.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <product.icon className="text-dark" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-red-400 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray mb-4 grow text-sm">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
          <span className="text-2xl font-bold bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            {product.price}
          </span>
          <span className="text-gray text-sm">Copa</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const Vinos = () => {
  const products = [
    {
      id: 1,
      name: "Gato Negro",
      description:
        "Copa de vino tinto chileno suave y afrutado. Perfecto para acompañar cualquier momento.",
      price: "$20.000",
      icon: Wine,
      gradient: "from-red-500 to-red-700",
      image: (
        <img
          alt="Copa de vino tinto Gato Negro"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/vino2.jpg"
        />
      ),
    },
    {
      id: 2,
      name: "Casillero del Diablo",
      description:
        "Copa de vino tinto reserva premium con cuerpo intenso y notas de frutas maduras.",
      price: "$25.000",
      icon: Sparkles,
      gradient: "from-red-600 to-red-900",
      image: (
        <img
          alt="Copa de vino tinto Casillero del Diablo"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/vino3.jpg"
        />
      ),
    },
  ];

  return (
    <section
      id="vinos"
      className="py-20 bg-dark-secondary relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-700 rounded-full filter blur-[100px]"></div>
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
            <span className="bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              VINOS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Disfruta de una copa de vino tinto de las mejores viñas chilenas.
            Elegancia y sabor en cada sorbo.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Vinos;
