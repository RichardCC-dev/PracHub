/**
 * Tests unitarios: InboxPage (HU-25)
 * Verifica renderizado básico de la bandeja de entrada.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../store/authStore', () => ({
  default: (selector) => {
    const state = {
      user: { id: 1, role: 'student', email: 'test@unmsm.edu.pe' },
      token: 'mock-token',
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

vi.mock('../store/messageStore', () => ({
  default: (selector) => {
    const state = {
      conversations: [],
      currentMessages: [],
      currentOtherUser: null,
      currentPagination: { total: 0, limit: 50, offset: 0 },
      unreadCount: 0,
      isLoading: false,
      isSending: false,
      error: null,
      fetchInbox: vi.fn().mockResolvedValue([]),
      fetchUnreadCount: vi.fn().mockResolvedValue(0),
      fetchConversation: vi.fn().mockResolvedValue({}),
      sendMessage: vi.fn().mockResolvedValue({}),
      searchUsers: vi.fn().mockResolvedValue([]),
      clearCurrentConversation: vi.fn(),
      clearSearchResults: vi.fn(),
      clearError: vi.fn(),
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

vi.mock('../hooks/useInvitations', () => ({
  useInvitations: () => ({
    data: { data: { invitations: [] } },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

import InboxPage from '../pages/InboxPage';

// ── Helper de renderizado ─────────────────────────────────────────────────────

const renderInbox = (path = '/inbox') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/inbox/:userId" element={<InboxPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────

describe('InboxPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza el header con título "Mensajes e Invitaciones"', () => {
    renderInbox();
    expect(screen.getByText('Mensajes e Invitaciones')).toBeInTheDocument();
  });

  it('muestra "Conversaciones" como encabezado del panel izquierdo', () => {
    renderInbox();
    expect(screen.getByText('Conversaciones')).toBeInTheDocument();
  });

  it('muestra mensaje de estado vacío cuando no hay conversaciones', () => {
    renderInbox();
    expect(screen.getByText(/Sin mensajes aún/i)).toBeInTheDocument();
  });

  it('muestra panel derecho con instrucción al no tener conversación seleccionada', () => {
    renderInbox();
    expect(screen.getByText(/Selecciona una conversación/i)).toBeInTheDocument();
  });
});
