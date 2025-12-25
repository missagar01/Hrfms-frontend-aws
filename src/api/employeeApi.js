import { apiRequest } from './apiClient';

export const createEmployee = (payload, token) =>
  apiRequest('/api/employees', {
    method: 'POST',
    body: payload,
    token,
  });

export const getEmployees = (token) =>
  apiRequest('/api/employees', {
    method: 'GET',
    token,
  });

export const getEmployeeById = (id, token) =>
  apiRequest(`/api/employees/${id}`, {
    method: 'GET',
    token,
  });

export const updateEmployee = (id, payload, token) =>
  apiRequest(`/api/employees/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });

export const deleteEmployee = (id, token) =>
  apiRequest(`/api/employees/${id}`, {
    method: 'DELETE',
    token,
  });

export const getDepartments = () =>
  apiRequest('/api/employees/departments', {
    method: 'GET',
  });

export const getDesignations = () =>
  apiRequest('/api/employees/designations', {
    method: 'GET',
  });

export const loginEmployee = (payload) =>
  apiRequest('/api/employees/login', {
    method: 'POST',
    body: payload,
  });
