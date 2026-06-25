import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';

// ── Route guards ─────────────────────────────────────────────────────────────
import PrivateRoute from './components/routing/PrivateRoute';
import CompanyRoute from './components/routing/CompanyRoute';
import AdminRoute from './components/routing/AdminRoute';
import StudentRoute from './components/routing/StudentRoute';
import LoadingSpinner from './components/routing/LoadingSpinner';
import AppShell from './components/layout/AppShell';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const LandingPage             = lazy(() => import('./pages/LandingPage'));
const HomePage                = lazy(() => import('./pages/HomePage'));
const StudentOnboardingPage   = lazy(() => import('./pages/StudentOnboardingPage'));
const CompanyOnboardingPage   = lazy(() => import('./pages/CompanyOnboardingPage'));
const WelcomePage             = lazy(() => import('./pages/WelcomePage'));
const StudentProfilePage      = lazy(() => import('./pages/StudentProfilePage'));
const CompanyProfilePage      = lazy(() => import('./pages/CompanyProfilePage'));
const InterviewSimulatorPage  = lazy(() => import('./pages/InterviewSimulatorPage'));
const SimulationHistoryPage   = lazy(() => import('./pages/SimulationHistoryPage'));
const CVBuilderPage           = lazy(() => import('./pages/CVBuilderPage'));
const AdminDashboardPage      = lazy(() => import('./pages/AdminDashboardPage'));
const CompanyOffersPage       = lazy(() => import('./pages/CompanyOffersPage'));
const CreateOfferPage         = lazy(() => import('./pages/CreateOfferPage'));
const StudentOffersPage       = lazy(() => import('./pages/StudentOffersPage'));
const OfferDetailPage         = lazy(() => import('./pages/OfferDetailPage'));
const MyApplicationsPage      = lazy(() => import('./pages/MyApplicationsPage'));
const OfferCandidatesPage     = lazy(() => import('./pages/OfferCandidatesPage'));
const AlertSettingsPage       = lazy(() => import('./pages/AlertSettingsPage'));
const FollowedCompaniesPage   = lazy(() => import('./pages/FollowedCompaniesPage'));
const AlertHistoryPage        = lazy(() => import('./pages/AlertHistoryPage'));
const AdminLoginPage          = lazy(() => import('./pages/AdminLoginPage'));
const VerifyEmailPage         = lazy(() => import('./pages/VerifyEmailPage'));
const CompanyFeedPage         = lazy(() => import('./pages/CompanyFeedPage'));
const InboxPage               = lazy(() => import('./pages/InboxPage'));
const CompanyMetricsPage      = lazy(() => import('./pages/CompanyMetricsPage'));

// ── Fallback de Suspense ──────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500">Cargando...</p>
    </div>
  </div>
);

// Layout autenticado: aplica el guard + el AppShell (sidebar, barra superior, etc.)
const ShellLayout = () => (
  <PrivateRoute>
    <AppShell>
      <Outlet />
    </AppShell>
  </PrivateRoute>
);

const StudentOnly = () => (
  <StudentRoute>
    <Outlet />
  </StudentRoute>
);

const CompanyOnly = () => (
  <CompanyRoute>
    <Outlet />
  </CompanyRoute>
);

// ── Árbol de rutas ────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { token, user, isInitialized, isLoading, authVerified } = useAuthStore();
  const navigate = useNavigate();

  if (!isInitialized || isLoading || (token && !authVerified)) {
    return <LoadingSpinner />;
  }

  const authed = authVerified && token && user;
  const homeFor = (u) => (u?.role === 'admin' ? '/admin' : '/dashboard');

  return (
    <Routes>
      {/* ── Landing pública ───────────────────────────────────────────── */}
      <Route path="/" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <LandingPage />
      } />

      {/* ── Pantalla de acceso (selección estudiante/empresa) ──────────── */}
      <Route path="/acceder" element={
        authed
          ? <Navigate to={homeFor(user)} replace />
          : <HomePage
              onLoginStudent={() => navigate('/login/student')}
              onLoginCompany={() => navigate('/login/company')}
              onRegisterStudent={() => navigate('/register/student')}
              onRegisterCompany={() => navigate('/register/company')}
            />
      } />

      {/* Redirecciones legacy */}
      <Route path="/login" element={<Navigate to="/login/student" replace />} />

      {/* ── Auth: login admin ──────────────────────────────────────────── */}
      <Route path="/login/admin" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <AdminLoginPage />
      } />

      {/* ── Auth: estudiante ───────────────────────────────────────────── */}
      <Route path="/login/student" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/register/student" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/forgot-password" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/reset-password" element={
        <StudentOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* ── Auth: empresa ──────────────────────────────────────────────── */}
      <Route path="/login/company" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <CompanyOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/register/company" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <CompanyOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />
      <Route path="/forgot-password/company" element={
        authed ? <Navigate to={homeFor(user)} replace /> : <CompanyOnboardingPage onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
      } />

      {/* ── Verificación de email ──────────────────────────────────────── */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* ── Vistas autenticadas (con AppShell) ─────────────────────────── */}
      <Route element={<ShellLayout />}>
        <Route path="/dashboard" element={<WelcomePage />} />

        {/* Compartido: estudiante + empresa (no admin) */}
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/inbox/:userId" element={<InboxPage />} />

        {/* Solo estudiante */}
        <Route element={<StudentOnly />}>
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/offers" element={<StudentOffersPage />} />
          <Route path="/offers/:offerId" element={<OfferDetailPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/cv-builder" element={<CVBuilderPage />} />
          <Route path="/simulator" element={<InterviewSimulatorPage />} />
          <Route path="/simulator/history" element={<SimulationHistoryPage />} />
          <Route path="/followed-companies" element={<FollowedCompaniesPage />} />
          <Route path="/company-feed" element={<CompanyFeedPage />} />
          <Route path="/alert-settings" element={<AlertSettingsPage />} />
          <Route path="/alert-history" element={<AlertHistoryPage />} />
        </Route>

        {/* Solo empresa */}
        <Route element={<CompanyOnly />}>
          <Route path="/company/profile" element={<CompanyProfilePage />} />
          <Route path="/company/offers" element={<CompanyOffersPage />} />
          <Route path="/company/offers/new" element={<CreateOfferPage />} />
          <Route path="/company/offers/edit" element={<CreateOfferPage />} />
          <Route path="/company/offers/:offerId/candidates" element={<OfferCandidatesPage />} />
          <Route path="/company/metrics" element={<CompanyMetricsPage />} />
        </Route>
      </Route>

      {/* ── Panel de administración (AppShell propio) ──────────────────── */}
      <Route element={<AdminRoute><AppShell><Outlet /></AppShell></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

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
