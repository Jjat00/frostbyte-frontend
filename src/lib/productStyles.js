/**
 * Mapeo de estilos visuales para productos
 * Los estilos (iconos, gradientes, imágenes) son preocupaciones de presentación
 * que se mantienen en el frontend para flexibilidad visual
 */
import {
  Citrus,
  Moon,
  Cherry,
  Coffee,
  Cookie,
  Candy,
  Beer,
  Sparkles,
  Crown,
  Wine,
  Martini,
  Flame,
  Anchor,
  GlassWater,
  Grape,
  Apple,
} from "lucide-react";

/**
 * Estilos por defecto para productos de cada categoría
 */
const categoryDefaults = {
  granizados: {
    icon: Citrus,
    gradient: "from-cyan-400 to-blue-500",
    visualGradient: "from-cyan-300 via-blue-400 to-indigo-500",
    secondaryGradient: "from-transparent via-cyan-200/20 to-transparent",
    accentColor: "primary",
  },
  frappes: {
    icon: Coffee,
    gradient: "from-amber-700 to-orange-900",
    accentColor: "secondary",
  },
  micheladas: {
    icon: Beer,
    gradient: "from-orange-400 to-red-500",
    accentColor: "orange",
  },
  shots: {
    icon: Wine,
    gradient: "from-purple-400 to-pink-500",
    accentColor: "primary",
  },
  cervezas: {
    icon: Beer,
    gradient: "from-yellow-400 to-amber-500",
    accentColor: "amber",
  },
  vinos: {
    icon: Wine,
    gradient: "from-red-600 to-purple-700",
    accentColor: "red",
  },
  mocktails: {
    icon: GlassWater,
    gradient: "from-pink-400 to-rose-500",
    accentColor: "pink",
  },
};

/**
 * Estilos específicos por producto (basado en slug o nombre)
 */
