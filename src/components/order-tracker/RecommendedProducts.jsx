import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { publicOrdersService } from "@/services/publicOrders.service";

const RecommendedProducts = ({ excludeProducts = [] }) => {
  const { data: products } = useQuery({
    queryKey: ["popular-products"],
    queryFn: () => publicOrdersService.getPopularProducts(),
    staleTime: 5 * 60 * 1000,
  });

  // Filtrar productos que ya están en el pedido
  const excludeSet = new Set(excludeProducts.map((n) => n?.toLowerCase()));
  const filtered = (products || []).filter(
    (p) => !excludeSet.has(p.product_name?.toLowerCase())
  );

  if (filtered.length === 0) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-gray flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-secondary" />
        Recomendados
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {filtered.map((product, idx) => (
          <div
            key={idx}
            className="bg-dark-secondary/50 border border-gray/10 rounded-lg overflow-hidden"
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-20 md:h-24 object-cover"
              />
            ) : (
              <div className="w-full h-20 md:h-24 bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray/20" />
              </div>
            )}
            <div className="p-2">
              <p className="text-xs text-light font-medium truncate">
                {product.product_name}
              </p>
              <p className="text-xs text-secondary font-bold">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
