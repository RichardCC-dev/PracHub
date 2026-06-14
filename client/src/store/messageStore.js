import { create } from 'zustand';
import {
  sendMessage as apiSend,
  getInbox as apiGetInbox,
  getUnreadMessageCount as apiGetUnreadCount,
  getConversation as apiGetConversation,
  markConversationRead as apiMarkRead,
  searchUsers as apiSearchUsers,
} from '../services/messageApi';

/**
 * Store Zustand para mensajería directa (HU-24, HU-25, HU-26).
 *
 * Estado:
 *  - conversations   Lista de conversaciones activas (bandeja de entrada)
 *  - currentMessages Mensajes del hilo abierto actualmente
 *  - currentOtherUser Participante del hilo abierto
 *  - unreadCount     Total de mensajes no leídos
 *  - searchResults   Resultados de búsqueda de usuarios (HU-26)
 *  - isLoading       Carga general
 *  - isSending       Envío en curso
 *  - isSearching     Búsqueda en curso
 *  - error           Último error
 */
const useMessageStore = create((set, get) => ({
  // ── Estado ──────────────────────────────────────────────────────────────────
  conversations: [],
  currentMessages: [],
  currentOtherUser: null,
  currentPagination: { total: 0, limit: 50, offset: 0 },
  unreadCount: 0,
  searchResults: [],
  isLoading: false,
  isSending: false,
  isSearching: false,
  error: null,

  // ── Acciones ─────────────────────────────────────────────────────────────────

  /**
   * Carga la bandeja de entrada (lista de conversaciones).
   */
  fetchInbox: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiGetInbox();
      set({ conversations: response.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Carga el conteo de mensajes no leídos.
   */
  fetchUnreadCount: async () => {
    try {
      const response = await apiGetUnreadCount();
      set({ unreadCount: response.count || 0 });
      return response.count;
    } catch {
      return 0;
    }
  },

  /**
   * Carga el historial de mensajes con un usuario específico y marca la
   * conversación como leída.
   * @param {number} userId - ID del otro participante
   * @param {{ limit?: number, offset?: number }} options
   */
  fetchConversation: async (userId, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiGetConversation(userId, options);
      set({
        currentMessages: response.messages || [],
        currentOtherUser: response.otherUser || null,
        currentPagination: response.pagination || { total: 0, limit: 50, offset: 0 },
        isLoading: false,
      });

      // Marcar como leídos y actualizar bandeja
      await apiMarkRead(userId).catch(() => {});
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.otherUser?.id === userId ? { ...conv, unreadCount: 0 } : conv
        ),
        unreadCount: Math.max(
          0,
          state.unreadCount -
            (state.conversations.find((c) => c.otherUser?.id === userId)?.unreadCount || 0)
        ),
      }));

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * Envía un mensaje y lo agrega optimistamente al hilo actual.
   * @param {number} receiverId
   * @param {string} content
   */
  sendMessage: async (receiverId, content) => {
    set({ isSending: true, error: null });
    try {
      const response = await apiSend(receiverId, content);
      const newMessage = response.data;

      // Agregar al hilo actual si es la conversación abierta
      set((state) => ({
        currentMessages: [...state.currentMessages, newMessage],
        isSending: false,
      }));

      // Refrescar bandeja para actualizar el último mensaje
      get().fetchInbox().catch(() => {});

      return response;
    } catch (error) {
      set({ error: error.message, isSending: false });
      throw error;
    }
  },

  /**
   * Busca usuarios del sistema por nombre o email (HU-26 — networking).
   * @param {string} query
   * @param {number} limit
   */
  searchUsers: async (query, limit = 10) => {
    if (!query || query.length < 2) {
      set({ searchResults: [] });
      return [];
    }
    set({ isSearching: true });
    try {
      const response = await apiSearchUsers(query, limit);
      set({ searchResults: response.data || [], isSearching: false });
      return response.data;
    } catch {
      set({ isSearching: false });
      return [];
    }
  },

  /**
   * Limpia los resultados de búsqueda.
   */
  clearSearchResults: () => set({ searchResults: [] }),

  /**
   * Limpia la conversación actualmente abierta.
   */
  clearCurrentConversation: () =>
    set({ currentMessages: [], currentOtherUser: null }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      conversations: [],
      currentMessages: [],
      currentOtherUser: null,
      currentPagination: { total: 0, limit: 50, offset: 0 },
      unreadCount: 0,
      searchResults: [],
      isLoading: false,
      isSending: false,
      isSearching: false,
      error: null,
    }),
}));

export default useMessageStore;
