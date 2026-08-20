import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Save,
  Sparkles,
} from 'lucide-react';
import { categoriesService } from '@/services/categories.service';
import { businessService } from '@/services/business.service';
import { useBusinessStore } from '@/stores/useBusinessStore';

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { selectedBusinessSlug } = useBusinessStore();
  const biz = selectedBusinessSlug || undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
    is_active: true,
    business: '',
  });

  // Negocios (para asignar la categoría a un negocio)
  const { data: businessesData } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const businesses = Array.isArray(businessesData) ? businessesData : businessesData?.results || [];
  const defaultBusinessId = useMemo(() => {
    const match = businesses.find((b) => b.slug === selectedBusinessSlug);
    return (match || businesses[0])?.id || '';
  }, [businesses, selectedBusinessSlug]);

  // Obtener categorías (del negocio seleccionado)
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', showInactive, selectedBusinessSlug],
    queryFn: () => categoriesService.getAll({ active_only: !showInactive, business: biz }),
  });

  // Mutación para crear categoría
  const createMutation = useMutation({
    mutationFn: (data) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      resetForm();
    },
  });

  // Mutación para actualizar categoría
  const updateMutation = useMutation({
    mutationFn: ({ slug, data }) => categoriesService.update(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      resetForm();
    },
  });

  // Mutación para eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: (slug) => categoriesService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Mutación para toggle activo/inactivo
  const toggleActiveMutation = useMutation({
    mutationFn: ({ slug, isActive }) =>
      categoriesService.partialUpdate(slug, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Mutación para toggle mostrar extras (ej: sección de envenenar en granizados)
  const toggleExtrasMutation = useMutation({
    mutationFn: ({ slug, showExtras }) =>
      categoriesService.partialUpdate(slug, { show_extras: !showExtras }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const categories = categoriesData?.results || [];

  // Filtrar categorías por búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      display_order: 0,
      is_active: true,
      business: defaultBusinessId,
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      display_order: category.display_order || 0,
      is_active: category.is_active !== false,
      business: category.business || defaultBusinessId,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({
        slug: editingCategory.slug,
        data: formData,
      });
    } else {
      createMutation.mutate({ ...formData, business: formData.business || defaultBusinessId });
    }
  };

  const handleDelete = (category) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar la categoría "${category.name}"?`
      )
    ) {
      deleteMutation.mutate(category.slug);
    }
  };

  const handleToggleActive = (category) => {
    toggleActiveMutation.mutate({
      slug: category.slug,
      isActive: category.is_active,
    });
  };

  const handleToggleExtras = (category) => {
    toggleExtrasMutation.mutate({
      slug: category.slug,
      showExtras: category.show_extras,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-light mb-2">
            Categorías
          </h1>
          <p className="text-gray">
            Gestiona las categorías de productos de la carta
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 border border-secondary/35 bg-secondary/[0.1] text-light rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Filtros */}
      <div className="fb-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light placeholder:text-light/25 focus:border-white/30 focus:outline-none"
            />
          </div>

          {/* Toggle inactivos */}
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              showInactive
                ? 'bg-secondary/20 border-secondary/30 text-secondary'
              : 'bg-white/[0.09] border-white/[0.12] text-gray hover:text-light'
            }`}
          >
            {showInactive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            {showInactive ? 'Mostrando inactivos' : 'Ocultar inactivos'}
          </button>
        </div>
      </div>

      {/* Formulario Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={handleCancel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="fb-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!editingCategory && !selectedBusinessSlug && businesses.length > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray mb-2">
                        Negocio *
                      </label>
                      <select
                        value={formData.business}
                        onChange={(e) =>
                          setFormData({ ...formData, business: Number(e.target.value) })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light focus:border-white/30 focus:outline-none"
                      >
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id} className="bg-dark">
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
                      placeholder="Ej: Granizados"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light placeholder:text-light/25 focus:border-white/30 focus:outline-none resize-none"
                      placeholder="Descripción de la categoría..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray mb-2">
                      Orden de Visualización
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-gray/20 bg-dark text-secondary focus:ring-secondary"
                    />
                    <span className="text-sm text-light">Categoría activa</span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                      className="flex items-center gap-2 px-4 py-2 border border-secondary/35 bg-secondary/[0.1] text-light rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {editingCategory ? 'Actualizar' : 'Crear'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lista de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron categorías</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`fb-card border p-4 space-y-3 ${
                !category.is_active ? 'opacity-60' : ''
              } ${
                category.is_active
                  ? 'border-white/[0.1]'
                  : 'border-red-500/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-light mb-1">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {category.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p className="text-gray">
                    Orden: <span className="text-light">{category.display_order}</span>
                  </p>
                  <p className="text-gray">
                    Productos: <span className="text-light">{category.products_count || 0}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => handleToggleActive(category)}
                  disabled={toggleActiveMutation.isPending}
                  className="flex-1 p-2 text-gray hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors text-xs"
                  title={category.is_active ? 'Ocultar sección' : 'Mostrar sección'}
                >
                  {category.is_active ? (
                    <EyeOff className="w-4 h-4 mx-auto" />
                  ) : (
                    <Eye className="w-4 h-4 mx-auto" />
                  )}
                </button>
                <button
                  onClick={() => handleToggleExtras(category)}
                  disabled={toggleExtrasMutation.isPending}
                  className={`flex-1 p-2 rounded-lg transition-colors text-xs ${
                    category.show_extras
                      ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
                      : 'text-gray hover:text-purple-400 hover:bg-purple-500/10'
                  }`}
                  title={category.show_extras ? 'Ocultar extras' : 'Mostrar extras'}
                >
                  <Sparkles className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 p-2 text-gray hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-xs"
                  title="Editar"
                >
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 p-2 text-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Contador */}
      {filteredCategories.length > 0 && (
        <div className="text-center text-sm text-gray">
          Mostrando {filteredCategories.length} de {categories.length} categorías
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;

