import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Building2, Clock, Phone, Mail, FileText } from 'lucide-react';
import useAuthStore from '../store/authStore';

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
  const { user } = useAuthStore();
  const s = user?.studentProfile || {};
  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Estudiante';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Encabezado */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-emerald-950 p-6 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold">
          {s.firstName?.charAt(0) || <User className="h-7 w-7" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-emerald-200/80">{s.career || 'Estudiante'}</p>
        </div>
      </div>

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
    </div>
  );
};

export default StudentProfilePage;
