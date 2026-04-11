import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  ChefHat,
  UtensilsCrossed,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import { recetariosService } from "@/services/recetarios.service";
import { apiClient } from "@/services/api/client";
import toast from "react-hot-toast";

const EMPTY_STEP = { step_number: 1, instruction: "", image_url: "", tip: "" };
const EMPTY_INGREDIENT = { name: "", quantity: "", unit: "", is_optional: false };
const EMPTY_IMAGE = { image_url: "", caption: "", display_order: 0 };

const RecetarioFormPage = () => {
  const { slug } = useParams();
  const isEditing = !!slug;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    product: "",
    product_variant: "",
    difficulty: "medium",
    prep_time: "",
    servings: "",
    tips: "",
    video_url: "",
    image_url: "",
    is_active: true,
  });

  const [steps, setSteps] = useState([{ ...EMPTY_STEP }]);
  const [ingredients, setIngredients] = useState([{ ...EMPTY_INGREDIENT }]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Load existing recipe data
  const { data: recipeData, isLoading: loadingRecipe } = useQuery({
    queryKey: ["recetario", slug],
    queryFn: () => recetariosService.getRecipe(slug),
    enabled: isEditing,
  });

  // Load product categories
  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => apiClient.get("/categories/?active_only=true").then((r) => r.data),
  });

  // Load products
  const { data: productsData } = useQuery({
    queryKey: ["products-for-recipe"],
    queryFn: () => apiClient.get("/products/?active_only=true").then((r) => r.data),
  });

  // Load variants when product is selected
  const { data: variantsData } = useQuery({
    queryKey: ["variants-for-recipe", formData.product],
    queryFn: () =>
      apiClient
        .get(`/variants/?product=${formData.product}&active_only=true`)
        .then((r) => r.data),
    enabled: !!formData.product,
  });

  useEffect(() => {
    if (isEditing && recipeData) {
      setFormData({
        name: recipeData.name || "",
        description: recipeData.description || "",
        category: recipeData.category || "",
        product: recipeData.product || "",
        product_variant: recipeData.product_variant || "",
        difficulty: recipeData.difficulty || "medium",
        prep_time: recipeData.prep_time || "",
        servings: recipeData.servings || "",
        tips: recipeData.tips || "",
        video_url: recipeData.video_url || "",
        image_url: recipeData.image_url || "",
        is_active: recipeData.is_active !== false,
      });
      if (recipeData.steps?.length) {
        setSteps(
          recipeData.steps.map((s) => ({
            step_number: s.step_number,
            instruction: s.instruction,
            image_url: s.image_url || "",
            tip: s.tip || "",
          }))
        );
      }
      if (recipeData.ingredients?.length) {
        setIngredients(
          recipeData.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity || "",
            unit: i.unit || "",
            is_optional: i.is_optional || false,
          }))
        );
      }
      if (recipeData.images?.length) {
        setImages(
          recipeData.images.map((img) => ({
            image_url: img.image_url,
            caption: img.caption || "",
            display_order: img.display_order || 0,
          }))
        );
      }
    }
  }, [isEditing, recipeData]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return recetariosService.updateRecipe(slug, data);
      }
      return recetariosService.createRecipe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recetarios"] });
      queryClient.invalidateQueries({ queryKey: ["recetario", slug] });
      toast.success(isEditing ? "Recetario actualizado" : "Recetario creado");
      navigate("/recetarios");
    },
    onError: (error) => {
      if (error.response?.data) {
        setErrors(error.response.data);
        toast.error("Corrige los errores del formulario");
      } else {
        toast.error("Error al guardar recetario");
      }
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Steps handlers
  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { ...EMPTY_STEP, step_number: prev.length + 1 },
    ]);
  };

  const removeStep = (index) => {
    setSteps((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((s, i) => ({ ...s, step_number: i + 1 }));
    });
  };

  const updateStep = (index, field, value) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  // Ingredients handlers
  const addIngredient = () => {
    setIngredients((prev) => [...prev, { ...EMPTY_INGREDIENT }]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  // Images handlers
  const addImage = () => {
    setImages((prev) => [
      ...prev,
      { ...EMPTY_IMAGE, display_order: prev.length },
    ]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImage = (index, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      category: formData.category || null,
      product: formData.product || null,
      product_variant: formData.product_variant || null,
      prep_time: formData.prep_time ? parseInt(formData.prep_time) : null,
      steps: steps.filter((s) => s.instruction.trim()),
      ingredients: ingredients.filter((i) => i.name.trim()),
      images: images.filter((img) => img.image_url.trim()),
    };

    saveMutation.mutate(payload);
  };

  const categories = categoriesData?.results || categoriesData || [];
  const products = productsData?.results || productsData || [];
  const variants = variantsData?.results || variantsData || [];

  if (isEditing && loadingRecipe) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass = (field) =>
    `w-full px-4 py-2.5 backdrop-blur-sm bg-white/[0.09] border rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none ${
      errors[field] ? "border-red-500" : "border-white/[0.12]"
    }`;

  const selectClass =
    "w-full px-4 py-2.5 backdrop-blur-sm bg-[#1a1a2e] border border-white/[0.12] rounded-lg text-light focus:outline-none focus:border-secondary/50 [&>option]:bg-[#1a1a2e] [&>option]:text-light";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/recetarios")}
          className="flex items-center gap-2 text-gray hover:text-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        <h1 className="text-xl font-bold text-light">
          {isEditing ? "Editar Recetario" : "Nuevo Recetario"}
        </h1>
      </div>

      {/* Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-light">Informacion Basica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray mb-1">Nombre *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Granizado de Mango Biche"
              className={inputClass("name")}
              required
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray mb-1">Categoria</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="">Sin categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray mb-1">Dificultad</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="easy">Facil</option>
              <option value="medium">Media</option>
              <option value="hard">Dificil</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray mb-1">Producto vinculado</label>
            <select
              name="product"
              value={formData.product}
              onChange={(e) => {
                handleChange(e);
                setFormData((prev) => ({ ...prev, product_variant: "" }));
              }}
              className={selectClass}
            >
              <option value="">Sin producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {formData.product && variants.length > 0 && (
            <div>
              <label className="block text-sm text-gray mb-1">Variante</label>
              <select
                name="product_variant"
                value={formData.product_variant}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Sin variante</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray mb-1">
              Tiempo de preparacion (min)
            </label>
            <input
              name="prep_time"
              type="number"
              value={formData.prep_time}
              onChange={handleChange}
              placeholder="Ej: 5"
              className={inputClass("prep_time")}
            />
          </div>

          <div>
            <label className="block text-sm text-gray mb-1">Porciones</label>
            <input
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              placeholder="Ej: 1 vaso de 16oz"
              className={inputClass("servings")}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray mb-1">Descripcion</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descripcion breve de la receta..."
              className={inputClass("description")}
            />
          </div>

          <div>
            <label className="block text-sm text-gray mb-1">URL de imagen principal</label>
            <input
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass("image_url")}
            />
          </div>

          <div>
            <label className="block text-sm text-gray mb-1">URL de video</label>
            <input
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              className={inputClass("video_url")}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray mb-1">Tips y notas</label>
            <textarea
              name="tips"
              value={formData.tips}
              onChange={handleChange}
              rows={2}
              placeholder="Consejos para una mejor preparacion..."
              className={inputClass("tips")}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <label className="text-sm text-light">Activo</label>
          </div>
        </div>
      </motion.div>

      {/* Ingredients */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-light flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-secondary" />
            Ingredientes *
          </h2>
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {errors.ingredients && (
          <p className="text-red-400 text-sm">{errors.ingredients}</p>
        )}

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white/[0.04] rounded-lg p-3"
            >
              <input
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, "name", e.target.value)}
                placeholder="Nombre *"
                className="flex-1 px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
              />
              <input
                value={ingredient.quantity}
                onChange={(e) =>
                  updateIngredient(index, "quantity", e.target.value)
                }
                placeholder="Cantidad"
                className="w-full sm:w-28 px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
              />
              <input
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                placeholder="Unidad"
                className="w-full sm:w-24 px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
              />
              <label className="flex items-center gap-1 text-xs text-gray whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={ingredient.is_optional}
                  onChange={(e) =>
                    updateIngredient(index, "is_optional", e.target.checked)
                  }
                  className="w-3.5 h-3.5 rounded"
                />
                Opcional
              </label>
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-light flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-secondary" />
            Pasos de Preparacion *
          </h2>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {errors.steps && (
          <p className="text-red-400 text-sm">{errors.steps}</p>
        )}

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white/[0.04] rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {step.step_number}
                  </span>
                  Paso {step.step_number}
                </span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <textarea
                value={step.instruction}
                onChange={(e) =>
                  updateStep(index, "instruction", e.target.value)
                }
                placeholder="Instruccion del paso *"
                rows={2}
                className="w-full px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={step.tip}
                  onChange={(e) => updateStep(index, "tip", e.target.value)}
                  placeholder="Tip (opcional)"
                  className="px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
                />
                <input
                  value={step.image_url}
                  onChange={(e) =>
                    updateStep(index, "image_url", e.target.value)
                  }
                  placeholder="URL imagen (opcional)"
                  className="px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Gallery Images */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-light flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-secondary" />
            Galeria de Imagenes
          </h2>
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-gray text-center py-4">
            Sin imagenes adicionales
          </p>
        ) : (
          <div className="space-y-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white/[0.04] rounded-lg p-3"
              >
                <input
                  value={img.image_url}
                  onChange={(e) =>
                    updateImage(index, "image_url", e.target.value)
                  }
                  placeholder="URL de imagen *"
                  className="flex-1 px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
                />
                <input
                  value={img.caption}
                  onChange={(e) =>
                    updateImage(index, "caption", e.target.value)
                  }
                  placeholder="Descripcion"
                  className="w-full sm:w-40 px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/recetarios")}
          className="px-6 py-2.5 text-gray hover:text-light border border-white/[0.1] rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-dark font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? "Actualizar" : "Crear"} Recetario
        </button>
      </div>
    </form>
  );
};

export default RecetarioFormPage;
