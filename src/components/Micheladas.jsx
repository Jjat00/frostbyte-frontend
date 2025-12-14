import React from "react";
import { motion } from "framer-motion";
import { Beer, Sparkles, Crown } from "lucide-react";

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="group relative"
  >
    <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20">
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
        <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-orange-400 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray mb-4 grow text-sm">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
          <span className="text-2xl font-bold bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            {product.price}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const Micheladas = () => {
  const products = [
    {
      id: 1,
      name: "Michelada Poker",
      description:
        "Cerveza Poker bien fría con nuestra mezcla secreta de salsas, limón y especias.",
      price: "$10.000",
      icon: Beer,
      gradient: "from-yellow-500 to-amber-600",
      image: (
        <img
          alt="Michelada con cerveza Poker en vaso escarchado con sal y limón"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="cerveza-poker.jpg"
        />
      ),
    },
    {
      id: 2,
      name: "Michelada Budweiser",
      description:
        "Cerveza Budweiser premium con nuestra mezcla clásica de clamato, salsas y limón.",
      price: "$10.000",
      icon: Sparkles,
      gradient: "from-red-500 to-red-700",
      image: (
        <img
          alt="Michelada con cerveza Budweiser servida con limón y sal"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="2dff99a28b761aa32527776df5e1c4a7.jpg"
        />
      ),
    },
    {
      id: 3,
      name: "Michelada Corona",
      description:
        "Cerveza Corona Extra con nuestra receta especial de michelada y un toque de limón fresco.",
      price: "$12.000",
      icon: Crown,
      gradient: "from-yellow-300 to-yellow-500",
      image: (
        <img
          alt="Michelada con cerveza Corona decorada con limón"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="cerveza-corona.png"
        />
      ),
    },
  ];

  return (
    <section
      id="micheladas"
      className="py-20 bg-dark-secondary relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500 rounded-full filter blur-[100px]"></div>
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
            <span className="bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              MICHELADAS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            La combinación perfecta de cerveza, limón, salsas y especias.
            ¡Refrescante y picante!
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

export default Micheladas;
