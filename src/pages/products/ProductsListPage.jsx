import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBusinessStore } from '@/stores/useBusinessStore';

const ProductsListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthStore();
  const { selectedBusinessSlug } = useBusinessStore();
  const biz = selectedBusinessSlug || undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Obtener categorías (del negocio seleccionado)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', selectedBusinessSlug],
    queryFn: () => categoriesService.getAll({ active_only: false, business: biz }),
  });

  // Obtener productos filtrados
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, showInactive, selectedBusinessSlug],
    queryFn: () => productsService.getAll({
      active_only: !showInactive,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      business: biz,
    }),
  });

  // Obtener todos los productos para estadísticas
  const { data: allProductsData } = useQuery({
    queryKey: ['products', 'all', selectedBusinessSlug],
    queryFn: () => productsService.getAll({ active_only: false, business: biz }),
  });

  // Mutación para eliminar producto
  const deleteMutation = useMutation({
    mutationFn: (slug) => productsService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Mutación para toggle activo/inactivo
  const toggleActiveMutation = useMutation({
    mutationFn: ({ slug, isActive }) =>
      productsService.partialUpdate(slug, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const categories = categoriesData?.results || [];
  const products = productsData?.results || [];
  const allProducts = allProductsData?.results || [];
  
  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = allProducts.length;
    const active = allProducts.filter(p => p.is_active).length;
    const inactive = allProducts.filter(p => !p.is_active).length;
    const comingSoon = allProducts.filter(p => p.is_coming_soon).length;
    const totalVariants = allProducts.reduce((sum, p) => sum + (p.variants_count || p.variants?.length || 0), 0);
    
    return {
      total,
      active,
      inactive,
      comingSoon,
      totalVariants,
    };
  }, [allProducts]);

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category_name?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const handleDelete = (product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      deleteMutation.mutate(product.slug);
    }
  };

  const handleToggleActive = (product) => {
    toggleActiveMutation.mutate({
      slug: product.slug,
      isActive: product.is_active,
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
            Productos de la Carta
          </h1>
          <p className="text-gray">
            Gestiona los productos y sus variantes
          </p>
        </div>
        {isAdmin() && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/productos/generador-ia')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.08] border border-secondary/30 text-secondary font-semibold rounded-lg hover:bg-secondary/10 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Generador IA
            </button>
            <button
              onClick={() => navigate('/productos/nuevo')}
              className="flex items-center gap-2 px-4 py-2.5 border border-secondary/35 bg-secondary/[0.1] text-light rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fb-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="fb-eyebrow mb-1.5 block">Total</p>
              <p className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="fb-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="fb-eyebrow mb-1.5 block">Activos</p>
              <p className="text-xl font-bold text-green-400">{stats.active}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fb-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="fb-eyebrow mb-1.5 block">Inactivos</p>
              <p className="text-xl font-bold text-red-400">{stats.inactive}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fb-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="fb-eyebrow mb-1.5 block">Próximamente</p>
              <p className="text-xl font-bold text-yellow-400">{stats.comingSoon}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="fb-card p-4 col-span-2 md:col-span-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Package className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="fb-eyebrow mb-1.5 block">Variantes</p>
              <p className="text-xl font-bold text-secondary">{stats.totalVariants}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className="fb-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light placeholder:text-light/25 focus:border-white/30 focus:outline-none"
            />
          </div>

          {/* Filtro por categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-light focus:border-white/30 focus:outline-none"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

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

      {/* Tabla de productos */}
      <div className="fb-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.03] border-b border-white/[0.08]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray">Producto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray">Variantes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray">Precio Mín.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No se encontraron productos</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const minPrice = product.variants?.length > 0
                    ? Math.min(...product.variants.map(v => parseFloat(v.price)))
                    : 0;

                  const hasImageUrl = product.image_url && product.image_url.trim() !== '';
                  const shouldShowImage = hasImageUrl && !imageErrors[product.id];

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-white/[0.08] transition-colors ${
                        !product.is_active ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/[0.09] flex items-center justify-center shrink-0">
                            {shouldShowImage ? (
                              <img loading="lazy" decoding="async"
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setImageErrors(prev => ({ ...prev, [product.id]: true }));
                                }}
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-light">{product.name}</p>
                            {product.is_coming_soon && (
                              <span className="text-xs text-yellow-400">Próximamente</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray">{product.category_name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-light">
                          {product.variants_count || product.variants?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-light font-medium">
                          {minPrice > 0 ? formatCurrency(minPrice) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {product.is_active ? (
                            <span className="flex items-center gap-1 text-xs text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Activo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                              <XCircle className="w-4 h-4" />
                              Inactivo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {isAdmin() && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(product)}
                              disabled={toggleActiveMutation.isPending}
                              className="p-2 text-gray hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                              title={product.is_active ? 'Desactivar' : 'Activar'}
                            >
                              {product.is_active ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => navigate(`/productos/editar/${product.slug}`)}
                              className="p-2 text-gray hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              disabled={deleteMutation.isPending}
                              className="p-2 text-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contador */}
      {filteredProducts.length > 0 && (
        <div className="text-center text-sm text-gray">
          Mostrando {filteredProducts.length} de {products.length} productos
        </div>
      )}
    </div>
  );
};

export default ProductsListPage;

