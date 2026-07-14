import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  Check,
  ChevronRight,
  ClipboardList,
  Lock,
  MessageCircle,
  Search,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useActiveCategories, useProducts, useStoreConfig, useAddToCart } from "@/hooks";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { getProductStyles } from "@/lib/productStyles";
import { WHATSAPP_LINES, waLink } from "@/lib/domicilios";
import StoreStatusBadge from "@/components/StoreStatusBadge";
import CartLayer from "@/components/cart/CartLayer";
import DeliveryProductCard from "@/components/delivery/DeliveryProductCard";
import VariantPickerSheet from "@/components/delivery/VariantPickerSheet";

const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v || 0);

// Normaliza para buscar sin acentos ni mayúsculas
const norm = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const StepPill = ({ done, children }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
      done
        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
        : "border-white/10 bg-white/5 text-white/70"
    }`}
  >
    {done && <Check className="w-3 h-3" strokeWidth={3} />}
    {children}
  </span>
);

/**
 * Vista dedicada de pedidos a domicilio (/domicilios).
 *
 * Es la tienda del cliente: grid de productos con fotos y precios, búsqueda,
 * categorías, y barra de carrito fija que lleva al checkout existente
 * (CartLayer → CartDrawer → CheckoutSheet). La carta en "/" sigue siendo la
 * vitrina; aquí se viene a PEDIR.
 *
 * Estados:
 * - Local cerrado (is_open=false): aviso claro y catálogo sin botones.
 * - Domicilios en la app apagados (customer_ordering_enabled=false): modo
 *   WhatsApp — catálogo visible y pedidos por las líneas de siempre.
 */
const DeliveryPage = () => {
  const { data: config } = useStoreConfig();
  const { data: categoriesData } = useActiveCategories();
  const { data: productsData, isLoading } = useProducts({ page_size: 300 });
  const isCustomerAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const add = useAddToCart();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("todo");
  const [picker, setPicker] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const inAppOrdering = !!config?.customer_ordering_enabled;
  const storeClosed = config?.is_open === false;
  const canOrder = !!config?.can_order;
  const deliveryFee = Number(config?.delivery_fee || 0);

  // Solo productos activos con variantes activas: el backend rechaza
  // variantes inactivas al crear el pedido, así que no se deben ofrecer.
  const products = useMemo(
    () =>
      (productsData?.results || [])
        .filter((p) => p.is_active !== false)
        .map((p) => ({
          ...p,
          variants: (p.variants || []).filter((v) => v.is_active !== false),
        }))
        .filter((p) => p.variants.length > 0),
    [productsData]
  );

  const productsByCategory = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const slug = p.category_slug || "otros";
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug).push(p);
    });
    return map;
  }, [products]);

  // Categorías activas ordenadas que sí tienen productos pedibles
  const categories = useMemo(() => {
    const list = categoriesData?.results || [];
    return [...list]
      .filter((c) => c.is_active !== false && productsByCategory.has(c.slug))
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [categoriesData, productsByCategory]);

  // Secciones visibles según categoría activa y búsqueda
  const sections = useMemo(() => {
    const q = norm(query.trim());
    const matches = (p) =>
      !q || norm(p.name).includes(q) || norm(p.description || "").includes(q);
    return categories
      .filter((c) => activeCat === "todo" || c.slug === activeCat)
      .map((c) => ({
        category: c,
        products: (productsByCategory.get(c.slug) || []).filter(matches),
      }))
      .filter((s) => s.products.length > 0);
  }, [categories, productsByCategory, activeCat, query]);

  const totalVisible = sections.reduce((n, s) => n + s.products.length, 0);

  // 1 variante agrega directo; varias abren el selector de tamaño
  const handleAdd = (product) => {
    const variants = product.variants || [];
    if (variants.length === 1) {
      add(variants[0], product);
    } else {
      setPicker(product);
    }
  };

  const pickerImage = picker
    ? getProductStyles(picker, picker.category_slug).image
    : null;

  return (
    <div className="min-h-screen bg-dark text-light">
      {/* Barra superior propia, minimal y enfocada en pedir */}
      <header className="fixed top-0 inset-x-0 z-40 bg-dark/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2.5 px-3 sm:px-4">
          <Link
            to="/"
            aria-label="Volver a la carta"
            className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/70 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-dark flex-shrink-0">
            <Bike className="w-4 h-4" />
          </span>
          <h1 className="text-lg font-black uppercase tracking-wide leading-none">
            Domicilios
          </h1>
          <StoreStatusBadge isOpen={config?.is_open} />
          {isCustomerAuthenticated && inAppOrdering && (
            <Link
              to="/mis-pedidos"
              className="ml-auto flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs font-bold text-gold flex-shrink-0"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mis pedidos</span>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 sm:px-4 pt-[4.5rem] pb-32">
        {/* Estado del servicio */}
        {storeClosed ? (
          <section className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-black uppercase text-red-300 leading-tight">
                Estamos cerrados
              </h2>
              <p className="text-white/60 text-sm mt-1">
                No estamos recibiendo pedidos en este momento. Mira la carta y
                vuelve cuando el badge diga Abierto.
              </p>
            </div>
          </section>
        ) : inAppOrdering ? (
          <section className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.12] via-dark-secondary to-dark-secondary p-4">
            <h2 className="text-xl font-black uppercase leading-tight">
              Pide a domicilio <span className="text-emerald-400">en la app</span>
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Escoge lo que se te antoje y te lo llevamos hasta tu puerta.
            </p>
            <ol className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1.5">
              <li>
                <StepPill>1. Escoge tus productos</StepPill>
              </li>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" aria-hidden />
              <li>
                <StepPill done={isCustomerAuthenticated}>
                  {isCustomerAuthenticated
                    ? "Cuenta conectada"
                    : "2. Confirma con Google"}
                </StepPill>
              </li>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" aria-hidden />
              <li>
                <StepPill>3. Te lo llevamos</StepPill>
              </li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/45 font-semibold">
              {deliveryFee > 0 && <span>Envío {formatCOP(deliveryFee)}</span>}
              <span>Pagas al recibir</span>
              <span>Sigues tu pedido en vivo</span>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.12] via-dark-secondary to-dark-secondary p-4">
            <h2 className="text-xl font-black uppercase leading-tight">
              Domicilios <span className="text-emerald-400">por WhatsApp</span>
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Muy pronto podrás pedir directo aquí en la app. Por ahora, mira el
              catálogo y pide por nuestra línea de WhatsApp:
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {WHATSAPP_LINES.map((line) => (
                <a
                  key={line.number}
                  href={waLink(line.number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-bold text-sm hover:bg-emerald-500/25 active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  {line.display}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Búsqueda */}
        <div className="relative mt-4">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué se te antoja hoy?"
            aria-label="Buscar productos"
            className="w-full rounded-2xl bg-white/[0.05] border border-white/[0.1] pl-10 pr-10 py-3 text-base text-light placeholder:text-white/30 focus:outline-none focus:border-emerald-400/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chips de categorías (pegajosos bajo la barra superior) */}
        <div className="sticky top-14 z-30 -mx-3 sm:-mx-4 bg-dark/95 backdrop-blur-md px-3 sm:px-4 py-2.5 border-b border-white/[0.06]">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveCat("todo")}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                activeCat === "todo"
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600 text-dark"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              Todo
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActiveCat(c.slug)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                  activeCat === c.slug
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-600 text-dark"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        {isLoading ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-white/[0.05]" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-white/[0.07]" />
                  <div className="h-3.5 w-1/2 rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        ) : totalVisible === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-white/50 text-sm">
              {query.trim()
                ? `No encontramos nada con "${query.trim()}".`
                : "No hay productos disponibles por ahora."}
            </p>
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          sections.map(({ category, products: catProducts }) => (
            <section key={category.slug} className="mt-5">
              <h2 className="text-base font-black uppercase tracking-wide text-light mb-2.5">
                {category.name}
                <span className="ml-2 text-[11px] font-semibold text-white/30 normal-case tracking-normal">
                  {catProducts.length} producto
                  {catProducts.length === 1 ? "" : "s"}
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {catProducts.map((product) => (
                  <DeliveryProductCard
                    key={product.id}
                    product={product}
                    canOrder={canOrder}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Selector de tamaño para productos con varias variantes */}
      <VariantPickerSheet
        product={picker}
        image={pickerImage}
        open={!!picker}
        onClose={() => setPicker(null)}
        onAdd={(variant) => {
          add(variant, picker);
          setPicker(null);
        }}
      />

      {/* Flujo de pedido completo: barra de carrito → carrito → checkout */}
      <CartLayer />
      <Toaster />
    </div>
  );
};

export default DeliveryPage;
