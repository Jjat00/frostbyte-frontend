import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Loader2,
  Clock,
  ChefHat,
  UtensilsCrossed,
  Trash2,
  Edit,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { recetariosService } from "@/services/recetarios.service";
import { businessService } from "@/services/business.service";
import { apiClient } from "@/services/api/client";
import { useBusinessStore } from "@/stores/useBusinessStore";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

const DIFFICULTY_STYLES = {
  easy: { bg: "bg-green-500/20", text: "text-green-400", label: "Facil" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Media" },
  hard: { bg: "bg-red-500/20", text: "text-red-400", label: "Dificil" },
};

// Punto de color por negocio (alineado con BusinessSelector)
const businessDot = (color) => {
  const map = { blue: "bg-secondary", orange: "bg-orange-400" };
  return map[color] || "bg-primary";
};

const RecetariosListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  // Receta pendiente de confirmar su eliminación (null = diálogo cerrado)
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // Negocio activo (contexto global) para filtrar las recetas
  const { selectedBusinessSlug } = useBusinessStore();
  const { data: businessesData } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const businesses = Array.isArray(businessesData)
    ? businessesData
    : businessesData?.results || [];
  const multiBusiness = businesses.length > 1;
  const colorBySlug = useMemo(
    () => Object.fromEntries(businesses.map((b) => [b.slug, b.color])),
    [businesses]
  );

  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => apiClient.get("/categories/?active_only=true").then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["recetarios", { category: categoryFilter, difficulty: difficultyFilter, search, business: selectedBusinessSlug }],
    queryFn: () =>
      recetariosService.getRecipes({
        category: categoryFilter || undefined,
        difficulty: difficultyFilter || undefined,
        search: search || undefined,
        business: selectedBusinessSlug || undefined,
        active_only: "true",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug) => recetariosService.deleteRecipe(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetarios"] });
      setRecipeToDelete(null);
      toast.success("Recetario eliminado");
    },
    onError: () => {
      setRecipeToDelete(null);
      toast.error("Error al eliminar recetario");
    },
  });

  const recipes = data?.results || data || [];
  const categories = categoriesData?.results || categoriesData || [];

  const filteredRecipes = useMemo(() => {
    if (!search) return recipes;
    const q = search.toLowerCase();
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.product_name?.toLowerCase().includes(q)
    );
  }, [recipes, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light">Recetarios</h1>
          <p className="text-gray text-sm mt-1">
            {filteredRecipes.length} recetas disponibles
          </p>
        </div>

        <Link
          to="/recetarios/nuevo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nuevo Recetario
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar recetas..."
            className="w-full pl-10 pr-4 py-2.5 backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-lg text-light placeholder:text-gray focus:outline-none focus:border-primary/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 backdrop-blur-sm bg-[#1a1a2e] border border-white/[0.12] rounded-lg text-light focus:outline-none focus:border-primary/50 [&>option]:bg-[#1a1a2e] [&>option]:text-light"
        >
          <option value="">Todas las categorias</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2.5 backdrop-blur-sm bg-[#1a1a2e] border border-white/[0.12] rounded-lg text-light focus:outline-none focus:border-primary/50 [&>option]:bg-[#1a1a2e] [&>option]:text-light"
        >
          <option value="">Todas las dificultades</option>
          <option value="easy">Facil</option>
          <option value="medium">Media</option>
          <option value="hard">Dificil</option>
        </select>
      </div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-light mb-2">
            Sin recetas encontradas
          </h3>
          <p className="text-gray">
            No hay recetas que coincidan con los filtros seleccionados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe, index) => {
            const diffStyle = DIFFICULTY_STYLES[recipe.difficulty] || DIFFICULTY_STYLES.medium;

            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/recetarios/${recipe.slug}`)}
                className="cursor-pointer backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl overflow-hidden hover:bg-white/[0.12] hover:border-primary/30 transition-all group"
              >
                {/* Image */}
                {recipe.image_url ? (
                  <div className="h-40 overflow-hidden">
                    <img loading="lazy" decoding="async"
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray/50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-light text-lg truncate">
                      {recipe.name}
                    </h3>
                    {recipe.product_name && (
                      <p className="text-sm text-gray truncate">
                        {recipe.product_name}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${diffStyle.bg} ${diffStyle.text}`}
                    >
                      {diffStyle.label}
                    </span>
                    {recipe.category_name && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-secondary/20 text-secondary">
                        {recipe.category_name}
                      </span>
                    )}
                    {multiBusiness && recipe.business_name && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-white/[0.06] text-gray border border-white/[0.1]">
                        <span className={`w-2 h-2 rounded-full ${businessDot(colorBySlug[recipe.business_slug])}`} />
                        {recipe.business_name}
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray">
                    {recipe.prep_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {recipe.prep_time} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      {recipe.ingredients_count} ingr.
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5" />
                      {recipe.steps_count} pasos
                    </span>
                  </div>

                  {/* Acciones de staff */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.1]">
                    <Link
                      to={`/recetarios/editar/${recipe.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecipeToDelete(recipe);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!recipeToDelete}
        tone="danger"
        icon={Trash2}
        title="¿Eliminar este recetario?"
        message={
          <>
            <strong className="text-light">{recipeToDelete?.name}</strong> dejará de
            aparecer en el listado, con sus pasos e ingredientes. No se borra del
            todo: se puede recuperar pidiéndoselo al administrador.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(recipeToDelete.slug)}
        onCancel={() => setRecipeToDelete(null)}
      />
    </div>
  );
};

export default RecetariosListPage;