const productStyles = {
  // Granizados
  "mango-biche": {
    icon: Citrus,
    gradient: "from-lime-400 to-green-600",
    visualGradient: "from-lime-300 via-green-400 to-emerald-500",
    secondaryGradient: "from-transparent via-lime-200/20 to-transparent",
  },
  "mango-biche-con-alcohol": {
    icon: Citrus,
    gradient: "from-lime-400 to-green-600",
    visualGradient: "from-lime-300 via-green-400 to-emerald-500",
    secondaryGradient: "from-transparent via-lime-200/20 to-transparent",
  },
  maracuya: {
    icon: Citrus,
    gradient: "from-yellow-300 to-orange-400",
    visualGradient: "from-yellow-400 via-amber-500 to-orange-400",
    secondaryGradient: "from-transparent via-yellow-300/20 to-transparent",
  },
  cereza: {
    icon: Cherry,
    gradient: "from-red-500 to-pink-600",
    visualGradient: "from-red-400 via-rose-500 to-pink-600",
    secondaryGradient: "from-transparent via-red-300/20 to-transparent",
  },
  "maracumango-con-alcohol": {
    icon: Citrus,
    gradient: "from-amber-400 to-orange-600",
    visualGradient: "from-yellow-400 via-amber-500 to-orange-500",
    secondaryGradient: "from-transparent via-amber-300/20 to-transparent",
  },
  "granizado-con-alcohol-de-maracuya": {
    icon: Citrus,
    gradient: "from-yellow-300 to-orange-400",
    visualGradient: "from-yellow-400 via-amber-500 to-orange-400",
    secondaryGradient: "from-transparent via-yellow-300/20 to-transparent",
  },
  lulo: {
    icon: Moon,
    gradient: "from-green-300 to-lime-500",
    visualGradient: "from-emerald-300 via-green-400 to-lime-400",
    secondaryGradient: "from-transparent via-green-200/20 to-transparent",
  },
  fresa: {
    icon: Cherry,
    gradient: "from-red-400 to-pink-500",
    visualGradient: "from-red-300 via-pink-400 to-rose-500",
    secondaryGradient: "from-transparent via-red-200/20 to-transparent",
  },

  // Frappés
  cafe: {
    icon: Coffee,
    gradient: "from-amber-700 to-orange-900",
    image:
      "https://i.pinimg.com/736x/31/66/96/316696f0392db53f35113671157c49c0.jpg",
  },
  oreo: {
    icon: Cookie,
    gradient: "from-slate-700 to-black",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699",
    hasOptions: true,
  },
  "fresa-frappe": {
    icon: Cherry,
    gradient: "from-red-500 to-pink-600",
    image:
      "https://d1uz88p17r663j.cloudfront.net/original/627ca9b9fa1544e1da395162aa87c505_FRAPPE_DE_FRESA_CON_LECHERA.jpg",
  },
  brownie: {
    icon: Candy,
    gradient: "from-amber-900 to-amber-950",
    image: "https://images.unsplash.com/photo-1494825980858-804c1fcf906b",
    hasOptions: true,
  },

  // Micheladas
  "michelada-poker": {
    icon: Beer,
    gradient: "from-yellow-500 to-amber-600",
    image: "/cerveza-poker.jpg",
  },
  "michelada-budweiser": {
    icon: Sparkles,
    gradient: "from-red-500 to-red-700",
    image: "/2dff99a28b761aa32527776df5e1c4a7.jpg",
  },
  "michelada-corona": {
    icon: Crown,
    gradient: "from-yellow-300 to-yellow-500",
    image: "/cerveza-corona.png",
  },

  // Shots
  "ginebra-beefeater": {
    icon: Martini,
    gradient: "from-blue-400 to-blue-600",
    image: "/71HDqEEMOfL._AC_UF894,1000_QL80_.jpg",
    brand: "Beefeater",
    licor: "London Dry 24",
  },
  "vodka-absolut": {
    icon: Wine,
    gradient: "from-sky-300 to-sky-500",
    image: "/istockphoto-466140656-612x612.jpg",
    brand: "Absolut",
    licor: "Original",
  },
  "whisky-jack-daniels": {
    icon: Flame,
    gradient: "from-amber-500 to-amber-700",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400",
    brand: "Jack Daniels",
    licor: "Tennessee Honey",
  },
  "tequila-jose-cuervo": {
    icon: Citrus,
    gradient: "from-yellow-400 to-orange-500",
    image: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400",
    brand: "Jose Cuervo",
    licor: "Especial Reposado",
  },
  "ron-bacardi": {
    icon: Anchor,
    gradient: "from-red-500 to-red-700",
    image: "/080480015206.jpg",
    brand: "Bacardi",
    licor: "Superior",
  },
  "aguardiente-narino": {
    icon: Flame,
    gradient: "from-slate-400 to-slate-600",
    image: "/narino_premium.jpeg",
    brand: "Nariño",
    licor: "Premium Sin Azúcar",
  },
};

/**
 * Obtener estilos para un producto
 * @param {Object} product - Producto de la API
 * @param {string} categorySlug - Slug de la categoría
 * @returns {Object} Estilos del producto
 */
export function getProductStyles(product, categorySlug) {
  // Primero buscar estilos específicos del producto
  const specificStyles = productStyles[product.slug] || {};

  // Luego obtener defaults de la categoría
  const categoryStyles = categoryDefaults[categorySlug] || {};

  // Combinar: específicos > categoría > defaults generales
  return {
    icon: specificStyles.icon || categoryStyles.icon || Citrus,
    gradient:
      specificStyles.gradient ||
      categoryStyles.gradient ||
      "from-gray-400 to-gray-600",
    visualGradient:
      specificStyles.visualGradient || categoryStyles.visualGradient,
    secondaryGradient:
      specificStyles.secondaryGradient || categoryStyles.secondaryGradient,
    image: specificStyles.image || product.image_url || null,
    hasOptions: specificStyles.hasOptions || false,
    brand: specificStyles.brand,
    licor: specificStyles.licor,
    accentColor: categoryStyles.accentColor || "primary",
  };
}

/**
 * Obtener estilos de categoría
 * @param {string} categorySlug - Slug de la categoría
 * @returns {Object} Estilos de la categoría
 */
export function getCategoryStyles(categorySlug) {
  return categoryDefaults[categorySlug] || categoryDefaults.granizados;
}

export { productStyles, categoryDefaults };
