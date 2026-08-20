import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Loader2, Star, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import SectionHeading from '@/components/SectionHeading';
import { feedbackService } from '@/services';
import { useMutation } from '@tanstack/react-query';

const feedbackTypes = [
  { value: 'compliment', label: 'Felicitación', emoji: '🎉' },
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
        <span className="ml-2 text-[0.72rem] text-light/45">
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
    <section id="feedback" className="fb-section fb-section--plain py-16">
      <div className="container relative z-10 mx-auto px-5">
        <SectionHeading
          eyebrow="Cuéntanos"
          title="Tu opinión importa"
          description="Saber qué tal te fue es lo que nos deja mejorar. Cuéntanos tu experiencia en Frostbyte Cumbal."
          className="mb-10"
        />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="fb-card p-6 sm:p-8">
            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-6 flex justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/[0.1] bg-white/[0.03]">
                  <MessageSquare className="text-light/70" size={20} strokeWidth={1.6} />
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre (opcional) */}
                <div>
                  <label htmlFor="customer_name" className="fb-eyebrow mb-2 block">
                    Tu nombre (opcional)
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
                    placeholder="Ej: Maria"
                    disabled={createMutation.isPending}
                  />
                </div>

                {/* Tipo de feedback */}
                <div>
                  <label className="fb-eyebrow mb-2 block">
                    Tipo de comentario
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      disabled={createMutation.isPending}
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none flex items-center justify-between"
                    >
                      <span>
                        {selectedType?.emoji} {selectedType?.label}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showTypeDropdown && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-white/[0.1] bg-dark/95">
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
                  <label className="fb-eyebrow mb-2 block">
                    Calificación (opcional)
                  </label>
                  <StarRating
                    rating={formData.rating}
                    setRating={(rating) => setFormData({ ...formData, rating })}
                    disabled={createMutation.isPending}
                  />
                </div>

                {/* Comentario */}
                <div>
                  <label htmlFor="comment" className="fb-eyebrow mb-2 block">
                    Tu comentario *
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows="4"
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none resize-none"
                    placeholder="Cuéntanos tu experiencia, sugerencias o lo que quieras compartir…"
                    required
                    disabled={createMutation.isPending}
                  ></textarea>
                  <p className="mt-1.5 text-[0.68rem] text-light/35">
                    Mínimo 10 caracteres ({formData.comment.length}/10)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="fb-btn fb-btn--accent w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </form>

              {/* Mensaje informativo */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-center"
              >
                <p className="text-[0.72rem] text-light/35">
                  Tu opinión nos ayuda a mejorar cada día. ¡Gracias!
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
