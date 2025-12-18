import React from "react";
import { motion } from "framer-motion";
import { Wine, Martini, Flame, Citrus, Anchor } from "lucide-react";

const ShotCard = ({ shot, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -10, scale: 1.02 }}
    className="group relative"
  >
    <div className="bg-dark border border-gray/20 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20">
      <div className="h-40 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-t from-dark to-transparent z-10 opacity-60"></div>
        {shot.image}
      </div>

      <div className="p-6 flex flex-col grow relative z-20 -mt-8">
        <div
          className={`w-12 h-12 bg-linear-to-br ${shot.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <shot.icon className="text-dark" size={24} />
        </div>
        <h3 className="text-xl font-bold text-light mb-1 group-hover:text-primary transition-colors duration-300">
          {shot.name}
        </h3>
        <p className="text-sm text-gray/70 mb-3">{shot.licor}</p>
        <p className="text-gray mb-4 grow text-sm">{shot.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray/10">
          <span className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            {shot.price}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const Shots = () => {
  const shots = [
    {
      id: 1,
      name: "Ginebra BEEFEATER",
      licor: "London Dry 24",
      description:
        "Shot puro de ginebra premium con notas cítricas y botánicos selectos.",
      price: "$25.000",
      icon: Martini,
      gradient: "from-blue-400 to-blue-600",
      image: (
        <img
          alt="Shot de Ginebra Beefeater London Dry"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/71HDqEEMOfL._AC_UF894,1000_QL80_.jpg"
        />
      ),
    },
    {
      id: 2,
      name: "Vodka ABSOLUT",
      licor: "Original",
      description:
        "Shot puro de vodka sueco. Suave, limpio y de pureza excepcional.",
      price: "$10.000",
      icon: Wine,
      gradient: "from-sky-300 to-sky-500",
      image: (
        <img
          alt="Shot de Vodka Absolut Original"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/istockphoto-466140656-612x612.jpg"
        />
      ),
    },
    {
      id: 3,
      name: "Whisky JACK DANIELS",
      licor: "Tennessee Honey",
      description:
        "Shot puro de whisky americano con miel natural. Dulce y con carácter.",
      price: "$12.000",
      icon: Flame,
      gradient: "from-amber-500 to-amber-700",
      image: (
        <img
          alt="Shot de Whisky Jack Daniels Tennessee Honey"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400"
        />
      ),
    },
    {
      id: 4,
      name: "Tequila JOSE CUERVO",
      licor: "Especial Reposado",
      description: "Shot puro de tequila reposado con notas de agave y madera.",
      price: "$9.000",
      icon: Citrus,
      gradient: "from-yellow-400 to-orange-500",
      image: (
        <img
          alt="Shot de Tequila Jose Cuervo Reposado"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400"
        />
      ),
    },
    {
      id: 5,
      name: "Ron BACARDI",
      licor: "Superior",
      description:
        "Shot puro de ron blanco caribeño. Ligero y con toque tropical.",
      price: "$6.000",
      icon: Anchor,
      gradient: "from-red-500 to-red-700",
      image: (
        <img
          alt="Shot de Ron Bacardi Superior"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="/080480015206.jpg"
        />
      ),
    },
    {
      id: 6,
      name: "Aguardiente NARIÑO",
      licor: "Premium Sin Azúcar",
      description:
        "Shot de aguardiente nariñense premium. Suave, puro y sin azúcar.",
      price: "$5.000",
      icon: Flame,
      gradient: "from-slate-400 to-slate-600",
      image: (
        <img
          alt="Shot de Aguardiente Nariño Premium"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src="./narino_premium.jpeg"
        />
      ),
    },
  ];

  return (
    <section id="shots" className="py-20 bg-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-secondary rounded-full filter blur-[100px]"></div>
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
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              SHOTS
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Licores premium servidos puros. La mejor selección para brindar con
            estilo.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {shots.map((shot, index) => (
            <ShotCard key={shot.id} shot={shot} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shots;
