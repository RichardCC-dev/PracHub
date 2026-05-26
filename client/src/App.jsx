import { useEffect, useMemo, useRef, useState } from 'react';
import HomePage from './pages/HomePage';
import StudentOnboardingPage from './pages/StudentOnboardingPage';
import CompanyOnboardingPage from './pages/CompanyOnboardingPage';
import WelcomePage from './pages/WelcomePage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import useAuthStore from './store/authStore';

const App = () => {
  const { user, token, logout, setUser } = useAuthStore();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const hasVerified = useRef(false);

  const resetToken = searchParams.get('resetToken');
  const verifyToken = searchParams.get('token');

  const [page, setPage] = useState(() => {
    if (resetToken) return 'auth';
    if (token && user) return 'welcome';
    return 'home';
  });

  const [authInitialView, setAuthInitialView] = useState(resetToken ? 'reset' : 'login');
  const [userType, setUserType] = useState('student');
  const [isVerifying, setIsVerifying] = useState(!!verifyToken);
  const [verifyError, setVerifyError] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [hasProcessedToken, setHasProcessedToken] = useState(false);

  useEffect(() => {
    if (verifyToken && !hasVerified.current) {
      hasVerified.current = true;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const verifyEndpoints = [
        `${apiUrl}/auth/verify-email/${verifyToken}`,
        `${apiUrl}/companies/verify-email/${verifyToken}`,
      ];

      const tryVerify = async () => {
        for (const endpoint of verifyEndpoints) {
          console.log('[App] Intentando verificar en:', endpoint);
          try {
            const res = await fetch(endpoint);
            console.log('[App] Respuesta status:', res.status);
            if (res.ok) {
              const data = await res.json();
              console.log('[App] Datos recibidos:', data);
              if (data.token && data.user) {
                localStorage.setItem('prachub_token', data.token);
                setUser(data.user);
                useAuthStore.setState({ token: data.token });
                console.log('[App] Verificación exitosa');
                return { success: true };
              }
            } else {
              const errorText = await res.text();
              console.log('[App] Error en respuesta:', errorText);
            }
          } catch (err) {
            console.log('[App] Error en fetch:', err.message);
          }
        }
        return { success: false, error: 'No se pudo verificar el correo. El enlace puede haber expirado.' };
      };

      tryVerify()
        .then((result) => {
          if (result.success) {
            setVerifyError(null);
            setVerifySuccess(true);
          } else {
            setVerifyError(result.error);
          }
        })
        .catch((err) => setVerifyError(err.message))
        .finally(() => {
          setIsVerifying(false);
          window.history.replaceState({}, '', window.location.pathname);
        });
    }
  }, [verifyToken, setUser]);

  const goToAuth = (view, type = 'student') => {
    setAuthInitialView(view);
    setUserType(type);
    setPage('auth');
  };

  const handleLoginSuccess = () => setPage('welcome');
  const handleLogout = () => {
    setPage('home');
  };

  // Pantalla de verificación de email - solo mostrar si hay token y no hemos procesado la navegación
  if ((verifyToken || isVerifying || verifySuccess || verifyError) && !hasProcessedToken) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          {/* Éxito - mostrar primero si existe */}
          {verifySuccess ? (
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-950">¡Correo verificado!</h1>
              <p className="text-gray-600">Tu correo ha sido verificado correctamente.</p>
              <button
                onClick={() => {
                  setVerifySuccess(false);
                  setHasProcessedToken(true);
                  setPage('welcome');
                }}
                className="mt-4 rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Ir al panel
              </button>
            </div>
          ) : /* Error - mostrar si existe */ verifyError ? (
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-950">Error de verificación</h1>
              <p className="text-gray-600">{verifyError}</p>
              <button
                onClick={() => {
                  setVerifyError(null);
                  setHasProcessedToken(true);
                  setPage('home');
                }}
                className="mt-4 rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Volver al inicio
              </button>
            </div>
          ) : /* Verificando - default */ (
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 animate-spin text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-950">Verificando tu correo...</h1>
              <p className="text-gray-600">Por favor espera un momento.</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (page === 'welcome' && token && user) {
    return (
      <WelcomePage
        onLogout={handleLogout}
        onEditProfile={() => setPage('company-profile')}
      />
    );
  }

  if (page === 'company-profile' && token && user?.role === 'company') {
    return <CompanyProfilePage onBack={() => setPage('welcome')} />;
  }

  if (page === 'home') {
    return (
      <HomePage
        onLogin={() => goToAuth('login')}
        onRegisterStudent={() => goToAuth('register', 'student')}
        onRegisterCompany={() => goToAuth('register', 'company')}
      />
    );
  }

  const OnboardingPage = userType === 'company' ? CompanyOnboardingPage : StudentOnboardingPage;

  return (
    <OnboardingPage
      initialView={authInitialView}
      onGoHome={() => setPage('home')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

export default App;
