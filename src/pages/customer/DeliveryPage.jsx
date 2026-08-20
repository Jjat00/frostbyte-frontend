import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Bike,
  Check,
  ChevronRight,
  ClipboardList,
  Lock,
  Search,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import {
  useActiveCategories,
  useProducts,
  useStoreConfig,
  useAddToCart,
  useCartaPath,
} from "@/hooks";
import { useCustomerAuthStore } from "@/stores/useCustomerAuthStore";
import { getProductStyles } from "@/lib/productStyles";
import StoreStatusBadge from "@/components/StoreStatusBadge";
import CartLayer from "@/components/cart/CartLayer";
import CustomerTabBar from "@/components/CustomerTabBar";
import DeliveryProductCard from "@/components/delivery/DeliveryProductCard";
import DeliveryLoginWall from "@/components/delivery/DeliveryLoginWall";
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
    className={`fb-pill whitespace-nowrap text-[0.68rem] ${
      done ? "border-secondary/35 text-light" : ""
    }`}
  >
    {done && <Check className="h-3 w-3 text-secondary" strokeWidth={2.5} />}
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
 * - Domicilios apagados (customer_ordering_enabled=false): la vista no existe
 *   y devuelve a la carta. Con el servicio en pausa no se nombra en ninguna
 *   parte (decisión de Jaime, 2026-08-20), así que tampoco por URL directa.
 */
