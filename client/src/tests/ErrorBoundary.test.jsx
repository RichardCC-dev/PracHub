import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../components/ErrorBoundary';

// Componente que lanza un error intencional para disparar el boundary
const BrokenComponent = () => {
  throw new Error('Error de prueba intencional');
};

// Suprimir los console.error de React durante el test (son esperados)
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe('ErrorBoundary', () => {
  it('renderiza los children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <p>Contenido normal</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('Contenido normal')).toBeInTheDocument();
  });

  it('muestra el heading "Algo salió mal" cuando un child lanza error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    // Buscamos por rol de heading para ser específicos
    expect(screen.getByRole('heading', { name: /algo salió mal/i })).toBeInTheDocument();
  });

  it('muestra el botón "Recargar página"', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /recargar página/i })).toBeInTheDocument();
  });

  it('el botón de recarga llama a window.location.reload', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    await userEvent.click(screen.getByRole('button', { name: /recargar página/i }));
    expect(reloadMock).toHaveBeenCalledOnce();
  });
});
