import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Save,
  BookOpen,
} from "lucide-react";
import { recetariosService } from "@/services/recetarios.service";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    display_order: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["recetario-categories"],
    queryFn: () => recetariosService.getCategories(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingCategory) {
        return recetariosService.updateCategory(editingCategory.slug, data);
      }
      return recetariosService.createCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetario-categories"] });
      toast.success(
        editingCategory ? "Categoria actualizada" : "Categoria creada"
      );
      resetForm();
    },
    onError: () => toast.error("Error al guardar categoria"),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug) => recetariosService.deleteCategory(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetario-categories"] });
      toast.success("Categoria eliminada");
    },
    onError: () => toast.error("Error al eliminar categoria"),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", display_order: 0 });
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      display_order: category.display_order || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const categories = data?.results || data || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light">
            Categorias de Recetarios
          </h1>
          <p className="text-gray text-sm mt-1">
            {categories.length} categorias
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-light">
                {editingCategory ? "Editar Categoria" : "Nueva Categoria"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 text-gray hover:text-light rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray mb-1">Nombre *</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: Granizados"
                  className="w-full px-4 py-2.5 backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray mb-1">
                  Descripcion
                </label>
                <input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descripcion breve"
                  className="w-full px-4 py-2.5 backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray mb-1">Orden</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-2.5 backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray hover:text-light border border-white/[0.1] rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-dark font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingCategory ? "Actualizar" : "Crear"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Categories List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-8 text-center">
          <FolderOpen className="w-12 h-12 text-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-light mb-2">
            Sin categorias
          </h3>
          <p className="text-gray">Crea tu primera categoria de recetarios</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4 hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <FolderOpen className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-light">{category.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray">
                      {category.description && (
                        <span>{category.description}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {category.recipes_count} recetas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(category)}
                    className="p-2 text-gray hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta categoria?")) {
                        deleteMutation.mutate(category.slug);
                      }
                    }}
                    className="p-2 text-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
