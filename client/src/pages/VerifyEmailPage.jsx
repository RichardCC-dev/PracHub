import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Página de verificación de email.
 *
 * Flujos:
 * - Con ?token=...: llama a la API para verificar la cuenta y redirige al dashboard.
 * - Con ?error=1: muestra un mensaje de error (enlace expirado o ya usado).
 * - Sin parámetros: muestra el spinner de "verificando".
 */
const VerifyEmailPage = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const verifyToken = searchParams.get('token');
  const hasError = searchParams.get('error');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!verifyToken || hasVerified.current) return;
    hasVerified.current = true;

    const endpoints = [
      `${API_URL}/auth/verify-email/${verifyToken}`,
      `${API_URL}/companies/verify-email/${verifyToken}`,
    ];

    (async () => {
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            if (data.token && data.user) {
              localStorage.setItem('prachub_token', data.token);
              setUser(data.user);
              useAuthStore.setState({ token: data.token });
              window.history.replaceState({}, '', '/verify-email');
              navigate('/dashboard', { replace: true });
              return;
            }
          }
        } catch { /* continuar con el siguiente endpoint */ }
      }
      navigate('/verify-email?error=1', { replace: true });
    })();
  }, [verifyToken, setUser, navigate]);

  if (hasError) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-950">Error de verificación</h1>
          <p className="text-gray-600">El enlace puede haber expirado o ya fue usado.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md p-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-8 w-8 animate-spin text-emerald-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-950">Verificando tu correo...</h1>
        <p className="text-gray-600">Por favor espera un momento.</p>
      </div>
    </main>
  );
};

export default VerifyEmailPage;
