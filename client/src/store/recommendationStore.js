import { create } from 'zustand';
import { getRecommendedOffers } from '../services/recommendationApi';

const useRecommendationStore = create((set) => ({
  recommendations: [],
  isLoading: false,
  error: null,

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRecommendedOffers();
      set({ recommendations: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.error || 'Error al obtener recomendaciones', 
        isLoading: false,
        recommendations: []
      });
    }
  },
}));

export default useRecommendationStore;
