import { useMemo, useState } from 'react';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import StudentRegistrationForm from '../components/StudentRegistrationForm';

const StudentOnboardingPage = () => {
  const resetToken = useMemo(() => new URLSearchParams(window.location.search).get('resetToken'), []);
  const [view, setView] = useState(resetToken ? 'reset' : 'register');

  const goToRegister = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setView('register');
  };

  const formByView = {
    register: <StudentRegistrationForm onForgotPassword={() => setView('forgot')} />,
    forgot: <ForgotPasswordForm onBackToRegister={goToRegister} />,
    reset: <ResetPasswordForm token={resetToken} onBackToRegister={goToRegister} />,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-950">P</div>
            <h2 className="mt-10 text-5xl font-bold leading-tight">PracHub conecta tu talento con prácticas reales.</h2>
            <p className="mt-6 max-w-md text-lg text-emerald-50/80">Regístrate, recupera tu acceso y gestiona tu perfil profesional con seguridad desde una sola plataforma.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Acceso seguro</p>
            <p className="mt-3 text-2xl font-semibold">JWT 24h, contraseñas con bcrypt y enlaces de recuperación de un solo uso.</p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-2xl">
            {formByView[view]}
          </div>
        </div>
      </section>
    </main>
  );
};

export default StudentOnboardingPage;
