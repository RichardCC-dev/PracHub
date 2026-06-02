import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [portalKey, setPortalKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handlePortalSubmit = (e) => {
    e.preventDefault();
    setPortalError(null);
    setIsChecking(true);

    // Pequeña demora para evitar fuerza bruta visual
    setTimeout(() => {
      const expectedKey = import.meta.env.VITE_ADMIN_PORTAL_KEY;
      if (!expectedKey) {
        setPortalError('El portal no está configurado. Contacta al equipo técnico.');
        setIsChecking(false);
        return;
      }
      if (portalKey === expectedKey) {
        setUnlocked(true);
      } else {
        setPortalError('Clave de acceso incorrecta.');
      }
      setIsChecking(false);
    }, 400);
  };

  if (unlocked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm
            role="admin"
            onLoginSuccess={() => navigate('/admin', { replace: true })}
            onForgotPassword={() => {}}
            onGoToRegister={() => {}}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handlePortalSubmit}
          className="space-y-6 rounded-3xl bg-white p-8 shadow-xl shadow-purple-950/10"
        >
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-950">Acceso Restringido</h1>
            <p className="mt-2 text-sm text-gray-600">
              Este portal es exclusivo para administradores de PracHub.
            </p>
          </div>

          {portalError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {portalError}
            </div>
          )}

          <label className="block space-y-2 text-sm font-medium text-gray-700">
            <span>Clave de acceso del portal</span>
            <input
              type="password"
              autoComplete="off"
              placeholder="Ingresa la clave maestra"
              value={portalKey}
              onChange={(e) => setPortalKey(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-700"
            />
          </label>

          <button
            type="submit"
            disabled={isChecking || !portalKey}
            className="w-full rounded-2xl px-5 py-3 font-semibold text-white bg-purple-800 hover:bg-purple-700 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isChecking ? 'Verificando...' : 'Ingresar al portal'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="w-full text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
          >
            ← Volver al inicio
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLoginPage;