const DeliveryPage = () => {
  const { data: config } = useStoreConfig();
  const isCustomerAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const add = useAddToCart();
  // Si el cliente vino del QR de una mesa, "volver a la carta" es volver a ella
  const { cartaPath } = useCartaPath();

  const inAppOrdering = !!config?.customer_ordering_enabled;
  const storeClosed = config?.is_open === false;
  // Pedir a domicilio exige cuenta desde el primer paso: sin sesión la tienda
  // no se abre (la vitrina no se pierde, la carta pública la muestra entera).
  const requiresLogin = !isCustomerAuthenticated;

  const { data: categoriesData } = useActiveCategories();
  // Sin sesión no se pinta el catálogo: tampoco se trae (son ~300 productos)
  const { data: productsData, isLoading } = useProducts(
    { page_size: 300 },
    { enabled: !requiresLogin }
  );

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("todo");
  const [picker, setPicker] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Barra superior propia, minimal y enfocada en pedir
  const topBar = (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.07] bg-dark/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2.5 px-3 sm:px-4">
        <Link
          to={cartaPath}
          aria-label="Volver a la carta"
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-white/[0.09] text-light/60 transition-colors hover:text-light"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-[10px] border border-secondary/20 bg-secondary/10">
          <Bike className="h-4 w-4 text-secondary" />
        </span>
        <h1 className="font-display text-[0.95rem] font-semibold uppercase leading-none tracking-[0.14em] text-light">
          Domicilios
        </h1>
        <StoreStatusBadge isOpen={config?.is_open} />
        {isCustomerAuthenticated && (
          <Link
            to="/mis-pedidos"
            className="fb-pill ml-auto flex-shrink-0"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mis pedidos</span>
          </Link>
        )}
      </div>
    </header>
  );

  // Servicio en pausa: aquí no hay nada que ver. Se espera a que llegue la
  // config para no rebotar a quien sí puede pedir.
  if (config && !inAppOrdering) {
    return <Navigate to={cartaPath} replace />;
  }

  // Muro: sin sesión la tienda no se abre (ni se carga el catálogo)
  if (requiresLogin) {
    return (
      <div className="fb-screen fb-screen--plain min-h-screen text-light">
        {topBar}
        <main className="mx-auto max-w-6xl px-3 sm:px-4 pt-[4.5rem] pb-40 md:pb-32">
          <DeliveryLoginWall storeClosed={storeClosed} />
        </main>
        <CustomerTabBar />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="fb-screen fb-screen--plain min-h-screen text-light">
      {topBar}

      {/* En móvil el fondo lo ocupan la barra de pestañas y, sobre ella, el
          carrito: hace falta más aire que en escritorio */}
      <main className="mx-auto max-w-6xl px-3 sm:px-4 pt-[4.5rem] pb-40 md:pb-32">
        {/* Estado del servicio */}
        {storeClosed ? (
          <section className="fb-card flex items-start gap-3 p-4">
            <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
            <div>
              <h2 className="font-display text-[0.88rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
                Estamos cerrados
              </h2>
              <p className="mt-1.5 text-[0.78rem] leading-relaxed text-light/55">
                No estamos recibiendo pedidos en este momento. Mira la carta y
                vuelve cuando el badge diga Abierto.
              </p>
            </div>
          </section>
        ) : (
          <section
            style={{ "--fb-accent": "var(--color-secondary)" }}
            className="fb-card fb-card--accent p-4 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-5"
          >
            <div>
              <span className="fb-eyebrow fb-eyebrow--accent block">
                Pide a domicilio
              </span>
              <h2 className="font-display m-0 mt-2 text-[1.05rem] font-semibold uppercase leading-tight tracking-[0.12em] text-light">
                Te lo llevamos a tu puerta
              </h2>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-light/55">
                Escoge lo que se te antoje y sigue el pedido hasta que llegue.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.68rem] text-light/40">
                {deliveryFee > 0 && <span>Envío {formatCOP(deliveryFee)}</span>}
                <span>Pagas al recibir</span>
                <span>Sigues tu pedido en vivo</span>
              </div>
            </div>
            <ol className="mt-3 lg:mt-0 flex flex-wrap items-center gap-x-1 gap-y-1.5 lg:flex-shrink-0">
              <li>
                <StepPill>1. Escoge tus productos</StepPill>
              </li>
              <ChevronRight className="h-3 w-3 text-light/25" aria-hidden />
              <li>
                <StepPill done={isCustomerAuthenticated}>
                  {isCustomerAuthenticated
                    ? "Cuenta conectada"
                    : "2. Confirma con Google"}
                </StepPill>
              </li>
              <ChevronRight className="h-3 w-3 text-light/25" aria-hidden />
              <li>
                <StepPill>3. Te lo llevamos</StepPill>
              </li>
            </ol>
          </section>
        )}

        {/* Búsqueda */}
        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-light/30"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué se te antoja hoy?"
            aria-label="Buscar productos"
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] py-3 pl-10 pr-10 text-[0.9rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-white/[0.1] text-light/50 transition-colors hover:text-light"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Chips de categorías (pegajosos bajo la barra superior) */}
        <div className="sticky top-14 z-30 -mx-3 border-b border-white/[0.06] bg-dark/95 px-3 py-2.5 sm:-mx-4 sm:px-4">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveCat("todo")}
              className={`fb-pill flex-shrink-0 cursor-pointer whitespace-nowrap ${
                activeCat === "todo"
                  ? "border-secondary/40 bg-secondary/10 text-light"
                  : ""
              }`}
            >
              Todo
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActiveCat(c.slug)}
                className={`fb-pill flex-shrink-0 cursor-pointer whitespace-nowrap ${
                  activeCat === c.slug
                    ? "border-secondary/40 bg-secondary/10 text-light"
                    : ""
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        {isLoading ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="fb-card animate-pulse overflow-hidden"
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
            <p className="text-[0.82rem] text-light/50">
              {query.trim()
                ? `No encontramos nada con "${query.trim()}".`
                : "No hay productos disponibles por ahora."}
            </p>
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="fb-pill mt-3 cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          sections.map(({ category, products: catProducts }) => (
            <section key={category.slug} className="mt-5">
              <h2 className="font-display mb-2.5 text-[0.88rem] font-semibold uppercase tracking-[0.12em] text-light">
                {category.name}
                <span className="ml-2 text-[0.65rem] font-normal normal-case tracking-normal text-light/30">
                  {catProducts.length} producto
                  {catProducts.length === 1 ? "" : "s"}
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
      <CustomerTabBar />
      <Toaster />
    </div>
  );
};

export default DeliveryPage;
