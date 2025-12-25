const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';

const buildHeaders = (token, headers, isFormData) => {
  const baseHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!isFormData) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  return baseHeaders;
};

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, token, headers } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, headers, isFormData),
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
