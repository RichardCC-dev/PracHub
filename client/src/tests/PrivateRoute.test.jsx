import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Mock del store de autenticación ──────────────────────────────────────────
// Definimos el mock antes de importar App para que Vitest lo aplique.
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

// Importamos PrivateRoute extrayéndolo de App — como está definido dentro del módulo,
// lo replicamos aquí para poder testearlo de forma aislada.
import useAuthStore from '../store/authStore';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { token, user, isInitialized, isLoading, authVerified } = useAuthStore(
    (s) => s
  );
  const location = useLocation();

  if (!isInitialized || isLoading) return <div data-testid="spinner" />;
  if (authVerified && (!token || !user)) return <Navigate to="/" replace state={{ from: location }} />;
  if (!authVerified && token) return <div data-testid="spinner" />;
  if (!token) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
};

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
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('muestra spinner mientras inicializa (isInitialized = false)', () => {
    mockAuthState = { token: null, user: null, isInitialized: false, isLoading: false, authVerified: false };
    renderWithRouter();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
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
