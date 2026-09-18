import { apiClient } from '../api/client';

export const cartService = {
  async getCart() {
    const res = await apiClient.get('/api/v1/cart');
    return res.data; // CartResponse { items, subtotal, delivery_fee, total }
  },

  async addItem(itemData) {
    const res = await apiClient.post('/api/v1/cart/items', itemData);
    return res.data;
  },

  async updateItemQuantity(itemId, quantity) {
    const res = await apiClient.patch(`/api/v1/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeItem(itemId) {
    const res = await apiClient.delete(`/api/v1/cart/items/${itemId}`);
    return res.data;
  },

  async clearCart() {
    const res = await apiClient.delete('/api/v1/cart');
    return res.data;
  }
};
