import { useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StudentOnboardingPage from './pages/StudentOnboardingPage';
import CompanyOnboardingPage from './pages/CompanyOnboardingPage';
import WelcomePage from './pages/WelcomePage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import useAuthStore from './store/authStore';
import CVBuilderPage from './pages/CVBuilderPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CompanyOffersPage from './pages/CompanyOffersPage';
import CreateOfferPage from './pages/CreateOfferPage';

const PrivateRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  const location = useLocation();
  if (!token || !user) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
};

const CompanyRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (!token || !user) return <Navigate to="/" replace />;
  if (user.role !== 'company') return <Navigate to="/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (!token || !user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const VerifyEmailPage = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const verifyToken = searchParams.get('token');
  const hasVerified = useRef(false);
  const [status, setStatus] = useMemo(() => {
    const s = { state: 'verifying', error: null };
    return [s, (v) => Object.assign(s, v)];
  }, []);
  const [, forceUpdate] = useEffect(() => {}, []);

  useEffect(() => {
    if (!verifyToken || hasVerified.current) return;
    hasVerified.current = true;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const endpoints = [
      `${apiUrl}/auth/verify-email/${verifyToken}`,
      `${apiUrl}/companies/verify-email/${verifyToken}`,
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
        } catch {}
      }
      navigate('/verify-email?error=1', { replace: true });
    })();
  }, [verifyToken, setUser, navigate]);

  const hasError = searchParams.get('error');

  if (hasError) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md p-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-950">Error de verificación</h1>
        <p className="text-gray-600">El enlace puede haber expirado o ya fue usado.</p>
        <button onClick={() => navigate('/')} className="mt-4 rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">Volver al inicio</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md p-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 animate-spin text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-950">Verificando tu correo...</h1>
        <p className="text-gray-600">Por favor espera un momento.</p>
      </div>
    </main>
  );
};

const AppRoutes = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Pública: home */}
      <Route path="/" element={
        token && user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> :
        <HomePage
          onLogin={() => navigate('/login')}
          onRegisterStudent={() => navigate('/register/student')}
          onRegisterCompany={() => navigate('/register/company')}
        />
      } />

      {/* Auth: login */}
      <Route path="/login" element={
        token && user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> :
        <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* Auth: olvidé contraseña */}
      <Route path="/forgot-password" element={
        token && user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> :
        <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* Auth: reset password */}
      <Route path="/reset-password" element={
        <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* Auth: registro estudiante */}
      <Route path="/register/student" element={
        token && user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> :
        <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* Auth: registro empresa */}
      <Route path="/register/company" element={
        token && user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> :
        <CompanyOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* Verificación de email */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Dashboard (protegido) */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <WelcomePage
            onLogout={() => navigate('/', { replace: true })}
            onEditProfile={() => navigate('/company/profile')}
            onGoToCVBuilder={() => navigate('/cv-builder')}
            onGoToAdmin={() => navigate('/admin')}
            onGoToOffers={() => navigate('/company/offers')}
          />
        </PrivateRoute>
      } />

      {/* Constructor de CV (protegido) */}
      <Route path="/cv-builder" element={
        <PrivateRoute>
          <CVBuilderPage onBack={() => navigate('/dashboard')} />
        </PrivateRoute>
      } />

      {/* Perfil empresa (protegido, solo company) */}
      <Route path="/company/profile" element={
        <CompanyRoute>
          <CompanyProfilePage onBack={() => navigate('/dashboard')} />
        </CompanyRoute>
      } />

      {/* Panel de administración (protegido, solo admin) */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />

      {/* Gestión de ofertas (protegido, solo company) */}
      <Route path="/company/offers" element={
        <CompanyRoute>
          <CompanyOffersPage
            onBack={() => navigate('/dashboard')}
            onCreateOffer={() => navigate('/company/offers/new')}
            onEditOffer={(offer) => navigate('/company/offers/edit', { state: { offer } })}
          />
        </CompanyRoute>
      } />

      {/* Crear/editar oferta (protegido, solo company) */}
      <Route path="/company/offers/new" element={
        <CompanyRoute>
          <CreateOfferPage
            onBack={() => navigate('/company/offers')}
            onSuccess={() => navigate('/company/offers')}
          />
        </CompanyRoute>
      } />

      <Route path="/company/offers/edit" element={
        <CompanyRoute>
          <CreateOfferPage
            onBack={() => navigate('/company/offers')}
            onSuccess={() => navigate('/company/offers')}
          />
        </CompanyRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;