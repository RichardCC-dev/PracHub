import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, GraduationCap, Building2, Clock, Phone, Mail, FileText, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { updateStudentProfile } from '../services/api';

const AVAILABILITY_OPTIONS = [
  'Tiempo completo',
  'Medio tiempo',
  'Fines de semana',
  'Por horas',
];

const Field = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 truncate font-semibold text-gray-900">{value || '—'}</p>
    </div>
  </div>
);

const StudentProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const s = user?.studentProfile || {};
  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Estudiante';

  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      university: s.university || '',
      career: s.career || '',
      cycle: s.cycle || '',
      availability: s.availability || '',
      bio: s.bio || '',
      phoneNumber: s.phoneNumber || '',
    },
  });

  const handleEdit = () => {
    setServerError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setServerError(null);
    reset();
  };

  const onSubmit = async (data) => {
    setServerError(null);
    setSaveSuccess(false);
    try {
      const result = await updateStudentProfile(data);
      // Actualizar el user en el store de auth
      const updatedUser = {
        ...user,
        studentProfile: result.studentProfile,
      };
      setUser(updatedUser);
      setSaveSuccess(true);
      setIsEditing(false);
      // Ocultar mensaje de éxito después de 3s
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setServerError(err.message || 'Error al actualizar el perfil.');
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Encabezado */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-emerald-950 p-6 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold">
          {s.firstName?.charAt(0) || <User className="h-7 w-7" />}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-emerald-200/80">{s.career || 'Estudiante'}</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Editar perfil
          </button>
        )}
      </div>

      {/* Mensaje de éxito */}
      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
          <Check className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">Perfil actualizado correctamente.</p>
        </div>
      )}

      {/* Error del servidor */}
      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* Modo vista */}
      {!isEditing && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field icon={Mail} label="Correo" value={user?.email} />
            <Field icon={GraduationCap} label="Carrera" value={s.career} />
            <Field icon={Building2} label="Universidad" value={s.university} />
            <Field icon={Clock} label="Ciclo" value={s.cycle} />
            <Field icon={Clock} label="Disponibilidad" value={s.availability} />
            <Field icon={Phone} label="Teléfono" value={s.phoneNumber} />
          </div>

          {s.bio && (
            <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Sobre mí</p>
              <p className="mt-1 text-sm text-gray-700">{s.bio}</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => navigate('/cv-builder')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <FileText className="h-4 w-4" />
              Ir a mi CV
            </button>
          </div>
        </>
      )}

      {/* Modo edición */}
      {isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Editar perfil</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div>
                <label className={labelClass}>Nombres</label>
                <input
                  type="text"
                  className={inputClass}
                  {...register('firstName', { required: 'Ingresa tus nombres' })}
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>

              {/* Apellidos */}
              <div>
                <label className={labelClass}>Apellidos</label>
                <input
                  type="text"
                  className={inputClass}
                  {...register('lastName', { required: 'Ingresa tus apellidos' })}
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
              </div>

              {/* Universidad */}
              <div>
                <label className={labelClass}>Universidad</label>
                <input
                  type="text"
                  className={inputClass}
                  {...register('university', { required: 'Ingresa tu universidad' })}
                />
                {errors.university && <p className="mt-1 text-xs text-red-600">{errors.university.message}</p>}
              </div>

              {/* Carrera */}
              <div>
                <label className={labelClass}>Carrera</label>
                <input
                  type="text"
                  className={inputClass}
                  {...register('career', { required: 'Ingresa tu carrera' })}
                />
                {errors.career && <p className="mt-1 text-xs text-red-600">{errors.career.message}</p>}
              </div>

              {/* Ciclo */}
              <div>
                <label className={labelClass}>Ciclo académico</label>
                <input
                  type="text"
                  placeholder="Ej. 5to ciclo, 8vo ciclo..."
                  className={inputClass}
                  {...register('cycle', { required: 'Ingresa tu ciclo' })}
                />
                {errors.cycle && <p className="mt-1 text-xs text-red-600">{errors.cycle.message}</p>}
              </div>

              {/* Disponibilidad */}
              <div>
                <label className={labelClass}>Disponibilidad</label>
                <select
                  className={inputClass}
                  {...register('availability', { required: 'Selecciona tu disponibilidad' })}
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.availability && <p className="mt-1 text-xs text-red-600">{errors.availability.message}</p>}
              </div>

              {/* Teléfono */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Teléfono <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="text"
                  placeholder="Ej. 999 888 777"
                  className={inputClass}
                  {...register('phoneNumber')}
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Sobre mí <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos brevemente sobre ti, tus intereses y objetivos profesionales..."
                  className={`${inputClass} resize-none`}
                  {...register('bio')}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentProfilePage;
