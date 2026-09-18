import { apiClient } from '../api/client';

export const categoryService = {
  async getCategories() {
    const res = await apiClient.get('/api/v1/categories');
    return res.data; // List of CategoryResponse
  },

  async getCategoryById(id) {
    const res = await apiClient.get(`/api/v1/categories/${id}`);
    return res.data;
  }
};
