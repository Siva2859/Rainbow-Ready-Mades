import { apiClient } from '../api/client';

export const orderService = {
  async createOrder(orderData) {
    const res = await apiClient.post('/api/v1/orders', orderData);
    return res.data; // OrderResponse
  },

  async getOrders() {
    const res = await apiClient.get('/api/v1/orders');
    return res.data; // List of OrderResponse
  },

  async getOrderById(orderId) {
    const res = await apiClient.get(`/api/v1/orders/${orderId}`);
    return res.data; // OrderResponse
  },

  async trackOrder(trackingCode) {
    const res = await apiClient.get(`/api/v1/orders/track/${trackingCode}`);
    return res.data; // OrderTrackingResponse
  }
};
