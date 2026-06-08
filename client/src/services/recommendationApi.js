import axios from 'axios';
import { API_URL, authHeaders } from './apiBase';

export const getRecommendedOffers = async () => {
  try {
    const response = await axios.get(`${API_URL}/recommendations`, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
