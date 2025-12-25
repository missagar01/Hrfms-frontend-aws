import { apiRequest } from './apiClient';

export const getLeaveRequests = (token) =>
  apiRequest('/api/leave-requests', {
    method: 'GET',
    token,
  });

export const getLeaveRequestsByStatus = (status, token) =>
  apiRequest(`/api/leave-requests/status/${encodeURIComponent(status)}`, {
    method: 'GET',
    token,
  });

export const updateLeaveRequest = (id, payload, token) =>
  apiRequest(`/api/leave-requests/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });
