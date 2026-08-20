import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Package,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { productsService, variantsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { AIGalleryPickerModal } from '@/components/ai-generator/AIGalleryPickerModal';
import ProductModifiersSection from '@/components/products/ProductModifiersSection';
import { useBusinessStore } from '@/stores/useBusinessStore';

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!slug;
  const { selectedBusinessSlug } = useBusinessStore();

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    history: '',
    image_url: '',
    category: '',
    is_active: true,
    is_coming_soon: false,
  });

  const [variants, setVariants] = useState([
    { name: '', price: '', is_default: true, is_active: true },
  ]);

  const [errors, setErrors] = useState({});
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingHistory, setIsGeneratingHistory] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);

  // Obtener producto si está editando
  const { data: productData, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: isEditing,
  });

  // Categorías SOLO del negocio correcto: al editar, el del producto (no permitir
  // moverlo a otro negocio por error); al crear, el negocio activo del sidebar.
  const catBiz = isEditing ? productData?.business_slug : (selectedBusinessSlug || undefined);
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'form', catBiz],
    queryFn: () => categoriesService.getAll({ active_only: false, business: catBiz }),
    enabled: !isEditing || !!productData,
  });

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (isEditing && productData) {
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        history: productData.history || '',
        image_url: productData.image_url || '',
        category: productData.category || '',
        is_active: productData.is_active !== false,
        is_coming_soon: productData.is_coming_soon || false,
      });

      // Cargar variantes
      if (productData.variants && productData.variants.length > 0) {
        setVariants(
          productData.variants.map((v) => ({
            id: v.id,
            name: v.name || '',
            price: v.price || '',
            is_default: v.is_default || false,
            is_active: v.is_active !== false,
          }))
        );
      }
    }
  }, [isEditing, productData]);

  // Mutación para crear/actualizar producto
  const saveProductMutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return productsService.update(slug, data);
      }
      return productsService.create(data);
    },
    onSuccess: async (product) => {
      try {
        // Guardar variantes
        const variantPromises = variants.map((variant) => {
          const variantData = {
            product: product.id,
            name: variant.name,
            price: parseFloat(variant.price) || 0,
            is_default: variant.is_default,
            is_active: variant.is_active,
          };

          if (variant.id && isEditing) {
            // Actualizar variante existente
            return variantsService.update(variant.id, variantData);
          } else {
            // Crear nueva variante
            return variantsService.create(variantData);
          }
        });

        await Promise.all(variantPromises);

        queryClient.invalidateQueries({ queryKey: ['products'] });
        if (isEditing) {
          queryClient.invalidateQueries({ queryKey: ['product', slug] });
        }
        navigate('/productos');
      } catch (error) {
        console.error('Error al guardar variantes:', error);
        // Aún así invalidamos las queries y navegamos
        queryClient.invalidateQueries({ queryKey: ['products'] });
        navigate('/productos');
      }
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    },
  });

  const handleSuggestDescription = async () => {
    if (!formData.name.trim() || isGeneratingDescription) return;
    setIsGeneratingDescription(true);
    try {
      const description = await productsService.suggestDescription(formData.name.trim());
      setFormData((prev) => ({ ...prev, description }));
      if (errors.description) {
        setErrors((prev) => ({ ...prev, description: null }));
      }
    } catch (error) {
      console.error('Error al sugerir descripción:', error);
      alert('No se pudo generar la descripción. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSuggestHistory = async () => {
    if (!formData.name.trim() || isGeneratingHistory) return;
    setIsGeneratingHistory(true);
    try {
      const history = await productsService.suggestHistory(formData.name.trim());
      setFormData((prev) => ({ ...prev, history }));
      if (errors.history) {
        setErrors((prev) => ({ ...prev, history: null }));
      }
    } catch (error) {
      console.error('Error al sugerir historia:', error);
      alert('No se pudo generar la historia. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingHistory(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'is_default' || field === 'is_active' ? value : value,
      };

      // Si se marca como default, desmarcar los demás
      if (field === 'is_default' && value) {
        updated.forEach((v, i) => {
          if (i !== index) {
            v.is_default = false;
          }
        });
      }

      return updated;
    });
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: '', price: '', is_default: false, is_active: true },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      alert('Debe haber al menos una variante');
      return;
    }

    const variant = variants[index];
    if (variant.id) {
      // Eliminar variante existente
      if (window.confirm('¿Eliminar esta variante?')) {
        variantsService.delete(variant.id).then(() => {
          setVariants((prev) => prev.filter((_, i) => i !== index));
        });
      }
    } else {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validaciones
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    if (variants.length === 0) {
      newErrors.variants = 'Debe haber al menos una variante';
    }

    variants.forEach((variant, index) => {
      if (!variant.name.trim()) {
        newErrors[`variant_${index}_name`] = 'El nombre de la variante es requerido';
      }
      if (!variant.price || parseFloat(variant.price) <= 0) {
        newErrors[`variant_${index}_price`] = 'El precio debe ser mayor a 0';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveProductMutation.mutate(formData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (isEditing && loadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  const categories = categoriesData?.results || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/productos')}
          className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-light">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-gray">
            {isEditing
              ? 'Modifica la información del producto'
              : 'Completa la información para crear un nuevo producto'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="fb-card space-y-4 p-6">
          <h2 className="text-xl font-bold text-light flex items-center gap-2">
            <Package className="w-5 h-5 text-secondary" />
            Información Básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light placeholder:text-light/25 focus:border-white/30 focus:outline-none ${
                  errors.name ? 'border-red-500' : 'border-white/[0.12]'
                }`}
                placeholder="Ej: Mango Biche"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray mb-2">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light focus:border-white/30 focus:outline-none ${
                  errors.category ? 'border-red-500' : 'border-white/[0.12]'
                }`}
              >
                <option value="" className="bg-dark text-light">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-dark text-light">
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-400">{errors.category}</p>
              )}
            </div>

            {/* Imagen del producto */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-gray">
                  Imagen del Producto
                </label>
                <button
                  type="button"
                  onClick={() => setShowGalleryPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:border-secondary/50 transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Galería IA
                </button>
              </div>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => {
                  setFormData((prev) => ({ ...prev, image_url: url }));
                  if (errors.image_url) {
                    setErrors((prev) => ({ ...prev, image_url: null }));
                  }
                }}
                error={errors.image_url}
                disabled={saveProductMutation.isPending}
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-gray">
                  Descripción *
                </label>
                <button
                  type="button"
                  onClick={handleSuggestDescription}
                  disabled={!formData.name.trim() || isGeneratingDescription}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:border-secondary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-secondary/30"
                >
                  {isGeneratingDescription ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Sugerir con IA
                    </>
                  )}
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light placeholder:text-light/25 focus:border-white/30 focus:outline-none resize-none ${
                  errors.description ? 'border-red-500' : 'border-white/[0.12]'
                }`}
                placeholder="Describe el producto..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Historia (cócteles) */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-gray">
                  Historia del cóctel
                </label>
                <button
                  type="button"
                  onClick={handleSuggestHistory}
                  disabled={!formData.name.trim() || isGeneratingHistory}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 hover:border-secondary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-secondary/30"
                >
                  {isGeneratingHistory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Sugerir con IA
                    </>
                  )}
                </button>
              </div>
              <textarea
                name="history"
                value={formData.history}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light placeholder:text-light/25 focus:border-white/30 focus:outline-none resize-none ${
                  errors.history ? 'border-red-500' : 'border-white/[0.12]'
                }`}
                placeholder="Breve historia u origen del cóctel. Se mostrará en el menú digital (opcional)."
              />
              {errors.history && (
                <p className="mt-1 text-sm text-red-400">{errors.history}</p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray/20 bg-dark text-secondary focus:ring-secondary"
                />
                <span className="text-sm text-light">Producto activo</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_coming_soon"
                  checked={formData.is_coming_soon}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray/20 bg-dark text-secondary focus:ring-secondary"
                />
                <span className="text-sm text-light">Próximamente</span>
              </label>
            </div>
          </div>
        </div>

        {/* Variantes */}
        <div className="fb-card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-light flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
              Variantes
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Variante
            </button>
          </div>

          {errors.variants && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.variants}</p>
            </div>
          )}

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray">
                    Variante {index + 1}
                  </span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Nombre de variante */}
                  <div>
                    <label className="block text-sm font-medium text-gray mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(index, 'name', e.target.value)
                      }
                      className={`w-full rounded-xl border bg-white/[0.03] px-4 py-2 text-[0.85rem] text-light placeholder:text-light/25 transition-colors focus:border-white/30 focus:outline-none ${
                        errors[`variant_${index}_name`]
                          ? 'border-red-500'
                          : 'border-white/[0.12]'
                      }`}
                      placeholder="Ej: Pequeño, Grande"
                    />
                    {errors[`variant_${index}_name`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`variant_${index}_name`]}
                      </p>
                    )}
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, 'price', e.target.value)
                      }
                      className={`w-full rounded-xl border bg-white/[0.03] px-4 py-2 text-[0.85rem] text-light placeholder:text-light/25 transition-colors focus:border-white/30 focus:outline-none ${
                        errors[`variant_${index}_price`]
                          ? 'border-red-500'
                          : 'border-white/[0.12]'
                      }`}
                      placeholder="0"
                    />
                    {errors[`variant_${index}_price`] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[`variant_${index}_price`]}
                      </p>
                    )}
                    {variant.price && (
                      <p className="mt-1 text-xs text-gray">
                        {formatCurrency(parseFloat(variant.price) || 0)}
                      </p>
                    )}
                  </div>

                  {/* Checkboxes */}
                  <div className="flex flex-col gap-2 justify-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.is_default}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            'is_default',
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded border-gray/20 bg-dark text-secondary focus:ring-secondary"
                      />
                      <span className="text-xs text-light">Por defecto</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.is_active}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            'is_active',
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded border-gray/20 bg-dark text-secondary focus:ring-secondary"
                      />
                      <span className="text-xs text-light">Activa</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grupos de opciones (modificadores) — requiere producto guardado */}
        {isEditing && productData ? (
          <ProductModifiersSection product={productData} />
        ) : (
          <div className="fb-card p-6">
            <h2 className="text-xl font-bold text-light flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-secondary" />
              Grupos de opciones
            </h2>
            <p className="text-sm text-gray">
              Guarda el producto primero para configurar sus grupos de opciones
              (carnes, salsas, tamaños, bebida, etc.).
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/productos')}
            className="px-6 py-2.5 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saveProductMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 border border-secondary/35 bg-secondary/[0.1] text-light rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveProductMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditing ? 'Actualizar' : 'Crear'} Producto
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de galería IA */}
      <AIGalleryPickerModal
        isOpen={showGalleryPicker}
        onClose={() => setShowGalleryPicker(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, image_url: url }));
          if (errors.image_url) {
            setErrors((prev) => ({ ...prev, image_url: null }));
          }
        }}
      />
    </div>
  );
};

export default ProductFormPage;

