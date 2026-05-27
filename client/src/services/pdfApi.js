const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('prachub_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getTemplates = async () => {
  const response = await fetch(`${API_URL}/pdf/templates`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Error obteniendo plantillas');
  }
  
  return response.json();
};

export const exportPDF = async (templateId, style = 'classic') => {
  const response = await fetch(`${API_URL}/pdf/export`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ templateId, style }),
  });
  
  if (!response.ok) {
    throw new Error('Error generando PDF');
  }
  
  return response.json();
};

export const downloadPDF = async () => {
  const response = await fetch(`${API_URL}/pdf/download`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Error descargando PDF');
  }
  
  // Convertir respuesta a blob y descargar
  const blob = await response.blob();
  const url = globalThis.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CV_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  globalThis.URL.revokeObjectURL(url);
  a.remove();
};

export const getPDFHistory = async () => {
  const response = await fetch(`${API_URL}/pdf/history`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Error obteniendo historial de PDFs');
  }
  
  return response.json();
};
