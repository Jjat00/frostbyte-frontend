import { env } from "@/config/env";

const API_URL = env.API_BASE_URL;

export const publicOrdersService = {
  async verifyOrder(accessCode) {
    const response = await fetch(`${API_URL}/public-orders/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_code: accessCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Error al verificar pedido");
    }

    return response.json();
  },

  async getPopularProducts() {
    const response = await fetch(`${API_URL}/public-orders/popular-products/`);

    if (!response.ok) {
      throw new Error("Error al obtener productos populares");
    }

    return response.json();
  },
};
