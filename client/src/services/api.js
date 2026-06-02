const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'No se pudo completar la solicitud.');
  }

  return data;
};

// Helper actualizado para soportar FormData (evita sobrescribir el boundary nativo)
const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Nuevo helper unificado para procesar descargas de PDF de forma segura
const handlePdfResponse = async (response, defaultFilename) => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || data.message || 'No se pudo descargar el PDF.');
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
    filename: filenameMatch?.[1] || defaultFilename,
  };
};

// --- AUTHENTICATION ---

export const loginUser = async (payload) => {
  const endpoint = payload.adminSecret ? '/auth/login/admin' : '/auth/login';
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const registerStudent = async (payload) => {
  const response = await fetch(`${API_URL}/auth/students/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const requestPasswordReset = async (payload) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const resetPassword = async (payload) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

// --- COMPANIES ---

export const registerCompany = async (payload) => {
  const response = await fetch(`${API_URL}/companies/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const getCompanyProfile = async () => {
  const response = await fetch(`${API_URL}/companies/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const updateCompanyProfile = async (payload) => {
  const response = await fetch(`${API_URL}/companies/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`${API_URL}/upload/logo`, {
    method: 'POST',
    headers: getAuthHeaders(true), // true = es FormData, no incluir Content-Type
    body: formData,
  });
  return parseResponse(response);
};

// --- RESUME ---

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
  return handlePdfResponse(response, `cv-${template}.pdf`);
};

// --- RESUME VERSIONS ---

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

export const exportVersionPdf = async (versionId, template = 'harvard') => {
  const response = await fetch(`${API_URL}/resume/versions/${versionId}/pdf?template=${template}`, {
    headers: getAuthHeaders(),
  });
  return handlePdfResponse(response, `cv-version-${versionId}.pdf`);
};

// --- SIMULATIONS ---

export const startSimulation = async (simulatedRole, career, sector) => {
  const response = await fetch(`${API_URL}/simulations/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ simulatedRole, career, sector }),
  });
  return parseResponse(response);
};

export const sendMessageToSimulation = async (id, message) => {
  const response = await fetch(`${API_URL}/simulations/${id}/message`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  return parseResponse(response);
};

export const endSimulation = async (id) => {
  const response = await fetch(`${API_URL}/simulations/${id}/end`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const getSimulationHistory = async () => {
  const response = await fetch(`${API_URL}/simulations/history`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const getSimulationDetails = async (id) => {
  const response = await fetch(`${API_URL}/simulations/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const getSimulationStats = async () => {
  const response = await fetch(`${API_URL}/simulations/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

// --- CV ANALYSIS ---

export const analyzeCV = async (offerId = null) => {
  const response = await fetch(`${API_URL}/cv-analysis`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ offerId }),
  });
  return parseResponse(response);
};

export const getAnalysisHistory = async (limit = 20) => {
  const response = await fetch(`${API_URL}/cv-analysis/history?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const getAnalysisDetails = async (analysisId) => {
  const response = await fetch(`${API_URL}/cv-analysis/${analysisId}`, {
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};

export const deleteAnalysis = async (analysisId) => {
  const response = await fetch(`${API_URL}/cv-analysis/${analysisId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
};