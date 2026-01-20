import { apiClient } from './api/client';

const BASE_URL = '/analytics/financial';

/**
 * Servicio para estadisticas financieras del dashboard ejecutivo
 */
export const analyticsService = {
  /**
   * Obtener KPIs principales: ingresos, gastos, ganancia neta, margen
   * @returns {Promise<Object>} Resumen financiero del mes actual vs anterior
   */
  async getSummary() {
    const response = await apiClient.get(`${BASE_URL}/summary/`);
    return response.data;
  },

  /**
   * Obtener datos mensuales para grafica de lineas
   * @param {number} months - Cantidad de meses a consultar (default 12)
   * @returns {Promise<Object>} Datos mes a mes
   */
  async getMonthlyTrend(months = 12) {
    const response = await apiClient.get(`${BASE_URL}/monthly_trend/`, {
      params: { months }
    });
    return response.data;
  },

  /**
   * Obtener desglose de gastos por categoria para pie chart
   * @returns {Promise<Object>} Gastos agrupados por categoria
   */
  async getExpensesBreakdown() {
    const response = await apiClient.get(`${BASE_URL}/expenses_breakdown/`);
    return response.data;
  },

  /**
   * Obtener datos diarios del mes actual
   * @returns {Promise<Object>} Datos dia a dia
   */
  async getDailyTrend() {
    const response = await apiClient.get(`${BASE_URL}/daily_trend/`);
    return response.data;
  },

  /**
   * Obtener comparacion entre este mes y el anterior
   * @returns {Promise<Object>} Datos comparativos para bar chart
   */
  async getComparison() {
    const response = await apiClient.get(`${BASE_URL}/comparison/`);
    return response.data;
  },
};

export default analyticsService;
