import { apiClient } from '../api/client';

export const productService = {
  async getProducts(params = {}) {
    const res = await apiClient.get('/api/v1/products', { params });
    return res.data; // List of ProductResponse
  },

  async getProductById(id) {
    const res = await apiClient.get(`/api/v1/products/${id}`);
    return res.data; // ProductDetailResponse
  },

  async searchProducts(query) {
    const res = await apiClient.get('/api/v1/products/search', { params: { q: query } });
    return res.data;
  },

  async getInventory(productId) {
    const res = await apiClient.get(`/api/v1/inventory/${productId}`);
    return res.data;
  }
};
