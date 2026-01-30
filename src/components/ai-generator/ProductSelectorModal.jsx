import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Package, Check, Loader2, ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { cn } from '@/lib/utils';

/**
 * Modal para seleccionar un producto existente
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {Function} props.onSelect - Callback cuando se selecciona un producto (recibe productId)
 * @param {boolean} props.isLoading - Si está procesando la selección
 * @param {string} props.generatedImageUrl - URL de la imagen generada para preview
 */
export function ProductSelectorModal({
  isOpen,
  onClose,
  onSelect,
  isLoading = false,
  generatedImageUrl,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Fetch products
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsService.getAll({ page_size: 100 }),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.results || [];

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category_name?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedProductId(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedProductId) {
      onSelect(selectedProductId);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onClose()}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                       md:w-full md:max-w-2xl md:max-h-[80vh]
                       bg-dark-secondary border border-gray/20 rounded-xl shadow-2xl z-50
                       flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray/20">
              <div>
                <h2 className="text-lg font-bold text-light">
                  Asignar imagen a producto
                </h2>
                <p className="text-sm text-gray">
                  Selecciona el producto que recibirá esta imagen
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview of generated image */}
            {generatedImageUrl && (
              <div className="px-4 pt-4">
                <div className="bg-dark rounded-lg p-3 flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-secondary"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a), linear-gradient(45deg, #2a2a2a 25%, transparent 25%, transparent 75%, #2a2a2a 75%, #2a2a2a)',
                      backgroundPosition: '0 0, 5px 5px',
                      backgroundSize: '10px 10px',
                    }}
                  >
                    <img
                      src={generatedImageUrl}
                      alt="Imagen a asignar"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light">
                      Imagen generada con IA
                    </p>
                    <p className="text-xs text-gray">
                      Esta imagen se asignará al producto seleccionado
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar producto por nombre o categoría..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark border border-gray/20 rounded-lg
                           text-light placeholder:text-gray focus:outline-none focus:border-secondary/50"
                />
              </div>
            </div>

            {/* Products list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-secondary animate-spin" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-12 h-12 text-gray/50 mb-3" />
                  <p className="text-gray">
                    {searchTerm
                      ? 'No se encontraron productos'
                      : 'No hay productos disponibles'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProductId(product.id)}
                      disabled={isLoading}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                        'hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed',
                        selectedProductId === product.id
                          ? 'border-secondary bg-secondary/10'
                          : 'border-gray/20 bg-dark/50'
                      )}
                    >
                      {/* Product image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-dark-secondary flex items-center justify-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray/50" />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-light truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray truncate">
                          {product.category_name || 'Sin categoría'}
                        </p>
                      </div>

                      {/* Selection indicator */}
                      {selectedProductId === product.id && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-dark" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray/20 bg-dark/50">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedProductId || isLoading}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 rounded-lg font-semibold',
                  'transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                  'bg-gradient-to-r from-secondary to-primary text-dark',
                  'hover:shadow-lg hover:shadow-secondary/30'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Asignar imagen</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ProductSelectorModal;
