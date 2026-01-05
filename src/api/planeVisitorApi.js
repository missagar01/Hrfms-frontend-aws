import { apiRequest } from './apiClient';

export const getPlaneVisitors = (token) =>
  apiRequest('/api/planet-visitors', {
    method: 'GET',
    token,
  });

export const createPlaneVisitor = (payload, token) =>
  apiRequest('/api/planet-visitors', {
    method: 'POST',
    body: payload,
    token,
  });

export const updatePlaneVisitor = (id, payload, token) =>
  apiRequest(`/api/planet-visitors/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });

export const deletePlaneVisitor = (id, token) =>
  apiRequest(`/api/planet-visitors/${id}`, {
    method: 'DELETE',
    token,
  });
