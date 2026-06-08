import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Mock del store de autenticación ──────────────────────────────────────────
let mockAuthState = {
  token: null,
  user: null,
  isInitialized: true,
  isLoading: false,
  authVerified: true,
};

vi.mock('../store/authStore', () => ({
  default: (selector) => {
    if (typeof selector === 'function') return selector(mockAuthState);
    return mockAuthState;
  },
}));

// Importamos el componente desde su nueva ubicación en routing/
import PrivateRoute from '../components/routing/PrivateRoute';

// ── Helper de renderizado ─────────────────────────────────────────────────────
const renderWithRouter = (initialPath = '/protected') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Página de inicio (login)</div>} />
        <Route
          path="/protected"
          element={
            <PrivateRoute>
              <div>Contenido protegido</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────

describe('PrivateRoute', () => {
  it('redirige a "/" cuando no hay token', () => {
    mockAuthState = { token: null, user: null, isInitialized: true, isLoading: false, authVerified: true };
    renderWithRouter();
    expect(screen.getByText(/página de inicio/i)).toBeInTheDocument();
    expect(screen.queryByText(/contenido protegido/i)).not.toBeInTheDocument();
  });

  it('muestra spinner mientras carga (isLoading = true)', () => {
    mockAuthState = { token: 'tok', user: { id: 1 }, isInitialized: true, isLoading: true, authVerified: false };
    renderWithRouter();
    // LoadingSpinner no tiene data-testid; verificamos que el contenido protegido no se muestra
    expect(screen.queryByText(/contenido protegido/i)).not.toBeInTheDocument();
  });

  it('muestra spinner mientras inicializa (isInitialized = false)', () => {
    mockAuthState = { token: null, user: null, isInitialized: false, isLoading: false, authVerified: false };
    renderWithRouter();
    expect(screen.queryByText(/contenido protegido/i)).not.toBeInTheDocument();
  });

  it('renderiza los children cuando el usuario está autenticado', () => {
    mockAuthState = {
      token: 'valid-token',
      user: { id: 1, role: 'student', email: 'test@unmsm.edu.pe' },
      isInitialized: true,
      isLoading: false,
      authVerified: true,
    };
    renderWithRouter();
    expect(screen.getByText(/contenido protegido/i)).toBeInTheDocument();
  });

  it('redirige cuando authVerified=true pero no hay token', () => {
    mockAuthState = { token: null, user: null, isInitialized: true, isLoading: false, authVerified: true };
    renderWithRouter();
    expect(screen.getByText(/página de inicio/i)).toBeInTheDocument();
  });
});
