import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Característica Próximamente!",
      description: "🚧 Esta característica aún no está implementada, ¡pero no te preocupes! ¡Puedes solicitarla en tu próximo mensaje! 🚀",
      duration: 4000,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Ubicación',
      content: '123 Calle Cyber, Ciudad Neón',
    },
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+1 (555) FROST-99',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'hola@frostbyte.cyber',
    },
    {
      icon: Clock,
      title: 'Horario',
      content: 'Lun-Dom: 10AM - 10PM',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-secondary rounded-full filter blur-[120px]"></div>
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
            PONTE EN <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CONTACTO</span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            ¿Listo para experimentar el futuro de las bebidas heladas? Contáctanos
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-dark-secondary border border-gray/20 rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                    <info.icon className="text-dark" size={24} />
                  </div>
                  <h3 className="text-light font-bold mb-2">{info.title}</h3>
                  <p className="text-gray text-sm">{info.content}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-dark-secondary border border-gray/20 rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <img 
                className="w-full h-64 object-cover rounded-lg" 
                alt="Ubicación de la tienda Frostbyte con letreros de neón"
               src="https://images.unsplash.com/photo-1664285758313-08c2a113d1f2" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="bg-dark-secondary border border-gray/20 rounded-xl p-8 space-y-6">
              <div>
                <label htmlFor="name" className="block text-light font-semibold mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary transition-colors duration-300"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-light font-semibold mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary transition-colors duration-300"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-light font-semibold mb-2">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary transition-colors duration-300 resize-none"
                  placeholder="Cuéntanos qué piensas..."
                  required
                ></textarea>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-dark font-bold text-lg py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300"
              >
                Enviar Mensaje
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;