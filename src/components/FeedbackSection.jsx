import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Loader2, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { feedbackService } from '@/services';
import { useMutation } from '@tanstack/react-query';

const feedbackTypes = [
  { value: 'compliment', label: 'Felicitacion', emoji: '🎉' },
  { value: 'suggestion', label: 'Sugerencia', emoji: '💡' },
  { value: 'complaint', label: 'Queja', emoji: '😔' },
  { value: 'question', label: 'Pregunta', emoji: '❓' },
  { value: 'other', label: 'Otro', emoji: '📝' },
];

const StarRating = ({ rating, setRating, disabled }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => setRating(rating === star ? 0 : star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray/40'
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray">
          {rating === 5 && 'Excelente'}
          {rating === 4 && 'Muy bueno'}
          {rating === 3 && 'Bueno'}
          {rating === 2 && 'Regular'}
          {rating === 1 && 'Malo'}
        </span>
      )}
    </div>
  );
};

const FeedbackSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customer_name: '',
    comment: '',
    rating: 0,
    feedback_type: 'other',
  });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Mutacion para crear feedback
  const createMutation = useMutation({
    mutationFn: (data) => feedbackService.create(data),
    onSuccess: (response) => {
      toast({
        title: "¡Gracias por tu opinion! 💙",
        description: response.message || "Tu feedback ha sido enviado correctamente.",
        duration: 5000,
      });
      // Limpiar formulario
      setFormData({
        customer_name: '',
        comment: '',
        rating: 0,
        feedback_type: 'other',
      });
    },
    onError: (error) => {
      console.error('Error al enviar feedback:', error);
      toast({
        title: "Error al enviar",
        description: error.response?.data?.comment?.[0] || error.response?.data?.detail || "Ocurrio un error. Por favor intenta de nuevo.",
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

    // Validar comentario
    if (!formData.comment.trim() || formData.comment.trim().length < 10) {
      toast({
        title: "Comentario muy corto",
        description: "Por favor escribe al menos 10 caracteres",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    createMutation.mutate({
      customer_name: formData.customer_name.trim() || '',
      comment: formData.comment.trim(),
      rating: formData.rating || null,
      feedback_type: formData.feedback_type,
    });
  };

  const selectedType = feedbackTypes.find(t => t.value === formData.feedback_type);

  return (
    <section id="feedback" className="py-20 bg-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary rounded-full filter blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-6xl font-black text-light mb-4">
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              TU OPINION IMPORTA
            </span>
          </h2>
          <p className="text-gray text-lg max-w-2xl mx-auto">
            Para nosotros es muy importante saber tu opinion para mejorar.
            Cuentanos que tal tu experiencia en Frostbyte 💙
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-dark-secondary border border-gray/20 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full filter blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full filter blur-[80px]"></div>
            </div>

            <div className="relative z-10">
              {/* Icono decorativo */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center">
                  <MessageSquare className="text-dark" size={40} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre (opcional) */}
                <div>
                  <label htmlFor="customer_name" className="block text-light font-semibold mb-2">
                    Tu nombre (opcional)
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-secondary transition-colors duration-300"
                    placeholder="Ej: Maria"
                    disabled={createMutation.isPending}
                  />
                </div>

                {/* Tipo de feedback */}
                <div>
                  <label className="block text-light font-semibold mb-2">
                    Tipo de comentario
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      disabled={createMutation.isPending}
                      className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-secondary transition-colors duration-300 flex items-center justify-between"
                    >
                      <span>
                        {selectedType?.emoji} {selectedType?.label}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-dark border border-gray/30 rounded-lg overflow-hidden z-20">
                        {feedbackTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, feedback_type: type.value });
                              setShowTypeDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-secondary/20 transition-colors ${
                              formData.feedback_type === type.value ? 'bg-secondary/10 text-secondary' : 'text-light'
                            }`}
                          >
                            {type.emoji} {type.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-light font-semibold mb-2">
                    Calificacion (opcional)
                  </label>
                  <StarRating
                    rating={formData.rating}
                    setRating={(rating) => setFormData({ ...formData, rating })}
                    disabled={createMutation.isPending}
                  />
                </div>

                {/* Comentario */}
                <div>
                  <label htmlFor="comment" className="block text-light font-semibold mb-2">
                    Tu comentario *
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-dark border border-gray/30 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-secondary transition-colors duration-300 resize-none"
                    placeholder="Cuentanos tu experiencia, sugerencias o lo que quieras compartir..."
                    required
                    disabled={createMutation.isPending}
                  ></textarea>
                  <p className="text-xs text-gray mt-1">
                    Minimo 10 caracteres ({formData.comment.length}/10)
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-gradient-to-r from-secondary to-primary text-dark font-bold text-lg py-6 hover:shadow-2xl hover:shadow-secondary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Feedback
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
                  Tu opinion nos ayuda a mejorar cada dia. ¡Gracias! 💙
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeedbackSection;
