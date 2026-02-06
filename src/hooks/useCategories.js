import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services';

/**
 * Query keys para categorías
 */
export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  active: () => [...categoryKeys.all, 'active'],
  details: () => [...categoryKeys.all, 'detail'],
  detail: (slug) => [...categoryKeys.details(), slug],
};

/**
 * Hook para obtener todas las categorías
 * @param {Object} options - Opciones adicionales para useQuery
 */
export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutos (las categorías cambian poco)
    ...options,
  });
}

/**
 * Hook para obtener solo las categorías activas (para la carta pública)
 * @param {Object} options - Opciones adicionales para useQuery
 */
export function useActiveCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.active(),
    queryFn: () => categoriesService.getAll({ active_only: true }),
    staleTime: 30 * 60 * 1000, // 30 minutos - categorías cambian poco
    ...options,
  });
}

/**
 * Hook para obtener una categoría por slug con sus productos
 * @param {string} slug - Slug de la categoría
 * @param {Object} options - Opciones adicionales para useQuery
 */
export function useCategory(slug, options = {}) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => categoriesService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

