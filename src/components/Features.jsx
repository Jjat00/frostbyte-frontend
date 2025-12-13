import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield, Sparkles } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Cpu,
      title: 'ENFRIAMIENTO CUÁNTICO',
      description: 'Tecnología de congelación avanzada para la consistencia perfecta en todo momento',
      color: 'primary',
    },
    {
      icon: Zap,
      title: 'ENERGÍA INSTANTÁNEA',
      description: 'Repleto de ingredientes naturales para alimentar tu estilo de vida cyberpunk',
      color: 'secondary',
    },
    {
      icon: Shield,
      title: 'CALIDAD PREMIUM',
      description: 'Solo los mejores ingredientes llegan a nuestra dimensión digital',
      color: 'primary',
    },
    {
      icon: Sparkles,
      title: 'SABORES NEÓN',
      description: 'Combinaciones de sabores únicas que no encontrarás en ningún otro lugar',
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
            POR QUÉ <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FROSTBYTE</span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            No solo servimos bebidas, ofrecemos una experiencia
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