import React from "react";
import { motion } from "framer-motion";
import {
  Wine,
  GlassWater,
  PartyPopper,
  Martini,
  Citrus,
  Palmtree,
  Skull,
  Clock,
} from "lucide-react";

const ProductCard = ({ product, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    className="group relative"
  >
    <div
      className={`bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-secondary/50 hover:shadow-xl hover:shadow-secondary/20 ${
        product.comingSoon ? "opacity-60" : ""
      }`}
    >
      <div className="h-48 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
        {product.comingSoon && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <span className="bg-primary/90 text-dark font-bold px-4 py-2 rounded-full flex items-center gap-2">
              <Clock size={16} /> Próximamente
            </span>
          </div>
        )}
        {product.image}
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
        <p className="text-gray mb-2 text-sm">{product.description}</p>
        <p className="text-xs text-secondary/80 mb-4 grow">
          <span className="font-semibold">Base:</span> {product.liquor}
        </p>
        <div className="mt-auto pt-4 border-t border-gray/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray text-sm">Suave</span>
            <span className="text-lg font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
              {product.priceSuave}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray text-sm">Cargado</span>
            <span className="text-lg font-bold bg-linear-to-r from-secondary to-primary bg-clip-text text-transparent">
              {product.priceCargado}
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const Mocktails = () => {
  const products = [
    {
      id: 1,
      name: "Mojito",
      description:
        "Refrescante mezcla de hierbabuena, limón y soda con un toque dulce.",
      priceSuave: "$15.000",
      priceCargado: "$20.000",
      liquor: "Ron BACARDI Superior",
      icon: GlassWater,
      gradient: "from-green-400 to-emerald-600",
      image: (
        <img
          alt="Mojito refrescante con hojas de menta y rodajas de limón en vaso alto"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1652780093319-559c3b12225a"
        />
      ),
    },
    {
      id: 2,
      name: "Margarita",
      description:
        "Clásico cóctel cítrico con el equilibrio perfecto entre dulce y ácido.",
      priceSuave: "$20.000",
      priceCargado: "$25.000",
      liquor: "Tequila JOSE CUERVO Especial Reposado",
      icon: Martini,
      gradient: "from-lime-300 to-yellow-400",
      image: (
        <img
          alt="Copa de margarita clásica con borde de sal y rodaja de limón"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1700909592926-c07b0c2a0bed"
        />
      ),
    },
    {
      id: 3,
      name: "Margarota",
      description:
        "Versión gigante y atrevida de la clásica margarita para compartir.",
      priceSuave: "$50.000",
      priceCargado: "$70.000",
      liquor: "Tequila JOSE CUERVO Especial Reposado",
      icon: PartyPopper,
      gradient: "from-yellow-400 to-amber-500",
      image: (
        <img
          alt="Copa gigante de margarita decorada extravagantemente con frutas"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="./margarota.jpeg"
        />
      ),
    },
    {
      id: 4,
      name: "Caipiroshka",
      description:
        "Vodka, lima y azúcar macerados para una explosión de sabor tropical.",
      priceSuave: "$20.000",
      priceCargado: "$30.000",
      liquor: "Vodka ABSOLUT Original",
      icon: Citrus,
      gradient: "from-lime-500 to-green-700",
      image: (
        <img
          alt="Caipiroshka con trozos de lima macerada y hielo picado en vaso corto"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1581284744588-af12206e90db"
        />
      ),
    },
    {
      id: 5,
      name: "Cuba Libre",
      description:
        "La combinación atemporal de ron, cola y un toque de lima fresca.",
      priceSuave: "$15.000",
      priceCargado: "$20.000",
      liquor: "Ron BACARDI Superior",
      icon: Skull,
      gradient: "from-red-900 to-black",
      image: (
        <img
          alt="Cuba libre en vaso alto con mucho hielo y rodaja de limón"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1665940487849-abe2980c05ab"
        />
      ),
    },
    {
      id: 6,
      name: "Gintonic",
      description:
        "Elegante combinación de ginebra premium con agua tónica y botánicos.",
      priceSuave: "$45.000",
      priceCargado: "$60.000",
      liquor: "Ginebra BEEFEATER London Dry 24",
      icon: Wine,
      gradient: "from-purple-400 to-indigo-600",
      image: (
        <img
          alt="Gintonic elegante con botánicos y rodaja de pepino"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/shutterstock-1504207547.jpg"
        />
      ),
    },
    {
      id: 7,
      name: "Moscow Mule",
      description:
        "Picante y refrescante combinación de vodka, ginger beer y limón.",
      priceSuave: "$25.000",
      priceCargado: "$35.000",
      liquor: "Vodka ABSOLUT Original",
      comingSoon: true,
      icon: GlassWater,
      gradient: "from-amber-200 to-orange-300",
      image: (
        <img
          alt="Moscow Mule servido en taza de cobre tradicional con menta"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1527628126150-086ff233b951"
        />
      ),
    },
    {
      id: 8,
      name: "Blue Long",
      description:
        "Cóctel azul eléctrico con una mezcla potente de licores blancos.",
      priceSuave: "$20.000",
      priceCargado: "$30.000",
      liquor: "Vodka ABSOLUT Original",
      comingSoon: true,
      icon: Palmtree,
      gradient: "from-blue-400 to-cyan-600",
      image: (
        <img
          alt="Cóctel azul brillante en vaso largo con cereza y sombrilla"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1682629906883-76eaa5e03693"
        />
      ),
    },
  ];

  return (
    <section id="mocktails" className="py-20 bg-dark relative overflow-hidden">
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
              CÓCTELES
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Bebidas clásicas y creaciones de la casa para elevar tu espíritu.
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

export default Mocktails;
