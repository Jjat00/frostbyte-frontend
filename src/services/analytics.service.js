import { apiClient } from './api/client';

const BASE_URL = '/analytics/financial';

/**
 * Servicio para estadisticas financieras del dashboard ejecutivo
 */
export const analyticsService = {
  /**
   * Obtener KPIs principales: ingresos, gastos, ganancia neta, margen
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @returns {Promise<Object>} Resumen financiero del mes actual vs anterior
   */
  async getSummary(business) {
    const response = await apiClient.get(`${BASE_URL}/summary/`, {
      params: business ? { business } : {},
    });
    return response.data;
  },

  /**
   * Obtener datos mensuales para grafica de lineas
   * @param {number} months - Cantidad de meses a consultar (default 12)
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @returns {Promise<Object>} Datos mes a mes
   */
  async getMonthlyTrend(months = 12, business) {
    const response = await apiClient.get(`${BASE_URL}/monthly_trend/`, {
      params: { months, ...(business ? { business } : {}) },
    });
    return response.data;
  },

  /**
   * Obtener desglose de gastos por categoria para pie chart
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @returns {Promise<Object>} Gastos agrupados por categoria
   */
  async getExpensesBreakdown(business) {
    const response = await apiClient.get(`${BASE_URL}/expenses_breakdown/`, {
      params: business ? { business } : {},
    });
    return response.data;
  },

  /**
   * Obtener datos diarios del mes actual
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @returns {Promise<Object>} Datos dia a dia
   */
  async getDailyTrend(business) {
    const response = await apiClient.get(`${BASE_URL}/daily_trend/`, {
      params: business ? { business } : {},
    });
    return response.data;
  },

  /**
   * Obtener comparacion entre este mes y el anterior
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @returns {Promise<Object>} Datos comparativos para bar chart
   */
  async getComparison(business) {
    const response = await apiClient.get(`${BASE_URL}/comparison/`, {
      params: business ? { business } : {},
    });
    return response.data;
  },

  /**
   * Desglose por negocio (Frostbyte vs Frostbyte Food) + consolidado.
   * @param {number} [monthsOffset] - 0 = mes actual, 1 = mes anterior, ...
   * @returns {Promise<Object>}
   */
  async getByBusiness(monthsOffset = 0) {
    const response = await apiClient.get(`${BASE_URL}/by_business/`, {
      params: monthsOffset ? { months_offset: monthsOffset } : {},
    });
    return response.data;
  },
};

export default analyticsService;
