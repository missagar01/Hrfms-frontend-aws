import { apiRequest } from './apiClient';

export const getDashboardStats = (token) =>
  apiRequest('/api/dashboard', {
    method: 'GET',
    token,
  });
