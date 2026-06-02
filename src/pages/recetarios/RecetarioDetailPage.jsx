import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ChefHat,
  UtensilsCrossed,
  Lightbulb,
  Play,
  Edit,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { recetariosService } from "@/services/recetarios.service";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";

const DIFFICULTY_STYLES = {
  easy: { bg: "bg-green-500/20", text: "text-green-400", label: "Facil" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Media" },
  hard: { bg: "bg-red-500/20", text: "text-red-400", label: "Dificil" },
};

const RecetarioDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthStore();

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["recetario", slug],
    queryFn: () => recetariosService.getRecipe(slug),
  });

  const deleteMutation = useMutation({
    mutationFn: () => recetariosService.deleteRecipe(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetarios"] });
      toast.success("Recetario eliminado");
      navigate("/recetarios");
    },
    onError: () => toast.error("Error al eliminar recetario"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-12 h-12 text-gray mx-auto mb-4" />
        <h2 className="text-xl font-bold text-light mb-2">Receta no encontrada</h2>
        <Link to="/recetarios" className="text-primary hover:underline">
          Volver a recetarios
        </Link>
      </div>
    );
  }

  const diffStyle = DIFFICULTY_STYLES[recipe.difficulty] || DIFFICULTY_STYLES.medium;

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return null;
  };

  const embedUrl = getVideoEmbedUrl(recipe.video_url);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/recetarios")}
          className="flex items-center gap-2 text-gray hover:text-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {isAdmin() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/recetarios/editar/${slug}`}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Link>
            <button
              onClick={() => {
                if (confirm("¿Eliminar este recetario?")) {
                  deleteMutation.mutate();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl overflow-hidden"
      >
        {recipe.image_url && (
          <div className="h-48 sm:h-64 overflow-hidden">
            <img loading="lazy" decoding="async"
              src={recipe.image_url}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-light">{recipe.name}</h1>
            {recipe.product_name && (
              <p className="text-gray mt-1">
                Producto: <span className="text-secondary">{recipe.product_name}</span>
                {recipe.product_variant_name && (
                  <span> - {recipe.product_variant_name}</span>
                )}
              </p>
            )}
          </div>

          {recipe.description && (
            <p className="text-gray leading-relaxed">{recipe.description}</p>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${diffStyle.bg} ${diffStyle.text}`}
            >
              {diffStyle.label}
            </span>
            {recipe.category_name && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-secondary/20 text-secondary">
                {recipe.category_name}
              </span>
            )}
            {recipe.prep_time && (
              <span className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-white/[0.08] text-gray">
                <Clock className="w-3.5 h-3.5" />
                {recipe.prep_time} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-white/[0.08] text-gray">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {recipe.servings}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ingredients */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-4">
          <UtensilsCrossed className="w-5 h-5 text-secondary" />
          Ingredientes
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients?.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center gap-3 text-light"
            >
              <Circle className="w-2 h-2 text-primary flex-shrink-0" />
              <span>
                {ingredient.quantity && (
                  <span className="font-medium text-secondary">
                    {ingredient.quantity}
                    {ingredient.unit && ` ${ingredient.unit}`}
                  </span>
                )}{" "}
                {ingredient.name}
              </span>
              {ingredient.is_optional && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/[0.08] text-gray">
                  opcional
                </span>
              )}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-secondary" />
          Preparacion
        </h2>
        <div className="space-y-4">
          {recipe.steps?.map((step) => (
            <div
              key={step.id}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {step.step_number}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-light leading-relaxed">
                  {step.instruction}
                </p>
                {step.tip && (
                  <p className="flex items-start gap-2 text-sm text-yellow-400/80 bg-yellow-500/10 rounded-lg px-3 py-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {step.tip}
                  </p>
                )}
                {step.image_url && (
                  <img loading="lazy" decoding="async"
                    src={step.image_url}
                    alt={`Paso ${step.step_number}`}
                    className="rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tips */}
      {recipe.tips && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Tips y Notas
          </h2>
          <p className="text-gray leading-relaxed whitespace-pre-line">
            {recipe.tips}
          </p>
        </motion.div>
      )}

      {/* Video */}
      {embedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-secondary" />
            Video
          </h2>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title={recipe.name}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}

      {/* Gallery */}
      {recipe.images?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-secondary" />
            Galeria
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recipe.images.map((img) => (
              <div key={img.id} className="space-y-1">
                <img loading="lazy" decoding="async"
                  src={img.image_url}
                  alt={img.caption || "Imagen de receta"}
                  className="rounded-lg w-full h-32 object-cover"
                />
                {img.caption && (
                  <p className="text-xs text-gray text-center">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RecetarioDetailPage;
