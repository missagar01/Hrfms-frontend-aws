import { apiRequest } from './apiClient';

export const createRequest = (payload, token) =>
  apiRequest('/api/requests', {
    method: 'POST',
    body: payload,
    token,
  });

export const getRequests = (token) =>
  apiRequest('/api/requests', {
    method: 'GET',
    token,
  });

export const updateRequest = (id, payload, token) =>
  apiRequest(`/api/requests/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });

  
