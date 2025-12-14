import React from "react";
import { motion } from "framer-motion";
import { Coffee, Cookie, Cherry, Candy } from "lucide-react";

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="group relative"
  >
    <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/20">
      <div className="h-48 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
        {product.image}
        {product.comingSoon && (
          <div className="absolute inset-0 bg-dark/70 z-20 flex items-center justify-center">
            <span className="text-light font-bold text-lg tracking-wider uppercase bg-secondary/20 px-4 py-2 rounded-lg border border-secondary/50">
              Próximamente
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col grow relative z-20 -mt-12">
        <div
          className={`w-12 h-12 bg-linear-to-br ${product.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <product.icon className="text-dark" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-light mb-2 group-hover:text-secondary transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-gray mb-4 grow text-sm">{product.description}</p>
        {product.hasOptions ? (
          <div className="mt-auto pt-4 border-t border-gray/10">
            <p className="text-xs text-gray mb-2">Elige tu base:</p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray">Chocolisto</span>
                <span className="text-lg font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                  $13.000
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs text-gray">Milo</span>
                <span className="text-lg font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
                  $15.000
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
            <span className="text-2xl font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
              {product.price}
            </span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const Frappes = () => {
  const products = [
    {
      id: 1,
      name: "Café",
      description:
        "El clásico e intenso sabor del café en su versión más helada y cremosa.",
      price: "$12.000 COP",
      icon: Coffee,
      gradient: "from-amber-700 to-orange-900",
      comingSoon: true,
      image: (
        <img
          alt="Frappé de café cremoso con crema batida y granos de café"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1589396575653-c09c794ff6a6"
        />
      ),
    },
    {
      id: 2,
      name: "Oreo",
      description:
        "Irresistible mezcla de galletas oreo trituradas con crema de vainilla.",
      icon: Cookie,
      gradient: "from-slate-700 to-black",
      hasOptions: true,
      image: (
        <img
          alt="Frappé de galleta Oreo con trozos de galleta y salsa de chocolate"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1572490122747-3968b75cc699"
        />
      ),
    },
    {
      id: 3,
      name: "Fresa",
      description:
        "Refrescante y dulce frappé elaborado con fresas naturales seleccionadas.",
      price: "$13.000 COP",
      icon: Cherry,
      gradient: "from-red-500 to-pink-600",
      comingSoon: true,
      image: (
        <img
          alt="Frappé de fresa rosado brillante con fresas frescas encima"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1651170021822-fa88d243d2f3"
        />
      ),
    },
    {
      id: 4,
      name: "Brownie",
      description:
        "Decadente frappé de chocolate con trozos reales de brownie húmedo.",
      icon: Candy,
      gradient: "from-amber-900 to-amber-950",
      hasOptions: true,
      image: (
        <img
          alt="Frappé de chocolate con trozos de brownie y salsa de fudge"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1494825980858-804c1fcf906b"
        />
      ),
    },
  ];

  return (
    <section id="frappes" className="py-20 bg-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-secondary rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary rounded-full filter blur-[100px]"></div>
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
            <span className="bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
              FRAPPÉS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Cremosas y heladas creaciones que fusionan sabores clásicos con
            energía del futuro.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Frappes;
