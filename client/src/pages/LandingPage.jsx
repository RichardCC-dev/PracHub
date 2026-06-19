import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Bot,
  Sparkles,
  MessageSquare,
  Bell,
  Building2,
  Rss,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const STUDENT_FEATURES = [
  { icon: FileText, title: 'Construye tu CV con IA', desc: 'Crea y mejora tu hoja de vida con sugerencias inteligentes en tiempo real.' },
  { icon: Sparkles, title: 'Recomendaciones con IA', desc: 'Recibe prácticas compatibles con tu perfil mediante nuestro motor de matching.' },
  { icon: Briefcase, title: 'Bolsa de prácticas', desc: 'Explora ofertas con filtros avanzados y postula en pocos clics.' },
  { icon: Bot, title: 'Simulador de entrevistas', desc: 'Entrena entrevistas técnicas y de RR. HH. con retroalimentación de IA.' },
  { icon: Bell, title: 'Alertas inteligentes', desc: 'Entérate al instante cuando aparezca una oferta compatible contigo.' },
  { icon: Rss, title: 'Feed de empresas', desc: 'Sigue a tus empresas favoritas y mira sus últimas ofertas.' },
];

const COMPANY_FEATURES = [
  { icon: Building2, title: 'Perfil de empresa', desc: 'Muestra tu cultura y atrae al mejor talento joven.' },
  { icon: Briefcase, title: 'Publica y gestiona ofertas', desc: 'Crea ofertas y revisa a tus candidatos en un solo lugar.' },
  { icon: MessageSquare, title: 'Contacta candidatos', desc: 'Comunícate directamente con los postulantes de tus ofertas.' },
];

const STATS = [
  { value: '200+', label: 'Empresas' },
  { value: '5 000+', label: 'Estudiantes' },
  { value: '1 200+', label: 'Prácticas activas' },
  { value: '95%', label: 'Match con IA' },
];

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
      <Icon className="h-6 w-6" />
    </span>
    <h3 className="mt-4 font-bold text-gray-950">{title}</h3>
    <p className="mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const goAccess = () => navigate('/acceder');

  return (
    <main className="min-h-screen bg-white">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 text-base font-black text-white">P</span>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-900">PracHub</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goAccess} className="rounded-xl px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50">
              Iniciar sesión
            </button>
            <button onClick={goAccess} className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Crear cuenta
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-emerald-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Talento joven · Prácticas profesionales
            </p>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              Conecta tu talento con prácticas profesionales reales.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-emerald-50/75">
              Construye tu CV con IA, practica entrevistas, recibe recomendaciones inteligentes y postula a las mejores empresas desde una sola plataforma.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={goAccess} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-50">
                Empezar ahora <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={goAccess} className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Ya tengo cuenta
              </button>
            </div>
          </div>

          {/* Métricas en cajas redondeadas con números en negrita */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur">
                <p className="text-3xl font-extrabold text-emerald-300">{s.value}</p>
                <p className="mt-1 text-xs text-emerald-100/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades para estudiantes */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-950">Todo lo que necesitas para conseguir tu práctica</h2>
          <p className="mt-2 text-gray-500">Herramientas pensadas para estudiantes que buscan su primera experiencia profesional.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STUDENT_FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* Para empresas */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Para empresas</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">Encuentra a los mejores practicantes</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {COMPANY_FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <BarChart3 className="mx-auto mb-4 h-10 w-10 text-emerald-700" />
        <h2 className="text-3xl font-bold text-gray-950">¿Listo para dar el siguiente paso?</h2>
        <p className="mx-auto mt-2 max-w-lg text-gray-500">Crea tu cuenta gratis y empieza a construir tu futuro profesional hoy mismo.</p>
        <button onClick={goAccess} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-8 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">
          Crear mi cuenta <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} PracHub · Conectando talento con oportunidades.
      </footer>
    </main>
  );
};

export default LandingPage;
