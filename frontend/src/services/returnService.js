import { apiClient } from '../api/client';

export const returnService = {
  async createReturn(returnData) {
    const res = await apiClient.post('/api/v1/returns', returnData);
    return res.data; // ReturnResponse
  },

  async getReturns() {
    const res = await apiClient.get('/api/v1/returns');
    return res.data; // List of ReturnResponse
  },

  async getReturnById(returnId) {
    const res = await apiClient.get(`/api/v1/returns/${returnId}`);
    return res.data;
  }
};
