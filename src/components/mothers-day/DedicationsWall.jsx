import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Send, Loader2, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motherDedicationsService } from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const DedicationsWall = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    author_name: "",
    mother_name: "",
    message: "",
  });

  const { data: dedicationsData } = useQuery({
    queryKey: ["mother-dedications"],
    queryFn: () => motherDedicationsService.getAll(),
    refetchInterval: 15000,
  });

  const dedications = dedicationsData?.results || [];

  const createMutation = useMutation({
    mutationFn: (data) => motherDedicationsService.create(data),
    onSuccess: () => {
      toast({
        title: "Dedicatoria enviada con amor",
        description:
          "Tu mensaje a mamá aparecerá en el muro de dedicatorias.",
        duration: 4000,
      });
      setFormData({ author_name: "", mother_name: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["mother-dedications"] });
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message?.[0] ||
        error.response?.data?.detail ||
        "No se pudo enviar. Intenta de nuevo.";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      toast({
        title: "Mensaje muy corto",
        description: "Escribe al menos 5 caracteres",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    createMutation.mutate({
      author_name: formData.author_name.trim(),
      mother_name: formData.mother_name.trim(),
      message: formData.message.trim(),
    });
  };

  return (
    <section
      id="dedicatorias-mama"
      className="py-16 md:py-20 bg-dark relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-pink-300 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-amber-300 rounded-full filter blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flower2 className="w-8 h-8 text-pink-300" />
            <h2 className="text-3xl md:text-5xl font-black text-light">
              <span className="bg-gradient-to-r from-pink-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                MURO DE AMOR PARA MAM&Aacute;
              </span>
            </h2>
            <Flower2 className="w-8 h-8 text-pink-300" />
          </div>
          <p className="text-gray text-base md:text-lg max-w-xl mx-auto">
            Deja un mensaje lleno de amor para tu mam&aacute;. Tu dedicatoria
            aparecer&aacute; aqu&iacute; para que todos la vean.
          </p>
        </motion.div>

        {dedications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <DedicationsTicker dedications={dedications} />
          </motion.div>
        )}

        {dedications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-10"
          >
            <Heart className="w-5 h-5 text-pink-300 fill-pink-300" />
            <span className="text-pink-200 font-bold text-lg">
              {dedications.length}
            </span>
            <span className="text-gray text-sm">
              {dedications.length === 1
                ? "dedicatoria a mamá"
                : "dedicatorias a mamá"}
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-dark-secondary/80 backdrop-blur-sm border border-pink-300/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-pink-300 rounded-full filter blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-300 rounded-full filter blur-[60px]" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 via-rose-300 to-amber-300 rounded-full flex items-center justify-center shadow-lg shadow-pink-300/30">
                  <Heart className="text-white fill-white" size={28} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-light font-semibold mb-1.5 text-sm">
                    Para mam&aacute; (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.mother_name}
                    onChange={(e) =>
                      setFormData({ ...formData, mother_name: e.target.value })
                    }
                    className="w-full bg-dark border border-pink-300/20 rounded-lg px-4 py-2.5 text-light text-sm focus:outline-none focus:border-pink-300 transition-colors duration-300"
                    placeholder="Ej: Mi mamá, Carmen, Mamá Rosa..."
                    maxLength={60}
                    disabled={createMutation.isPending}
                  />
                </div>

                <div>
                  <label className="block text-light font-semibold mb-1.5 text-sm">
                    Tu mensaje de amor *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows="3"
                    className="w-full bg-dark border border-pink-300/20 rounded-lg px-4 py-2.5 text-light text-sm focus:outline-none focus:border-pink-300 transition-colors duration-300 resize-none"
                    placeholder="Escribe lo que más amas de mamá..."
                    maxLength={240}
                    required
                    disabled={createMutation.isPending}
                  />
                  <p className="text-xs text-gray mt-1 text-right">
                    {formData.message.length}/240
                  </p>
                </div>

                <div>
                  <label className="block text-light font-semibold mb-1.5 text-sm">
                    De parte de (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) =>
                      setFormData({ ...formData, author_name: e.target.value })
                    }
                    className="w-full bg-dark border border-pink-300/20 rounded-lg px-4 py-2.5 text-light text-sm focus:outline-none focus:border-pink-300 transition-colors duration-300"
                    placeholder="Tu nombre"
                    maxLength={60}
                    disabled={createMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 text-white font-bold text-sm py-5 hover:shadow-lg hover:shadow-pink-400/30 transition-all duration-300 disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar con amor
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const DedicationsTicker = ({ dedications }) => {
  const duplicated = [...dedications, ...dedications];

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-dark to-transparent z-10 pointer-events-none" />

      <div className="overflow-hidden">
        <div
          className="flex gap-4 animate-marquee"
          style={{
            animationDuration: `${Math.max(dedications.length * 6, 30)}s`,
          }}
        >
          {duplicated.map((d, i) => (
            <DedicationCard key={`${d.id}-${i}`} dedication={d} />
          ))}
        </div>
      </div>
    </div>
  );
};

const DedicationCard = ({ dedication }) => {
  return (
    <div className="flex-shrink-0 w-64 md:w-72 bg-dark-secondary/60 backdrop-blur-sm border border-pink-300/15 rounded-xl p-4 hover:border-pink-300/30 transition-colors duration-300">
      <p className="text-light/90 text-sm leading-relaxed mb-3 line-clamp-3">
        &ldquo;{dedication.message}&rdquo;
      </p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3 h-3 text-pink-300 fill-pink-300" />
          {dedication.mother_name ? (
            <span className="text-pink-200 font-medium truncate max-w-[100px]">
              Para {dedication.mother_name}
            </span>
          ) : (
            <span className="text-pink-200/70">Para mam&aacute;</span>
          )}
        </div>
        {dedication.author_name && (
          <span className="text-gray truncate max-w-[80px]">
            &mdash; {dedication.author_name}
          </span>
        )}
      </div>
    </div>
  );
};

export default DedicationsWall;
