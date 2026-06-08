import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

// Mock de la API y del store
vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
}));

vi.mock('../store/authStore', () => ({
  default: Object.assign(
    vi.fn(() => ({ saveSession: vi.fn() })),
    {
      getState: vi.fn(() => ({ saveSession: vi.fn() })),
      setState: vi.fn(),
    }
  ),
}));

vi.mock('../utils/security', () => ({
  sanitizePayload: (v) => v,
}));

import { loginUser } from '../services/api';

const renderLoginForm = (props = {}) =>
  render(
    <MemoryRouter>
      <LoginForm
        onForgotPassword={vi.fn()}
        onGoToRegister={vi.fn()}
        onLoginSuccess={vi.fn()}
        role="student"
        {...props}
      />
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────

describe('LoginForm — renderizado', () => {
  it('muestra el campo de correo electrónico', () => {
    renderLoginForm();
    // El email input está dentro de un <label> que contiene el span "Correo electrónico"
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it('muestra el campo de contraseña', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
  });

  it('muestra el botón de submit "Iniciar sesión"', () => {
    renderLoginForm();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('rol "company" muestra label "Acceso Empresas"', () => {
    renderLoginForm({ role: 'company' });
    expect(screen.getByText(/acceso empresas/i)).toBeInTheDocument();
  });

  it('rol "admin" muestra el campo de clave de acceso', () => {
    renderLoginForm({ role: 'admin' });
    expect(screen.getByLabelText(/clave de acceso administrativo/i)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('LoginForm — validación de react-hook-form', () => {
  it('muestra error de correo si se envía vacío', async () => {
    renderLoginForm();
    // Click submit sin llenar nada
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/ingresa tu correo/i)).toBeInTheDocument();
    });
  });

  it('muestra error de contraseña si está vacía', async () => {
    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'test@test.com');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/ingresa tu contraseña/i)).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('LoginForm — submit', () => {
  beforeEach(() => {
    loginUser.mockReset();
  });

  it('llama a loginUser con email y password correctos', async () => {
    loginUser.mockResolvedValue({
      token: 'fake-token',
      user: { id: 1, role: 'student', email: 'test@unmsm.edu.pe' },
    });

    renderLoginForm();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'test@unmsm.edu.pe');
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'Password123');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@unmsm.edu.pe', role: 'student' })
      );
    });
  });

  it('muestra el error cuando la API devuelve error de credenciales', async () => {
    loginUser.mockRejectedValue(new Error('Correo o contraseña incorrectos.'));

    renderLoginForm();

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'BadPassword1');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/correo o contraseña incorrectos/i)).toBeInTheDocument();
    });
  });
});
