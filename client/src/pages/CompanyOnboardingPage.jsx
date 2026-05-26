import { useMemo, useState } from 'react';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import LoginForm from '../components/LoginForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import CompanyRegistrationForm from '../components/CompanyRegistrationForm';

const ASIDE_COPY = {
  login: {
    headline: 'Encuentra el talento que tu empresa necesita.',
    sub: 'Inicia sesión para publicar ofertas de prácticas y conectar con estudiantes destacados de las mejores universidades.',
  },
  register: {
    headline: 'Registra tu empresa en PracHub.',
    sub: 'Publica ofertas de prácticas profesionales y accede a un pool de candidatos verificados con herramientas de IA.',
  },
  forgot: {
    headline: 'Recupera el acceso a tu cuenta.',
    sub: 'Te enviaremos un enlace de un solo uso válido por 30 minutos al correo que registraste.',
  },
  reset: {
    headline: 'Crea una nueva contraseña segura.',
    sub: 'Este enlace es de un solo uso. Tus ofertas publicadas y candidatos siguen intactos.',
  },
};

const CompanyOnboardingPage = ({ initialView = 'register', onGoHome, onLoginSuccess }) => {
  const resetToken = useMemo(() => new URLSearchParams(window.location.search).get('resetToken'), []);
  const [view, setView] = useState(resetToken ? 'reset' : initialView);

  const clearToken = () => window.history.replaceState({}, '', window.location.pathname);

  const goTo = (v) => { clearToken(); setView(v); };

  const copy = ASIDE_COPY[view] || ASIDE_COPY.register;

  const formByView = {
    login: (
      <LoginForm
        onForgotPassword={() => goTo('forgot')}
        onGoToRegister={() => goTo('register')}
        onLoginSuccess={onLoginSuccess}
      />
    ),
    register: (
      <CompanyRegistrationForm
        onGoToLogin={() => goTo('login')}
        onLoginSuccess={onLoginSuccess}
      />
    ),
    forgot: <ForgotPasswordForm onBackToRegister={() => goTo(initialView)} />,
    reset: <ResetPasswordForm token={resetToken} onBackToRegister={() => goTo('login')} />,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">

        <aside className="hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            {onGoHome ? (
              <button
                onClick={onGoHome}
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-950 transition hover:bg-emerald-50"
                title="Volver al inicio"
              >
                P
              </button>
            ) : (
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-950">P</div>
            )}
            <h2 className="mt-10 text-4xl font-bold leading-tight lg:text-5xl">{copy.headline}</h2>
            <p className="mt-6 max-w-md text-lg text-emerald-50/80">{copy.sub}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Portal de empresas</p>
            <p className="mt-3 text-xl font-semibold">Verificación legal de RUC · Publicación de ofertas · Gestión de candidatos</p>
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

export default CompanyOnboardingPage;
