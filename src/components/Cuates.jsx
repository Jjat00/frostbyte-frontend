import React from "react";
import { motion } from "framer-motion";
import { Citrus, Cherry, Sun } from "lucide-react";

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="group relative"
  >
    <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-lime-500/50 hover:shadow-xl hover:shadow-lime-500/20">
      <div className="h-48 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
        {product.image}
      </div>

      <div className="p-6 flex flex-col grow relative z-20 -mt-8">
        <div
          className={`w-12 h-12 bg-linear-to-br ${product.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <product.icon className="text-dark" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-lime-400 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray mb-4 grow text-sm">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
          <span className="text-2xl font-bold bg-linear-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">
            {product.price}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const Cuates = () => {
  const products = [
    {
      id: 1,
      name: "Cuates Limón",
      description:
        "Cóctel con tequila mexicano sabor limón clásico. Refrescante y listo para disfrutar. 4% Alc.",
      price: "$8.000",
      icon: Citrus,
      gradient: "from-lime-400 to-green-500",
      image: (
        <img
          alt="Los Cuates Margarita Limón"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/1766038063842.jpg"
        />
      ),
    },
    {
      id: 2,
      name: "Cuates Fresa",
      description:
        "Cóctel con tequila mexicano sabor fresa jugosa. Dulce, tropical y refrescante. 4% Alc.",
      price: "$8.000",
      icon: Cherry,
      gradient: "from-pink-400 to-red-500",
      image: (
        <img
          alt="Los Cuates Margarita Fresa"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/cuate-fresa.png"
        />
      ),
    },
    {
      id: 3,
      name: "Cuates Mango",
      description:
        "Cóctel con tequila mexicano sabor mango tropical. Exótico y delicioso. 4% Alc.",
      price: "$8.000",
      icon: Sun,
      gradient: "from-yellow-400 to-orange-500",
      image: (
        <img
          alt="Los Cuates Margarita Mango"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/cuate-mango.png"
        />
      ),
    },
  ];

  return (
    <section
      id="cuates"
      className="py-20 bg-dark-secondary relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-lime-500 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-500 rounded-full filter blur-[100px]"></div>
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
            <span className="bg-linear-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">
              LOS CUATES
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Cócteles listos para tomar con auténtico tequila mexicano.
            Refrescantes, prácticos y perfectos para cualquier ocasión.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cuates;
