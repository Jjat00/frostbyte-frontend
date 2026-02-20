import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { publicOrdersService } from "@/services/publicOrders.service";

const RecommendedProducts = () => {
  const { data: products } = useQuery({
    queryKey: ["popular-products"],
    queryFn: () => publicOrdersService.getPopularProducts(),
    staleTime: 5 * 60 * 1000,
  });

  if (!products || products.length === 0) return null;

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
      <div className="grid grid-cols-2 gap-2">
        {products.map((product, idx) => (
          <div
            key={idx}
            className="bg-dark-secondary/50 border border-gray/10 rounded-lg overflow-hidden"
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-20 object-cover"
              />
            ) : (
              <div className="w-full h-20 bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
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
