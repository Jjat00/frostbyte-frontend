import { apiClient } from './api/client';

const BASE_URL = '/expenses';

export const expensesService = {
  // ============= CATEGORIES =============

  async getCategories(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/categories/`, { params });
    return response.data;
  },

  async getCategory(slug) {
    const response = await apiClient.get(`${BASE_URL}/categories/${slug}/`);
    return response.data;
  },

  async createCategory(data) {
    const response = await apiClient.post(`${BASE_URL}/categories/`, data);
    return response.data;
  },

  async updateCategory(slug, data) {
    const response = await apiClient.patch(`${BASE_URL}/categories/${slug}/`, data);
    return response.data;
  },

  async deleteCategory(slug) {
    const response = await apiClient.delete(`${BASE_URL}/categories/${slug}/`);
    return response.data;
  },

  // ============= EXPENSES =============

  async getExpenses(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/`, { params });
    return response.data;
  },

  async getExpense(id) {
    const response = await apiClient.get(`${BASE_URL}/${id}/`);
    return response.data;
  },

  async createExpense(data) {
    const response = await apiClient.post(`${BASE_URL}/`, data);
    return response.data;
  },

  async updateExpense(id, data) {
    const response = await apiClient.patch(`${BASE_URL}/${id}/`, data);
    return response.data;
  },

  async deleteExpense(id) {
    const response = await apiClient.delete(`${BASE_URL}/${id}/`);
    return response.data;
  },

  async markExpenseAsPaid(id, paymentMethod = '') {
    const response = await apiClient.post(`${BASE_URL}/${id}/mark_paid/`, {
      payment_method: paymentMethod,
    });
    return response.data;
  },

  async cancelExpense(id) {
    const response = await apiClient.post(`${BASE_URL}/${id}/cancel/`);
    return response.data;
  },

  async getExpenseStats(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/stats/`, { params });
    return response.data;
  },

  async getPendingExpenses(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/pending/`, { params });
    return response.data;
  },

  async getExpensesByDay(date = 'month') {
    const response = await apiClient.get(`${BASE_URL}/by_day/`, { params: { date } });
    return response.data;
  },

  // ============= RECURRING =============

  async getRecurringTemplates(params = {}) {
    const response = await apiClient.get(`${BASE_URL}/recurring/`, { params });
    return response.data;
  },

  async getRecurringTemplate(id) {
    const response = await apiClient.get(`${BASE_URL}/recurring/${id}/`);
    return response.data;
  },

  async createRecurringTemplate(data) {
    const response = await apiClient.post(`${BASE_URL}/recurring/`, data);
    return response.data;
  },

  async updateRecurringTemplate(id, data) {
    const response = await apiClient.patch(`${BASE_URL}/recurring/${id}/`, data);
    return response.data;
  },

  async deleteRecurringTemplate(id) {
    const response = await apiClient.delete(`${BASE_URL}/recurring/${id}/`);
    return response.data;
  },

  async generateFromTemplate(id, expenseDate = null) {
    const data = expenseDate ? { expense_date: expenseDate } : {};
    const response = await apiClient.post(`${BASE_URL}/recurring/${id}/generate/`, data);
    return response.data;
  },

  async generateAllDue() {
    const response = await apiClient.post(`${BASE_URL}/recurring/generate_all_due/`);
    return response.data;
  },

  async getDueSoon(days = 7) {
    const response = await apiClient.get(`${BASE_URL}/recurring/due_soon/`, { params: { days } });
    return response.data;
  },
};
