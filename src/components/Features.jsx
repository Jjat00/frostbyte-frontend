import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Gift, Sparkles } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Heart,
      title: 'BEBIDAS PARA DOS',
      description: 'Comparte nuestras bebidas especiales con esa persona que tanto quieres',
      color: 'primary',
    },
    {
      icon: Users,
      title: 'PLANES CON AMIGOS',
      description: 'El mejor lugar para celebrar con tu grupo de amigos este dia especial',
      color: 'secondary',
    },
    {
      icon: Gift,
      title: 'EDICION LIMITADA',
      description: 'Sabores y promociones exclusivas para celebrar el amor y la amistad',
      color: 'primary',
    },
    {
      icon: Sparkles,
      title: 'MOMENTOS UNICOS',
      description: 'Crea recuerdos inolvidables con las mejores bebidas y el mejor ambiente',
      color: 'secondary',
    },
  ];

  return (
    <section id="features" className="py-20 bg-dark relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full filter blur-[120px]"></div>
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
            CELEBRA EN <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FROSTBYTE</span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            El lugar perfecto para celebrar el amor y la amistad
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-dark-secondary border border-gray/20 rounded-2xl p-8 h-full flex flex-col items-center text-center transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 hover:transform hover:scale-105">
                <div className={`w-20 h-20 bg-gradient-to-br ${
                  feature.color === 'primary' ? 'from-primary to-secondary' : 'from-secondary to-primary'
                } rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                  <feature.icon className="text-dark" size={40} />
                </div>

                <h3 className="text-xl font-bold text-light mb-3 tracking-wider">
                  {feature.title}
                </h3>

                <p className="text-gray leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;