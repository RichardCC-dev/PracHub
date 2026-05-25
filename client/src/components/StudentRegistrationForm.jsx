import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { sanitizePayload } from '../utils/security';

const StudentRegistrationForm = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const { registerStudent, isLoading, error } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      university: '',
      career: '',
      cycle: '',
      availability: '',
      phoneNumber: '',
    },
  });

  const passwordRules = [
    'Mínimo 8 caracteres.',
    'Al menos una letra mayúscula.',
    'Al menos una letra minúscula.',
    'Al menos un número.',
  ];

  const onSubmit = async (values) => {
    setSuccessMessage('');
    const payload = sanitizePayload(values);
    const result = await registerStudent(payload);
    setSuccessMessage(`${result.message} Ya puedes completar y revisar tu perfil básico.`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700"></p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Registro de estudiante</h1>
        <p className="mt-2 text-sm text-gray-600">Usa tu correo institucional para validar que perteneces a una universidad reconocida.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-gray-700">
          <span>Nombres</span>
          <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('firstName', { required: 'Ingresa tus nombres.' })} />
          {errors.firstName && <span className="text-xs text-red-600">{errors.firstName.message}</span>}
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700">
          <span>Apellidos</span>
          <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('lastName', { required: 'Ingresa tus apellidos.' })} />
          {errors.lastName && <span className="text-xs text-red-600">{errors.lastName.message}</span>}
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-gray-700">
        <span>Correo institucional</span>
        <input type="email" className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('email', { required: 'Ingresa tu correo institucional.' })} />
        {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
      </label>

      <label className="space-y-2 text-sm font-medium text-gray-700">
        <span>Contraseña</span>
        <input
          type="password"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
          {...register('password', {
            required: 'Ingresa una contraseña.',
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-gray-700">
          <span>Universidad</span>
          <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('university')} placeholder="Se autocompleta por dominio si la dejas vacía" />
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700">
          <span>Carrera</span>
          <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('career', { required: 'Ingresa tu carrera.' })} />
          {errors.career && <span className="text-xs text-red-600">{errors.career.message}</span>}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-gray-700">
          <span>Ciclo</span>
          <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('cycle', { required: 'Ingresa tu ciclo.' })} />
          {errors.cycle && <span className="text-xs text-red-600">{errors.cycle.message}</span>}
        </label>

        <label className="space-y-2 text-sm font-medium text-gray-700 md:col-span-2">
          <span>Disponibilidad</span>
          <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('availability', { required: 'Ingresa tu disponibilidad.' })} placeholder="Ej. Medio tiempo, remoto, mañanas" />
          {errors.availability && <span className="text-xs text-red-600">{errors.availability.message}</span>}
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-gray-700">
        <span>Teléfono opcional</span>
        <input className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700" {...register('phoneNumber')} />
      </label>

      <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
        {isLoading ? 'Validando registro...' : 'Crear cuenta estudiantil'}
      </button>

      <button type="button" className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50">
        Registrarse con Google próximamente
      </button>
    </form>
  );
};

export default StudentRegistrationForm;
