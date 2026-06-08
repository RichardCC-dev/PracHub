import { create } from 'zustand';
import {
  followCompany,
  unfollowCompany,
  isFollowingCompany,
  getFollowedCompanies,
  getFollowedCompaniesCount,
  getFollowedCompaniesFeed,
  getSuggestedCompanies,
  updateNotificationPreference,
} from '../services/savedCompanyApi';

const useSavedCompanyStore = create((set, get) => ({
  // Estado
  followedCompanies: [],
  followedCount: 0,
  feedOffers: [],
  feedPagination: { total: 0, limit: 20, offset: 0 },
  suggestedCompanies: [],
  followingStatus: {}, // Mapa de companyId -> boolean
  isLoading: false,
  isToggling: false,
  error: null,

  // Acciones
  fetchFollowedCompanies: async (includeOffers = true) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getFollowedCompanies(includeOffers);
      set({ followedCompanies: response.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchFollowedCount: async () => {
    try {
      const response = await getFollowedCompaniesCount();
      set({ followedCount: response.count || 0 });
      return response.count;
    } catch (error) {
      console.error('Error fetching followed count:', error);
      return 0;
    }
  },

  fetchFeed: async (options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getFollowedCompaniesFeed(options);
      set({
        feedOffers: response.data || [],
        feedPagination: response.pagination || { total: 0, limit: 20, offset: 0 },
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchSuggestedCompanies: async (limit = 5) => {
    try {
      const response = await getSuggestedCompanies(limit);
      set({ suggestedCompanies: response.data || [] });
      return response.data;
    } catch (error) {
      console.error('Error fetching suggested companies:', error);
      return [];
    }
  },

  checkFollowingStatus: async (companyId) => {
    try {
      const response = await isFollowingCompany(companyId);
      const isFollowing = response.isFollowing;
      set((state) => ({
        followingStatus: { ...state.followingStatus, [companyId]: isFollowing },
      }));
      return isFollowing;
    } catch (error) {
      console.error('Error checking following status:', error);
      return false;
    }
  },

  follow: async (companyId) => {
    set({ isToggling: true, error: null });
    try {
      const response = await followCompany(companyId);
      set((state) => ({
        followingStatus: { ...state.followingStatus, [companyId]: true },
        followedCount: state.followedCount + 1,
        isToggling: false,
      }));
      return response;
    } catch (error) {
      set({ error: error.message, isToggling: false });
      throw error;
    }
  },

  unfollow: async (companyId) => {
    set({ isToggling: true, error: null });
    try {
      const response = await unfollowCompany(companyId);
      set((state) => ({
        followingStatus: { ...state.followingStatus, [companyId]: false },
        followedCount: Math.max(0, state.followedCount - 1),
        isToggling: false,
      }));
      return response;
    } catch (error) {
      set({ error: error.message, isToggling: false });
      throw error;
    }
  },

  toggleFollow: async (companyId) => {
    const isCurrentlyFollowing = get().followingStatus[companyId];
    if (isCurrentlyFollowing) {
      return get().unfollow(companyId);
    } else {
      return get().follow(companyId);
    }
  },

  updateNotifications: async (companyId, enabled) => {
    try {
      const response = await updateNotificationPreference(companyId, enabled);
      // Actualizar en la lista local
      set((state) => ({
        followedCompanies: state.followedCompanies.map((item) =>
          item.companyId === companyId
            ? { ...item, notificationsEnabled: enabled }
            : item
        ),
      }));
      return response;
    } catch (error) {
      console.error('Error updating notification preference:', error);
      throw error;
    }
  },

  // Getters computados
  isFollowing: (companyId) => {
    return get().followingStatus[companyId] || false;
  },

  getFollowedCompanyIds: () => {
    return Object.entries(get().followingStatus)
      .filter(([, isFollowing]) => isFollowing)
      .map(([id]) => parseInt(id));
  },

  // Helpers
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      followedCompanies: [],
      followedCount: 0,
      feedOffers: [],
      feedPagination: { total: 0, limit: 20, offset: 0 },
      suggestedCompanies: [],
      followingStatus: {},
      isLoading: false,
      isToggling: false,
      error: null,
    }),
}));

export default useSavedCompanyStore;
