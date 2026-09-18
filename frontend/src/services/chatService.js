import { apiClient } from '../api/client';

export const chatService = {
  async sendMessage(message) {
    const res = await apiClient.post('/api/v1/chat', { message });
    return res.data; // { response, grounded, confidence_score, sources }
  }
};
