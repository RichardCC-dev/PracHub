import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { sanitizePayload } from '../utils/security';

const LoginForm = ({ onForgotPassword, onGoToRegister, onLoginSuccess }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setSuccessMessage('');
    const result = await login(sanitizePayload(values), rememberMe);
    setSuccessMessage(`${result.message} Redirigiendo a tu panel...`);
    setTimeout(() => onLoginSuccess(result.user), 800);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Acceso</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa con el correo y contraseña de tu cuenta PracHub.
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

      <label className="block space-y-2 text-sm font-medium text-gray-700">
        <span>Correo electrónico</span>
        <input
          type="email"
          autoComplete="email"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
          {...register('email', {
            required: 'Ingresa tu correo.',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Correo inválido.' },
          })}
        />
        {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
      </label>

      <label className="block space-y-2 text-sm font-medium text-gray-700">
        <span>Contraseña</span>
        <input
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
          {...register('password', { required: 'Ingresa tu contraseña.' })}
        />
        {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
      </label>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-emerald-700 accent-emerald-700 cursor-pointer"
        />
        <span className="text-sm text-gray-600">Mantener sesión iniciada</span>
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? 'Verificando...' : 'Iniciar sesión'}
      </button>

      <button
        type="button"
        onClick={onForgotPassword}
        className="w-full text-sm font-semibold text-emerald-800 transition hover:text-emerald-700"
      >
        ¿Olvidaste tu contraseña?
      </button>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="mx-4 text-xs text-gray-400">¿No tienes cuenta?</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <button
        type="button"
        onClick={onGoToRegister}
        className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
      >
        Crear cuenta
      </button>
    </form>
  );
};

export default LoginForm;
