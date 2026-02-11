import { apiRequest } from './apiClient';

export const getDashboardStats = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/api/dashboard?${query}` : '/api/dashboard';
  return apiRequest(url, {
    method: 'GET',
    token,
  });
};

export const getEmployeeFullDetails = (token, employeeId) => {
  return apiRequest(`/api/dashboard/employee/${employeeId}`, {
    method: 'GET',
    token,
  });
};
