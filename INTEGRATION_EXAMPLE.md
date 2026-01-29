# Ejemplo de Integración: AI Image Generator + Product Form

## Opción 1: Botón en ProductFormPage

Agregar botón para navegar al generador desde el formulario de producto:

```jsx
// En ProductFormPage.jsx, después del ImageUpload
import { Sparkles } from 'lucide-react';

// Agregar dentro del formulario:
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray mb-2">
    Imagen del Producto
  </label>

  <ImageUpload
    value={formData.image_url}
    onChange={(url) => {
      setFormData((prev) => ({ ...prev, image_url: url }));
    }}
    error={errors.image_url}
    disabled={saveProductMutation.isPending}
  />

  {/* NUEVO: Botón para generar con IA */}
  <button
    type="button"
    onClick={() => {
      // Guardar estado actual en sessionStorage para recuperar después
      sessionStorage.setItem('productFormDraft', JSON.stringify(formData));
      navigate('/productos/generador-ia');
    }}
    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-secondary border border-secondary/30 text-secondary rounded-lg hover:bg-secondary/10 transition-all"
  >
    <Sparkles className="w-5 h-5" />
    <span>Generar Imagen con IA</span>
  </button>

  <p className="mt-2 text-xs text-gray text-center">
    Usa IA para crear una imagen profesional de tu producto
  </p>
</div>
```

## Opción 2: Modal Selector de Productos

Crear componente para seleccionar producto al guardar imagen generada:

```jsx
// src/components/ai-generator/ProductSelectorModal.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check } from 'lucide-react';
import { productsService } from '@/services/products.service';
import { cn } from '@/lib/utils';

export function ProductSelectorModal({ isOpen, onClose, onSelect, imageUrl }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll({ active_only: false }),
    enabled: isOpen,
  });

  const products = productsData?.results || [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-dark-secondary border border-gray/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray/20">
              <h3 className="text-xl font-bold text-light">
                Selecciona un Producto
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark border border-gray/20 rounded-lg text-light placeholder:text-gray focus:border-secondary/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Products list */}
            <div className="overflow-y-auto max-h-[400px] p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray mt-3">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray">No se encontraron productos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => onSelect(product)}
                      className="w-full flex items-center gap-4 p-4 bg-dark border border-gray/20 rounded-lg hover:border-secondary/50 transition-all group"
                    >
                      {/* Product image */}
                      <div className="w-16 h-16 flex-shrink-0 bg-dark-secondary rounded-lg overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 text-left">
                        <h4 className="text-light font-medium group-hover:text-secondary transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray line-clamp-1">
                          {product.description}
                        </p>
                      </div>

                      {/* Check icon */}
                      <Check className="w-5 h-5 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray/20">
              <p className="text-xs text-gray text-center">
                Selecciona un producto para reemplazar su imagen actual
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Usar en AIImageGeneratorPage:

```jsx
import { ProductSelectorModal } from '@/components/ai-generator/ProductSelectorModal';

// En AIImageGeneratorPage:
const [showProductSelector, setShowProductSelector] = useState(false);

const handleSaveToProduct = useCallback(() => {
  setShowProductSelector(true);
}, []);

const handleProductSelect = useCallback((product) => {
  saveToProduct({
    generationId: generatedData.id,
    productId: product.id,
  });
  setShowProductSelector(false);

  // Opcional: Navegar al producto
  navigate(`/productos/editar/${product.slug}`);
}, [generatedData, saveToProduct, navigate]);

// En el JSX:
<ProductSelectorModal
  isOpen={showProductSelector}
  onClose={() => setShowProductSelector(false)}
  onSelect={handleProductSelect}
  imageUrl={generatedData?.generated_image_url}
/>
```

## Opción 3: URL Params para retornar con imagen

Pasar la imagen generada de vuelta al formulario usando URL params:

```jsx
// En AIImageGeneratorPage, al completar generación:
const handleUseInProduct = () => {
  const imageUrl = generatedData.generated_image_url;
  const returnTo = sessionStorage.getItem('returnToProduct');

  if (returnTo) {
    navigate(`${returnTo}?imageUrl=${encodeURIComponent(imageUrl)}`);
    sessionStorage.removeItem('returnToProduct');
  } else {
    navigate(`/productos/nuevo?imageUrl=${encodeURIComponent(imageUrl)}`);
  }
};

// En ProductFormPage, recuperar imagen de URL:
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const imageUrl = searchParams.get('imageUrl');
  if (imageUrl) {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
    // Limpiar param de URL
    setSearchParams({});
  }
}, [searchParams, setSearchParams]);
```

## Opción 4: Context API para compartir estado

Crear contexto global para el flujo de generación:

```jsx
// src/contexts/AIImageContext.jsx
import { createContext, useContext, useState } from 'react';

const AIImageContext = createContext();

export function AIImageProvider({ children }) {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [returnPath, setReturnPath] = useState(null);

  const startGeneration = (fromPath) => {
    setReturnPath(fromPath);
  };

  const completeGeneration = (imageData) => {
    setGeneratedImage(imageData);
  };

  const clearGeneration = () => {
    setGeneratedImage(null);
    setReturnPath(null);
  };

  return (
    <AIImageContext.Provider
      value={{
        generatedImage,
        returnPath,
        startGeneration,
        completeGeneration,
        clearGeneration,
      }}
    >
      {children}
    </AIImageContext.Provider>
  );
}

export const useAIImage = () => useContext(AIImageContext);

// En App.jsx:
import { AIImageProvider } from '@/contexts/AIImageContext';

<AIImageProvider>
  <RouterProvider router={router} />
</AIImageProvider>

// En ProductFormPage:
import { useAIImage } from '@/contexts/AIImageContext';

const { generatedImage, startGeneration, clearGeneration } = useAIImage();

useEffect(() => {
  if (generatedImage) {
    setFormData(prev => ({ ...prev, image_url: generatedImage.url }));
    clearGeneration();
  }
}, [generatedImage, clearGeneration]);

// En AIImageGeneratorPage:
const { completeGeneration } = useAIImage();

const handleComplete = () => {
  completeGeneration(generatedData);
  navigate(-1); // Volver a página anterior
};
```

## Recomendación

Para Frostbyte, recomiendo usar **Opción 2 (Modal Selector)** + **Opción 3 (URL Params)** combinadas:

1. Desde ProductFormPage → Generador IA: Usar URL params para retornar
2. Desde Generador IA → Guardar existente: Usar modal selector
3. Mantener simplicidad sin Context API adicional

### Implementación Final Sugerida:

```jsx
// En AIImageGeneratorPage.jsx, actualizar GeneratedImageActions:

const [showProductSelector, setShowProductSelector] = useState(false);

<GeneratedImageActions
  imageUrl={generatedData.generated_image_url}
  generationId={generatedData.id}
  onDownload={handleDownload}
  onSaveToProduct={() => setShowProductSelector(true)}
  onRegenerate={handleRegenerate}
  onDiscard={handleDiscard}
  isSaving={isSaving}
/>

<ProductSelectorModal
  isOpen={showProductSelector}
  onClose={() => setShowProductSelector(false)}
  onSelect={(product) => {
    saveToProduct({
      generationId: generatedData.id,
      productId: product.id,
    });
    setShowProductSelector(false);
    navigate(`/productos/editar/${product.slug}`);
  }}
  imageUrl={generatedData?.generated_image_url}
/>
```

Esto proporciona:
- Flujo intuitivo para usuarios
- No requiere estado global complejo
- Fácil de mantener
- Funciona en ambos sentidos (crear nuevo / actualizar existente)
