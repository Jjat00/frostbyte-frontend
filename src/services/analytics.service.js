import { apiClient } from './api/client';

const BASE_URL = '/analytics/financial';

/**
 * Construye los params de negocio + mes ancla.
 * @param {string} [business] - Slug de negocio; vacio = consolidado
 * @param {{year:number, month:number}} [period] - Mes a consultar; vacio = mes actual
 */
const buildParams = (business, period) => ({
  ...(business ? { business } : {}),
  ...(period?.year && period?.month ? { year: period.year, month: period.month } : {}),
});

/**
 * Servicio para estadisticas financieras del dashboard ejecutivo
 */
export const analyticsService = {
  /**
   * Obtener KPIs principales: ingresos, gastos, ganancia neta, margen
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @param {{year:number, month:number}} [period] - Mes a consultar; vacio = mes actual
   * @returns {Promise<Object>} Resumen financiero del mes ancla vs anterior vs ano pasado
   */
  async getSummary(business, period) {
    const response = await apiClient.get(`${BASE_URL}/summary/`, {
      params: buildParams(business, period),
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
   * @param {{year:number, month:number}} [period] - Mes a consultar; vacio = mes actual
   * @returns {Promise<Object>} Gastos agrupados por categoria
   */
  async getExpensesBreakdown(business, period) {
    const response = await apiClient.get(`${BASE_URL}/expenses_breakdown/`, {
      params: buildParams(business, period),
    });
    return response.data;
  },

  /**
   * Obtener datos diarios del mes ancla
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @param {{year:number, month:number}} [period] - Mes a consultar; vacio = mes actual
   * @returns {Promise<Object>} Datos dia a dia
   */
  async getDailyTrend(business, period) {
    const response = await apiClient.get(`${BASE_URL}/daily_trend/`, {
      params: buildParams(business, period),
    });
    return response.data;
  },

  /**
   * Obtener comparacion del mes ancla vs el anterior y vs el ano pasado
   * @param {string} [business] - Slug de negocio; vacio = consolidado
   * @param {{year:number, month:number}} [period] - Mes a consultar; vacio = mes actual
   * @returns {Promise<Object>} Datos comparativos para bar chart
   */
  async getComparison(business, period) {
    const response = await apiClient.get(`${BASE_URL}/comparison/`, {
      params: buildParams(business, period),
    });
    return response.data;
  },

  /**
   * Desglose por negocio (Frostbyte vs Frostbyte Food) + consolidado.
   * @param {{year:number, month:number}} [period] - Mes a consultar; vacio = mes actual
   * @returns {Promise<Object>}
   */
  async getByBusiness(period) {
    const response = await apiClient.get(`${BASE_URL}/by_business/`, {
      params: buildParams(undefined, period),
    });
    return response.data;
  },
};

export default analyticsService;
