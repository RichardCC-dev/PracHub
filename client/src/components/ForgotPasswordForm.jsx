import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { sanitizePayload } from '../utils/security';

const ForgotPasswordForm = ({ onBackToRegister }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const { requestPasswordReset, isLoading, error } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values) => {
    setSuccessMessage('');
    const result = await requestPasswordReset(sanitizePayload(values));
    setSuccessMessage(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Recuperación</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-gray-600">Ingresa tu correo y te enviaremos un enlace válido por 30 minutos si existe una cuenta asociada.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>}

      <label className="space-y-2 text-sm font-medium text-gray-700">
        <span>Correo registrado</span>
        <input type="email" className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('email', { required: 'Ingresa tu correo.', pattern: { value: /\S+@\S+\.\S+/, message: 'Ingresa un correo válido.' } })} />
        {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
      </label>

      <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
        {isLoading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
      </button>

      <button type="button" onClick={onBackToRegister} className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50">
        Volver al registro
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
