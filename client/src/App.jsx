import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';

// ── Route guards ─────────────────────────────────────────────────────────────
import PrivateRoute from './components/routing/PrivateRoute';
import CompanyRoute from './components/routing/CompanyRoute';
import AdminRoute from './components/routing/AdminRoute';
import StudentRoute from './components/routing/StudentRoute';
import LoadingSpinner from './components/routing/LoadingSpinner';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const HomePage                = lazy(() => import('./pages/HomePage'));
const StudentOnboardingPage   = lazy(() => import('./pages/StudentOnboardingPage'));
const CompanyOnboardingPage   = lazy(() => import('./pages/CompanyOnboardingPage'));
const WelcomePage             = lazy(() => import('./pages/WelcomePage'));
const CompanyProfilePage      = lazy(() => import('./pages/CompanyProfilePage'));
const InterviewSimulatorPage  = lazy(() => import('./pages/InterviewSimulatorPage'));
const SimulationHistoryPage   = lazy(() => import('./pages/SimulationHistoryPage'));
const CVBuilderPage           = lazy(() => import('./pages/CVBuilderPage'));
const AdminDashboardPage      = lazy(() => import('./pages/AdminDashboardPage'));
const CompanyOffersPage       = lazy(() => import('./pages/CompanyOffersPage'));
const CreateOfferPage         = lazy(() => import('./pages/CreateOfferPage'));
const StudentOffersPage       = lazy(() => import('./pages/StudentOffersPage'));
const MyApplicationsPage      = lazy(() => import('./pages/MyApplicationsPage'));
const OfferCandidatesPage     = lazy(() => import('./pages/OfferCandidatesPage'));
const CompanyCandidatesPage   = lazy(() => import('./pages/CompanyCandidatesPage'));
const AlertSettingsPage       = lazy(() => import('./pages/AlertSettingsPage'));
const FollowedCompaniesPage   = lazy(() => import('./pages/FollowedCompaniesPage'));
const AlertHistoryPage        = lazy(() => import('./pages/AlertHistoryPage'));
const AdminLoginPage          = lazy(() => import('./pages/AdminLoginPage'));
const VerifyEmailPage         = lazy(() => import('./pages/VerifyEmailPage'));
const CompanyFeedPage         = lazy(() => import('./pages/CompanyFeedPage'));
const InboxPage               = lazy(() => import('./pages/InboxPage'));

// ── Fallback de Suspense ──────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500">Cargando...</p>
    </div>
  </div>
);

