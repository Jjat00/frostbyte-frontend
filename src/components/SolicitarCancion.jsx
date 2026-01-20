import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Send, Loader2, Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { musicService } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const SolicitarCancion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    song_name: '',
    artist_name: '',
    notes: '',
  });

  // Obtener lista de solicitudes pendientes y reproduciendo
  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['song-requests'],
    queryFn: () => musicService.getAll(),
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  // Filtrar solo pendientes y reproduciendo (excluir completadas y canceladas)
  const requests = (requestsData?.results || []).filter(
    (request) => request.status === 'pending' || request.status === 'playing'
  );

  // Mutación para crear solicitud
  const createMutation = useMutation({
    mutationFn: (data) => musicService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['song-requests']);
      toast({
        title: "¡Solicitud enviada! 🎵",
        description: `Hemos recibido tu solicitud para "${formData.song_name}" de ${formData.artist_name}. ¡La reproduciremos pronto!`,
        duration: 5000,
      });
      // Limpiar el formulario
      setFormData({
        song_name: '',
        artist_name: '',
        notes: '',
      });
    },
    onError: (error) => {
      console.error('Error al enviar solicitud:', error);
      toast({
        title: "Error al enviar solicitud",
        description: error.response?.data?.detail || "Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que los campos requeridos estén llenos
    if (!formData.song_name.trim() || !formData.artist_name.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre de la canción y el artista",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    createMutation.mutate({
      song_name: formData.song_name.trim(),
      artist_name: formData.artist_name.trim(),
      notes: formData.notes.trim() || '',
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'playing') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
          <Play className="w-3 h-3" />
          Reproduciendo
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Pendiente
      </span>
    );
  };

  return (
    <section id="solicitar-cancion" className="py-20 bg-dark-secondary relative overflow-hidden">
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
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ¿QUIERES UNA CANCIÓN?
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Pónla y nosotros te la reproducimos 🎵
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-dark border border-gray/20 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full filter blur-[80px]"></div>
            </div>

            <div className="relative z-10">
              {/* Icono decorativo */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Music className="text-dark" size={40} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="song_name" className="block text-light font-semibold mb-2">
                    Nombre de la Canción *
                  </label>
                  <input
                    type="text"
                    id="song_name"
                    name="song_name"
                    value={formData.song_name}
                    onChange={handleChange}
                    className="w-full bg-dark-secondary border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary transition-colors duration-300"
                    placeholder="Ej: Bohemian Rhapsody"
                    required
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label htmlFor="artist_name" className="block text-light font-semibold mb-2">
                    Artista *
                  </label>
                  <input
                    type="text"
                    id="artist_name"
                    name="artist_name"
                    value={formData.artist_name}
                    onChange={handleChange}
                    className="w-full bg-dark-secondary border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary transition-colors duration-300"
                    placeholder="Ej: Queen"
                    required
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-light font-semibold mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-dark-secondary border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary transition-colors duration-300 resize-none"
                    placeholder="Alguna información adicional sobre tu solicitud..."
                    disabled={createMutation.isPending}
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-dark font-bold text-lg py-6 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Solicitar Canción
                    </>
                  )}
                </Button>
              </form>

              {/* Mensaje informativo */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-center"
              >
                <p className="text-gray text-sm">
                  Tu solicitud será procesada y la canción se reproducirá lo antes posible 🎶
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Lista de solicitudes */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto mt-12"
          >
            <div className="bg-dark border border-gray/20 rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-bold text-light mb-6 text-center">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Solicitudes en Cola
                </span>
              </h3>
              
              {requestsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {requests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-dark-secondary border border-gray/20 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Music className="text-primary flex-shrink-0 mt-1" size={20} />
                            <div className="flex-1">
                              <h4 className="text-light font-semibold text-base sm:text-lg break-words">
                                {request.song_name}
                              </h4>
                              <p className="text-gray text-sm break-words">
                                {request.artist_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center self-start flex-shrink-0">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {requests.length === 0 && (
                    <div className="text-center py-8 text-gray">
                      <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay solicitudes en cola</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SolicitarCancion;

