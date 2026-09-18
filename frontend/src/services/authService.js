import { apiClient } from '../api/client';

export const authService = {
  async register(userData) {
    const res = await apiClient.post('/api/v1/auth/register', userData);
    return res.data; // { access_token, user, token_type }
  },

  async login(credentials) {
    const res = await apiClient.post('/api/v1/auth/login', credentials);
    return res.data; // { access_token, user, token_type }
  },

  async getMe() {
    const res = await apiClient.get('/api/v1/auth/me');
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await apiClient.put('/api/v1/users/me', profileData);
    return res.data;
  }
};
