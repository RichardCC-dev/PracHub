import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { sanitizePayload } from '../utils/security';

const ResetPasswordForm = ({ token, onBackToRegister }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const { resetPassword, isLoading, error } = useAuthStore();
  const passwordRules = [
    'Mínimo 8 caracteres.',
    'Al menos una letra mayúscula.',
    'Al menos una letra minúscula.',
    'Al menos un número.',
  ];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setSuccessMessage('');
    const result = await resetPassword(sanitizePayload({ ...values, token }));
    setSuccessMessage(`${result.message} Ya puedes continuar en PracHub.`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Nueva contraseña</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Restablecer acceso</h1>
        <p className="mt-2 text-sm text-gray-600">Crea una nueva contraseña segura para tu cuenta. Este enlace solo se puede usar una vez.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>}

      <label className="space-y-2 text-sm font-medium text-gray-700">
        <span>Nueva contraseña</span>
        <input
          type="password"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
          {...register('password', {
            required: 'Ingresa una nueva contraseña.',
            validate: {
              minLength: (value) => value.length >= 8 || 'La contraseña debe tener mínimo 8 caracteres.',
              uppercase: (value) => /[A-Z]/.test(value) || 'La contraseña debe incluir al menos una mayúscula.',
              lowercase: (value) => /[a-z]/.test(value) || 'La contraseña debe incluir al menos una minúscula.',
              number: (value) => /\d/.test(value) || 'La contraseña debe incluir al menos un número.',
            },
          })}
        />
        <div className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <p className="font-semibold text-gray-700">La contraseña debe cumplir:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {passwordRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
        {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
      </label>

      <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
        {isLoading ? 'Actualizando contraseña...' : 'Actualizar contraseña'}
      </button>

      <button type="button" onClick={onBackToRegister} className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50">
        Volver al registro
      </button>
    </form>
  );
};

export default ResetPasswordForm;
