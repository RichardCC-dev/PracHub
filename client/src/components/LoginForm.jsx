import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { loginUser } from '../services/api';
import { sanitizePayload } from '../utils/security';

const getRoleConfig = (role) => {
  if (role === 'company') return { icon: '🏢', accent: 'blue', label: 'Acceso Empresas', placeholder: 'tuempresa@ejemplo.com', subtitle: 'Ingresa con el correo corporativo y contraseña de tu empresa.' };
  if (role === 'admin') return { icon: '🔒', accent: 'purple', label: 'Acceso Administradores', placeholder: 'admin@prachub.com', subtitle: 'Ingresa con el correo y contraseña de administrador.' };
  return { icon: '🎓', accent: 'emerald', label: 'Acceso Estudiantes', placeholder: 'estudiante@universidad.edu.pe', subtitle: 'Ingresa con el correo universitario y contraseña de tu cuenta.' };
};

const LoginForm = ({ onForgotPassword, onGoToRegister, onLoginSuccess, role = 'student' }) => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [roleError, setRoleError] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const config = getRoleConfig(role);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '', adminSecret: '' } });

  const onSubmit = async (values) => {
    setSuccessMessage('');
    setRoleError(null);
    setLocalError(null);
    setIsLoading(true);

    try {
      const payload = { ...sanitizePayload(values), role };
      if (role === 'admin') {
        payload.adminSecret = values.adminSecret;
      }

      const result = await loginUser(payload);

      const userRole = result.user?.role;
      if (userRole !== role) {
        const roleNames = { student: 'estudiante', company: 'empresa', admin: 'administrador' };
        setRoleError(`No se encontró una cuenta de ${roleNames[role] || role} con estas credenciales.`);
        setIsLoading(false);
        return;
      }
      
      // Si el rol coincide, ahora sí guardar en el store
      const { saveSession } = useAuthStore.getState();
      saveSession(result.token, result.user, rememberMe);
      useAuthStore.setState({
        token: result.token,
        user: result.user,
        authVerified: true,
        isInitialized: true,
        isLoading: false,
      });
      
      setSuccessMessage(`${result.message} Redirigiendo a tu panel...`);
      onLoginSuccess(result.user);
    } catch (err) {
      setLocalError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{config.icon}</span>
          <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${role === 'company' ? 'text-blue-700' : role === 'admin' ? 'text-purple-700' : 'text-emerald-700'}`}>
            {config.label}
          </p>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-gray-600">{config.subtitle}</p>
      </div>

      {roleError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{roleError}</p>
          {role !== 'admin' && (
            <p className="mt-2 text-xs text-gray-600">
              ¿Tienes cuenta de {role === 'company' ? 'estudiante' : 'empresa'}?{' '}
              <button
                type="button"
                onClick={() => navigate(role === 'company' ? '/login/student' : '/login/company')}
                className={`font-semibold underline ${role === 'company' ? 'text-emerald-700 hover:text-emerald-600' : 'text-blue-700 hover:text-blue-600'}`}
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      )}
      {localError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
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
          placeholder={config.placeholder}
          className={`w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none ${role === 'company' ? 'focus:border-blue-700' : role === 'admin' ? 'focus:border-purple-700' : 'focus:border-emerald-700'}`}
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
          placeholder="Tu contraseña"
          className={`w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none ${role === 'company' ? 'focus:border-blue-700' : role === 'admin' ? 'focus:border-purple-700' : 'focus:border-emerald-700'}`}
          {...register('password', { required: 'Ingresa tu contraseña.' })}
        />
        {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
      </label>

      {role === 'admin' && (
        <label className="block space-y-2 text-sm font-medium text-gray-700">
          <span>Clave de acceso administrativo</span>
          <input
            type="password"
            placeholder="Clave maestra de administrador"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-700"
            {...register('adminSecret', { required: 'Ingresa la clave de acceso administrativo.' })}
          />
          {errors.adminSecret && <span className="text-xs text-red-600">{errors.adminSecret.message}</span>}
        </label>
      )}

      {role !== 'admin' && (
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-700 accent-emerald-700 cursor-pointer"
          />
          <span className="text-sm text-gray-600">Mantener sesión iniciada</span>
        </label>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full rounded-2xl px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${role === 'company' ? 'bg-blue-700 hover:bg-blue-600' : role === 'admin' ? 'bg-purple-800 hover:bg-purple-700' : 'bg-emerald-800 hover:bg-emerald-700'}`}
      >
        {isLoading ? 'Verificando...' : 'Iniciar sesión'}
      </button>

      {role !== 'admin' && (
        <>
          <button
            type="button"
            onClick={onForgotPassword}
            className={`w-full text-sm font-semibold transition ${role === 'company' ? 'text-blue-800 hover:text-blue-700' : 'text-emerald-800 hover:text-emerald-700'}`}
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
            className={`w-full rounded-2xl border px-5 py-3 font-semibold transition ${role === 'company' ? 'border-blue-800 text-blue-900 hover:bg-blue-50' : 'border-emerald-800 text-emerald-900 hover:bg-emerald-50'}`}
          >
            Crear cuenta
          </button>
        </>
      )}
    </form>
  );
};

export default LoginForm;
