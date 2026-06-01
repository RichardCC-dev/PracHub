import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');
  return { Authorization: `Bearer ${token}` };
};

export const getRecommendedOffers = async () => {
  try {
    const response = await axios.get(`${API_URL}/recommendations`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
