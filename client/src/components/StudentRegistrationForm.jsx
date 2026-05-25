import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { sanitizePayload } from '../utils/security';

const STEP_LABELS = ['Cuenta', 'Perfil académico'];

const passwordRules = [
  { id: 'len', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'Una mayúscula', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Una minúscula', test: (v) => /[a-z]/.test(v) },
  { id: 'num', label: 'Un número', test: (v) => /\d/.test(v) },
];

const FieldError = ({ error }) =>
  error ? <span className="mt-1 block text-xs text-red-600">{error.message}</span> : null;

const inputCls = 'w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700 transition';

const StudentRegistrationForm = ({ onForgotPassword, onGoToLogin, onLoginSuccess }) => {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { registerStudent, isLoading, error } = useAuthStore();

  const step1 = useForm({
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });

  const step2 = useForm({
    defaultValues: { university: '', career: '', cycle: '', availability: '', phoneNumber: '' },
  });

  const watchPassword = step1.watch('password', '');

  const onStep1Submit = (values) => {
    setStep1Data(values);
    setStep(2);
  };

  const onStep2Submit = async (values) => {
    setSuccessMessage('');
    const payload = sanitizePayload({ ...step1Data, ...values });
    const result = await registerStudent(payload);
    setSuccessMessage(`${result.message} Revisa tu correo y haz clic en el enlace de verificación para activar tu cuenta.`);
    setTimeout(onLoginSuccess, 2000);
  };

  return (
    <div className="space-y-5 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">

      {/* Indicador de pasos */}
      <div>
        <div className="flex items-center gap-3">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition
                    ${done ? 'bg-emerald-700 text-white' : active ? 'bg-emerald-950 text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  {done ? '✓' : n}
                </span>
                <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-px w-8 ${done ? 'bg-emerald-700' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          {step === 1 ? 'Crear cuenta' : 'Tu perfil académico'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === 1
            ? 'Paso 1 de 2 — Datos de acceso a tu cuenta.'
            : 'Paso 2 de 2 — Cuéntanos sobre tu formación y disponibilidad.'}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* ── PASO 1: Cuenta ─────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={step1.handleSubmit(onStep1Submit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium text-gray-700">
              <span>Nombres</span>
              <input
                className={inputCls}
                autoComplete="given-name"
                {...step1.register('firstName', { required: 'Ingresa tus nombres.' })}
              />
              <FieldError error={step1.formState.errors.firstName} />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-gray-700">
              <span>Apellidos</span>
              <input
                className={inputCls}
                autoComplete="family-name"
                {...step1.register('lastName', { required: 'Ingresa tus apellidos.' })}
              />
              <FieldError error={step1.formState.errors.lastName} />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-medium text-gray-700">
            <span>Correo electrónico</span>
            <input
              type="email"
              className={inputCls}
              autoComplete="email"
              placeholder="tu@universidad.edu.pe"
              {...step1.register('email', {
                required: 'Ingresa tu correo.',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Ingresa un correo válido.' },
              })}
            />
            <FieldError error={step1.formState.errors.email} />
          </label>

          <label className="block space-y-1.5 text-sm font-medium text-gray-700">
            <span>Contraseña</span>
            <input
              type="password"
              className={inputCls}
              autoComplete="new-password"
              {...step1.register('password', {
                required: 'Ingresa una contraseña.',
                validate: {
                  len: (v) => v.length >= 8 || 'Mínimo 8 caracteres.',
                  upper: (v) => /[A-Z]/.test(v) || 'Incluye una mayúscula.',
                  lower: (v) => /[a-z]/.test(v) || 'Incluye una minúscula.',
                  num: (v) => /\d/.test(v) || 'Incluye un número.',
                },
              })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {passwordRules.map(({ id, label, test }) => (
                <span
                  key={id}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition
                    ${watchPassword && test(watchPassword)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-400'}`}
                >
                  {watchPassword && test(watchPassword) ? '✓ ' : ''}{label}
                </span>
              ))}
            </div>
            <FieldError error={step1.formState.errors.password} />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            Continuar →
          </button>

          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-medium text-gray-400"
          >
            Continuar con Google (próximamente)
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={onForgotPassword}
              className="font-semibold text-emerald-800 hover:text-emerald-700"
            >
              ¿Olvidaste tu contraseña?
            </button>
            {onGoToLogin && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-semibold text-gray-500 hover:text-gray-700"
              >
                Ya tengo cuenta →
              </button>
            )}
          </div>
        </form>
      )}

      {/* ── PASO 2: Perfil académico ────────────────────────── */}
      {step === 2 && (
        <form onSubmit={step2.handleSubmit(onStep2Submit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1.5 text-sm font-medium text-gray-700 md:col-span-2">
              <span>Universidad</span>
              <input
                className={inputCls}
                placeholder="Se autodetecta por el dominio de tu correo"
                {...step2.register('university')}
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-gray-700 md:col-span-2">
              <span>Carrera profesional</span>
              <input
                className={inputCls}
                placeholder="Ej. Ingeniería de Sistemas, Administración..."
                {...step2.register('career', { required: 'Ingresa tu carrera.' })}
              />
              <FieldError error={step2.formState.errors.career} />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-gray-700">
              <span>Ciclo académico</span>
              <input
                className={inputCls}
                placeholder="Ej. 8, IX, 6to"
                {...step2.register('cycle', { required: 'Ingresa tu ciclo.' })}
              />
              <FieldError error={step2.formState.errors.cycle} />
            </label>

            <label className="block space-y-1.5 text-sm font-medium text-gray-700">
              <span>Teléfono (opcional)</span>
              <input
                className={inputCls}
                type="tel"
                placeholder="+51 999 999 999"
                {...step2.register('phoneNumber')}
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-medium text-gray-700">
            <span>Disponibilidad</span>
            <select
              className={inputCls}
              {...step2.register('availability', { required: 'Selecciona tu disponibilidad.' })}
            >
              <option value="">Selecciona una opción...</option>
              <option value="Tiempo completo">Tiempo completo</option>
              <option value="Medio tiempo - mañanas">Medio tiempo — mañanas</option>
              <option value="Medio tiempo - tardes">Medio tiempo — tardes</option>
              <option value="Fines de semana">Fines de semana</option>
              <option value="Remoto flexible">Remoto flexible</option>
            </select>
            <FieldError error={step2.formState.errors.availability} />
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentRegistrationForm;
