const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la solicitud.');
  }

  return data;
};

export const loginUser = async (payload) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const registerStudent = async (payload) => {
  const response = await fetch(`${API_URL}/auth/students/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const requestPasswordReset = async (payload) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const resetPassword = async (payload) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('prachub_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getResume = async () => {
  const response = await fetch(`${API_URL}/resume`, {
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const updateResumeSection = async (section, payload) => {
  const response = await fetch(`${API_URL}/resume/${section}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const improveField = async (section, field) => {
  const response = await fetch(`${API_URL}/resume/improve/${section}/${field}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const improveSection = async (section) => {
  const response = await fetch(`${API_URL}/resume/improve-section/${section}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};