// ── Árbol de rutas ────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { token, user, isInitialized, isLoading, authVerified } = useAuthStore();
  const navigate = useNavigate();

  // Mostrar loading mientras se inicializa o si hay token pero auth no está verificada
  if (!isInitialized || isLoading || (token && !authVerified)) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* ── Pública: home ──────────────────────────────────────────────── */}
      <Route path="/" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <HomePage
              onLoginStudent={() => navigate('/login/student')}
              onLoginCompany={() => navigate('/login/company')}
              onRegisterStudent={() => navigate('/register/student')}
              onRegisterCompany={() => navigate('/register/company')}
            />
      } />

      {/* Redirección legacy /login → /login/student */}
      <Route path="/login" element={<Navigate to="/login/student" replace />} />

      {/* ── Auth: login admin ──────────────────────────────────────────── */}
      <Route path="/login/admin" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <AdminLoginPage />
      } />

      {/* ── Auth: login / registro estudiante ─────────────────────────── */}
      <Route path="/login/student" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/register/student" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/forgot-password" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/reset-password" element={
        <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* ── Auth: login / registro empresa ────────────────────────────── */}
      <Route path="/login/company" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <CompanyOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/register/company" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <CompanyOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/forgot-password/company" element={
        authVerified && token && user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <CompanyOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* ── Verificación de email ──────────────────────────────────────── */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* ── Dashboard (cualquier usuario autenticado) ──────────────────── */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <WelcomePage
            onLogout={() => navigate('/', { replace: true })}
            onEditProfile={() => navigate('/company/profile')}
            onGoToCVBuilder={() => navigate('/cv-builder')}
            onGoToAdmin={() => navigate('/admin')}
            onGoToOffers={() => navigate('/company/offers')}
            onGoToStudentOffers={() => navigate('/offers')}
            onNavigateToSimulator={() => navigate('/simulator')}
            onGoToSimulatorHistory={() => navigate('/simulator/history')}
          />
        </PrivateRoute>
      } />

      {/* ── Simulador de entrevistas (protegido) ───────────────────────── */}
      <Route path="/simulator" element={
        <PrivateRoute>
          <div>
            <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Volver al inicio
              </button>
              <span className="text-sm font-semibold text-emerald-700">Simulador de Entrevistas</span>
              <button
                onClick={() => navigate('/simulator/history')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Historial
              </button>
            </nav>
            <InterviewSimulatorPage />
          </div>
        </PrivateRoute>
      } />

      {/* ── Historial de simulaciones (protegido, solo student) ────────── */}
      <Route path="/simulator/history" element={
        <StudentRoute>
          <SimulationHistoryPage />
        </StudentRoute>
      } />

      {/* ── CV Builder (protegido, solo student) ──────────────────────── */}
      <Route path="/cv-builder" element={
        <StudentRoute>
          <CVBuilderPage />
        </StudentRoute>
      } />

      {/* ── Ofertas (protegido, solo student) ─────────────────────────── */}
      <Route path="/offers" element={
        <StudentRoute>
          <StudentOffersPage />
        </StudentRoute>
      } />

      {/* ── Mis postulaciones (protegido, solo student) ────────────────── */}
      <Route path="/my-applications" element={
        <StudentRoute>
          <MyApplicationsPage />
        </StudentRoute>
      } />

      {/* ── Alertas (protegido, solo student) ─────────────────────────── */}
      <Route path="/alert-settings" element={
        <StudentRoute>
          <AlertSettingsPage />
        </StudentRoute>
      } />

      {/* ── Empresas seguidas (protegido, solo student) ────────────────── */}
      <Route path="/followed-companies" element={
        <StudentRoute>
          <FollowedCompaniesPage />
        </StudentRoute>
      } />

            {/* ── Feed personalizado de empresas seguidas (HU-22) ───────── */}
      <Route path="/company-feed" element={
        <StudentRoute>
          <CompanyFeedPage />
        </StudentRoute>
      } />

{/* ── Historial de alertas (protegido, solo student) ─────────────── */}
      <Route path="/alert-history" element={
        <StudentRoute>
          <AlertHistoryPage />
        </StudentRoute>
      } />

      {/* ── Perfil empresa (protegido, solo company) ───────────────────── */}
      <Route path="/company/profile" element={
        <CompanyRoute>
          <CompanyProfilePage onBack={() => navigate('/dashboard')} />
        </CompanyRoute>
      } />

      {/* ── Panel de administración (protegido, solo admin) ────────────── */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />

      {/* ── Gestión de ofertas (protegido, solo company) ───────────────── */}
      <Route path="/company/offers" element={
        <CompanyRoute>
          <CompanyOffersPage
            onBack={() => navigate('/dashboard')}
            onCreateOffer={() => navigate('/company/offers/new')}
            onEditOffer={(offer) => navigate('/company/offers/edit', { state: { offer } })}
          />
        </CompanyRoute>
      } />

      {/* Crear oferta — estático antes que dinámico */}
      <Route path="/company/offers/new" element={
        <CompanyRoute>
          <CreateOfferPage
            onBack={() => navigate('/company/offers')}
            onSuccess={() => navigate('/company/offers')}
          />
        </CompanyRoute>
      } />

      {/* Editar oferta */}
      <Route path="/company/offers/edit" element={
        <CompanyRoute>
          <CreateOfferPage
            onBack={() => navigate('/company/offers')}
            onSuccess={() => navigate('/company/offers')}
          />
        </CompanyRoute>
      } />

      {/* Gestión de candidatos */}
      <Route path="/company/candidates" element={
        <CompanyRoute>
          <CompanyCandidatesPage />
        </CompanyRoute>
      } />

      {/* Ver candidatos de una oferta */}
      <Route path="/company/offers/:offerId/candidates" element={
        <CompanyRoute>
          <OfferCandidatesPage />
        </CompanyRoute>
      } />

      {/* ── Bandeja de mensajes (HU-25) ───────────────────────────── */}
      <Route path="/inbox" element={
        <PrivateRoute>
          <InboxPage />
        </PrivateRoute>
      } />
      <Route path="/inbox/:userId" element={
        <PrivateRoute>
          <InboxPage />
        </PrivateRoute>
      } />

            {/* ── Fallback ────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
