import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services';

/**
 * Query keys para productos
 */
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (slug) => [...productKeys.details(), slug],
  byCategory: (categorySlug) => [...productKeys.all, 'category', categorySlug],
};

/**
 * Hook para obtener todos los productos
 * @param {Object} options - Opciones adicionales para useQuery
 */
export function useProducts(params = {}, options = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  });
}

/**
 * Hook para obtener un producto por slug
 * @param {string} slug - Slug del producto
 * @param {Object} options - Opciones adicionales para useQuery
 */
export function useProduct(slug, options = {}) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook para obtener productos por categoría
 * @param {string} categorySlug - Slug de la categoría
 * @param {Object} options - Opciones adicionales para useQuery
 */
export function useProductsByCategory(categorySlug, options = {}) {
  return useQuery({
    queryKey: productKeys.byCategory(categorySlug),
    queryFn: () => productsService.getByCategory(categorySlug),
    enabled: !!categorySlug,
    staleTime: 30 * 60 * 1000, // 30 minutos - productos del menú público cambian poco
    ...options,
  });
}

