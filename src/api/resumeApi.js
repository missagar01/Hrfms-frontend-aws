import { apiRequest } from './apiClient';

export const createResume = (payload, token) =>
  apiRequest('/api/resumes', {
    method: 'POST',
    body: payload,
    token,
  });

export const getResumes = (token) =>
  apiRequest('/api/resumes', {
    method: 'GET',
    token,
  });

  export const getSelectCondidate = (token) =>
  apiRequest('/api/resumes/selected', {
    method: 'GET',
    token,
  });

export const getByIdResumes = (id, token) =>
  apiRequest(`/api/resumes/${id}`, {
    method: 'GET',
    token,
  });

  export const updateResumes = (id, payload, token) =>
  apiRequest(`/api/resumes/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });


