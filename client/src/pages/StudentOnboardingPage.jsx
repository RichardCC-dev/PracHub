import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import LoginForm from '../components/LoginForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import StudentRegistrationForm from '../components/StudentRegistrationForm';

const ASIDE_COPY = {
  login: {
    headline: 'Tu próxima práctica profesional te está esperando.',
    sub: 'Inicia sesión para acceder a tu dashboard, revisar tus postulaciones y seguir entrenando con IA.',
  },
  register: {
    headline: 'PracHub conecta tu talento con prácticas reales.',
    sub: 'Regístrate con tu correo universitario y construye un perfil profesional que destaque ante las mejores empresas.',
  },
  forgot: {
    headline: 'Recupera el acceso a tu cuenta.',
    sub: 'Te enviaremos un enlace de un solo uso válido por 30 minutos al correo que registraste.',
  },
  reset: {
    headline: 'Crea una nueva contraseña segura.',
    sub: 'Este enlace es de un solo uso. Tu historial de CV, simulaciones y postulaciones sigue intacto.',
  },
};

const ROUTE_TO_VIEW = {
  '/login': 'login',
  '/register/student': 'register',
  '/forgot-password': 'forgot',
  '/reset-password': 'reset',
};

const StudentOnboardingPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = useMemo(() => new URLSearchParams(window.location.search).get('token'), []);

  const view = ROUTE_TO_VIEW[location.pathname] || 'login';
  const copy = ASIDE_COPY[view] || ASIDE_COPY.login;

  const formByView = {
    login: (
      <LoginForm
        onForgotPassword={() => navigate('/forgot-password')}
        onGoToRegister={() => navigate('/register/student')}
        onLoginSuccess={onLoginSuccess}
      />
    ),
    register: (
      <StudentRegistrationForm
        onForgotPassword={() => navigate('/forgot-password')}
        onGoToLogin={() => navigate('/login')}
        onLoginSuccess={onLoginSuccess}
      />
    ),
    forgot: <ForgotPasswordForm onBackToRegister={() => navigate(-1)} />,
    reset: <ResetPasswordForm token={resetToken} onBackToRegister={() => navigate('/login')} />,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">

        <aside className="hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-950 transition hover:bg-emerald-50"
              title="Volver al inicio"
            >
              P
            </button>
            <h2 className="mt-10 text-4xl font-bold leading-tight lg:text-5xl">{copy.headline}</h2>
            <p className="mt-6 max-w-md text-lg text-emerald-50/80">{copy.sub}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Acceso seguro</p>
            <p className="mt-3 text-xl font-semibold">JWT 24 h · Bcrypt · Enlace de recuperación de un solo uso.</p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-xl">
            {formByView[view]}
          </div>
        </div>

      </section>
    </main>
  );
};

export default StudentOnboardingPage;
