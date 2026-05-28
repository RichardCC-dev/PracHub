const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'No se pudo completar la solicitud.');
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

export const registerCompany = async (payload) => {
  const response = await fetch(`${API_URL}/companies/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

export const getCompanyProfile = async (token) => {
  const response = await fetch(`${API_URL}/companies/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  return parseResponse(response);
};

export const updateCompanyProfile = async (token, payload) => {
  const response = await fetch(`${API_URL}/companies/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');
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

export const exportResumePdf = async (template) => {
  const response = await fetch(`${API_URL}/resume/export-pdf`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ template }),
  });

  if (!response.ok) {
    const error = await parseResponse(response).catch(() => ({ message: 'No se pudo generar el PDF.' }));
    throw new Error(error.message || 'No se pudo generar el PDF.');
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('application/pdf')) {
    throw new Error('El servidor no devolvió un PDF válido.');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const filenameMatch = /filename="(.+)"/.exec(disposition);
  return {
    blob,
    filename: filenameMatch?.[1] || `cv-${template}.pdf`,
  };
};

export const uploadLogo = async (token, file) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`${API_URL}/upload/logo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return parseResponse(response);
};

export const getResumeVersions = async (limit = 20) => {
  const response = await fetch(`${API_URL}/resume/versions?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const restoreResumeVersion = async (versionId) => {
  const response = await fetch(`${API_URL}/resume/versions/${versionId}/restore`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const deleteResumeVersion = async (versionId) => {
  const response = await fetch(`${API_URL}/resume/versions/${versionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

// Simulation endpoints
export const startSimulation = async (simulatedRole, token, career, sector) => {
  const response = await fetch(`${API_URL}/simulations/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ simulatedRole, career, sector }),
  });
  return parseResponse(response);
};

export const sendMessageToSimulation = async (id, message, token) => {
  const response = await fetch(`${API_URL}/simulations/${id}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message }),
  });
  return parseResponse(response);
};

export const endSimulation = async (id, token) => {
  const response = await fetch(`${API_URL}/simulations/${id}/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return parseResponse(response);
};

export const getSimulationHistory = async (token) => {
  const response = await fetch(`${API_URL}/simulations/history`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  return parseResponse(response);
};

export const getSimulationDetails = async (id, token) => {
  const response = await fetch(`${API_URL}/simulations/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  return parseResponse(response);
};

export const getSimulationStats = async (token) => {
  const response = await fetch(`${API_URL}/simulations/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  return parseResponse(response);
};
