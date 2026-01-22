import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Loader2,
  Edit,
  Trash2,
  X,
  Save,
  Wallet,
  Users,
  Zap,
  Home,
  Wrench,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { expensesService } from "@/services/expenses.service";
import toast from "react-hot-toast";

const ICON_MAP = {
  Users: Users,
  Zap: Zap,
  Home: Home,
  Wrench: Wrench,
  Megaphone: TrendingUp,
  Shield: CheckCircle,
  FileText: Wallet,
  Package: Wallet,
  MoreHorizontal: Wallet,
};

const ICON_OPTIONS = [
  { value: "Users", label: "Personas" },
  { value: "Zap", label: "Energia" },
  { value: "Home", label: "Casa" },
  { value: "Wrench", label: "Herramienta" },
  { value: "Megaphone", label: "Megafono" },
  { value: "Shield", label: "Escudo" },
  { value: "FileText", label: "Documento" },
  { value: "Package", label: "Paquete" },
  { value: "MoreHorizontal", label: "Otro" },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "Azul" },
  { value: "yellow", label: "Amarillo" },
  { value: "purple", label: "Morado" },
  { value: "orange", label: "Naranja" },
  { value: "pink", label: "Rosa" },
  { value: "green", label: "Verde" },
  { value: "red", label: "Rojo" },
  { value: "cyan", label: "Cyan" },
  { value: "gray", label: "Gris" },
];

const COLOR_MAP = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "MoreHorizontal",
    color: "gray",
    is_recurring_default: false,
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expensesService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => expensesService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Categoria creada");
      closeModal();
    },
    onError: () => toast.error("Error al crear categoria"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data }) => expensesService.updateCategory(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Categoria actualizada");
      closeModal();
    },
    onError: () => toast.error("Error al actualizar categoria"),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug) => expensesService.deleteCategory(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast.success("Categoria eliminada");
    },
    onError: () => toast.error("Error al eliminar categoria"),
  });

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "MoreHorizontal",
        color: category.color || "gray",
        is_recurring_default: category.is_recurring_default || false,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "MoreHorizontal",
        color: "gray",
        is_recurring_default: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Ingresa un nombre");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ slug: editingCategory.slug, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categoriesList = categories?.results || categories || [];

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light">Categorias de Gastos</h1>
          <p className="text-gray text-sm mt-1">
            Administra las categorias de gastos operativos
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoria
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : categoriesList.length === 0 ? (
        <div className="bg-dark-secondary rounded-xl p-8 text-center border border-gray/10">
          <FolderOpen className="w-12 h-12 text-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-light mb-2">
            Sin categorias
          </h3>
          <p className="text-gray mb-4">Crea tu primera categoria de gastos</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva Categoria
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map((category) => {
            const IconComponent = ICON_MAP[category.icon] || Wallet;
            const colorClass = COLOR_MAP[category.color] || COLOR_MAP.gray;

            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dark-secondary rounded-xl p-5 border border-gray/10 hover:border-gray/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border ${colorClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-light">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray mt-1 truncate">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray">
                      {category.expenses_count || 0} gastos
                    </span>
                    <span className="text-light font-medium">
                      {formatCurrency(category.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => openModal(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta categoria?")) {
                        deleteMutation.mutate(category.slug);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-dark-secondary rounded-xl border border-gray/20 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray/10">
                <h2 className="text-lg font-semibold text-light">
                  {editingCategory ? "Editar Categoria" : "Nueva Categoria"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
                    placeholder="Nombre de la categoria"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray mb-2">Descripcion</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
                    placeholder="Descripcion opcional"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray mb-2">Icono</label>
                    <select
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, icon: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray mb-2">Color</label>
                    <select
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, color: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
                    >
                      {COLOR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={formData.is_recurring_default}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_recurring_default: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="is_recurring" className="text-sm text-light">
                    Categoria recurrente por defecto
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 text-gray hover:text-light transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-dark rounded-lg font-medium disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesPage;
