import { apiRequest } from './apiClient';

export const getPlaneVisitors = (token) =>
  apiRequest('/api/plant-visitors', {
    method: 'GET',
    token,
  });

export const createPlaneVisitor = (payload, token) =>
  apiRequest('/api/plant-visitors', {
    method: 'POST',
    body: payload,
    token,
  });

export const updatePlaneVisitor = (id, payload, token) =>
  apiRequest(`/api/plant-visitors/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });

export const deletePlaneVisitor = (id, token) =>
  apiRequest(`/api/plant-visitors/${id}`, {
    method: 'DELETE',
    token,
  });
