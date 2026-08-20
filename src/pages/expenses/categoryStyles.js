import {
  Users,
  Zap,
  Home,
  Wrench,
  TrendingUp,
  CheckCircle,
  Wallet,
  Monitor,
  Armchair,
  HardHat,
} from "lucide-react";

/**
 * Iconos y colores de las categorias de gasto.
 * Vive aparte porque lo usan todas las pantallas del modulo y antes estaba
 * copiado en seis archivos.
 */
export const ICON_MAP = {
  Users: Users,
  Zap: Zap,
  Home: Home,
  Wrench: Wrench,
  Megaphone: TrendingUp,
  Shield: CheckCircle,
  FileText: Wallet,
  Package: Wallet,
  MoreHorizontal: Wallet,
  // Inversion
  Monitor: Monitor,
  Armchair: Armchair,
  HardHat: HardHat,
};

export const COLOR_MAP = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

/**
 * Los dos tipos de salida de dinero.
 * El gasto corriente resta del margen del mes; la inversion no, porque compra
 * algo que dura. Separarlos es lo que permite leer el margen sin interpretarlo.
 */
export const KINDS = {
  operational: {
    value: "operational",
    label: "Gasto corriente",
    short: "Gasto",
    description: "Se consume en el mes: nomina, servicios, arriendo, insumos.",
    badge: "bg-white/[0.08] text-gray border-white/[0.12]",
    accent: "text-gray",
  },
  investment: {
    value: "investment",
    label: "Inversion",
    short: "Inversion",
    description: "Compra algo que dura: equipos, mobiliario, montaje del local.",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    accent: "text-indigo-300",
  },
};

export const KIND_LIST = [KINDS.operational, KINDS.investment];

export const kindMeta = (kind) => KINDS[kind] || KINDS.operational;
