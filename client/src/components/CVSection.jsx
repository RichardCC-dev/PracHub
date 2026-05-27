import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CVSuggestion from './CVSuggestion';
import ExperienceSection from './ExperienceSection';
import ProjectsSection from './ProjectsSection';
import CertificationsSection from './CertificationsSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import useCVStore from '../store/cvStore';

const fieldLabels = {
  summary: 'Resumen profesional',
  fullName: 'Nombre completo',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  linkedin: 'LinkedIn',
  degree: 'Título',
  institution: 'Institución',
  startDate: 'Fecha de inicio',
  endDate: 'Fecha de fin',
  courses: 'Cursos relevantes',
  company: 'Empresa',
  role: 'Rol',
  description: 'Descripción',
  technical: 'Habilidades técnicas',
  soft: 'Habilidades blandas',
  list: 'Idiomas',
  title: 'Título del proyecto',
};

const TEXTAREA_FIELDS = ['summary', 'description', 'courses', 'technical', 'soft', 'list'];
const AI_SECTIONS = ['profile', 'experience', 'projects', 'skills'];

const safeParseData = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return {}; }
  }
  return data;
};

const CVSectionForm = ({ section, title, fields, data }) => {
  const { updateSection, requestSectionSuggestion, acceptSectionSuggestion, clearSuggestion, suggestion, isLoading, activeSection } = useCVStore();
  const { register, handleSubmit, setValue, reset } = useForm({ defaultValues: data });

  // Resetear valores del formulario cuando cambian los datos externos (ej: restaurar versión)
  const dataKey = JSON.stringify(data);
  useEffect(() => {
    reset(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, reset]);

  const onSubmit = async (values) => {
    await updateSection(section, values);
  };

  const handleRequestSectionSuggestion = async () => {
    await requestSectionSuggestion(section);
  };

  const handleAcceptSuggestion = async () => {
    if (suggestion) {
      Object.entries(suggestion.improved).forEach(([field, value]) => {
        setValue(field, value);
      });
      await acceptSectionSuggestion(section);
      handleSubmit(onSubmit)();
      clearSuggestion();
    }
  };

  const handleDiscardSuggestion = () => {
    clearSuggestion();
  };

  const hasContent = fields.some(field => data[field] && data[field].trim() !== '');
  const showSuggestion = activeSection === section && suggestion;
  const shouldShowAIButton = AI_SECTIONS.includes(section);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md shadow-emerald-950/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-950">{title}</h2>
        {shouldShowAIButton && (
          <button
            type="button"
            onClick={handleRequestSectionSuggestion}
            disabled={isLoading || !hasContent}
            className="rounded-xl border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            {isLoading ? '...IA' : 'Mejorar con IA'}
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {fields.map((field) => (
          <div key={field} className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              {fieldLabels[field]}
            </label>
            {TEXTAREA_FIELDS.includes(field) ? (
              <textarea
                rows={field === 'summary' ? 4 : 3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 resize-none"
                {...register(field)}
                onBlur={handleSubmit(onSubmit)}
                placeholder={field === 'summary' ? 'Escribe un breve resumen de tu perfil profesional...' : field === 'courses' ? 'ej. Python para ciencia de datos, Gestión de proyectos...' : ''}
              />
            ) : (
              <input
                type={field.includes('email') ? 'email' : field.includes('Date') ? 'date' : 'text'}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
                {...register(field)}
                onBlur={handleSubmit(onSubmit)}
              />
            )}
          </div>
        ))}
      </form>
      {showSuggestion && (
        <div className="mt-6">
          <CVSuggestion
            original={formatSuggestionText(suggestion.original)}
            improved={formatSuggestionText(suggestion.improved)}
            onAccept={handleAcceptSuggestion}
            onDiscard={handleDiscardSuggestion}
          />
        </div>
      )}
    </div>
  );
};

const formatSuggestionText = (data) => {
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data !== null) {
    const fieldLabels = {
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      linkedin: 'LinkedIn',
      degree: 'Título',
      institution: 'Institución',
      startDate: 'Fecha de inicio',
      endDate: 'Fecha de fin',
      company: 'Empresa',
      role: 'Rol',
      description: 'Descripción',
      technical: 'Habilidades técnicas',
      soft: 'Habilidades blandas',
      list: 'Idiomas',
      title: 'Título del proyecto',
    };
    
    return Object.entries(data)
      .map(([key, value]) => `${fieldLabels[key] || key}: ${value}`)
      .join('\n\n');
  }
  return String(data);
};

const CVSection = ({ section, title, fields, data: rawData, isExperience, isProjects, isProfile, isCertifications, isEducation }) => {
  const data = safeParseData(rawData);

  if (isEducation) return <EducationSection section={section} title={title} data={data} />;
  if (isExperience) return <ExperienceSection section={section} title={title} data={data} />;
  if (isProjects) return <ProjectsSection section={section} title={title} data={data} />;
  if (isCertifications) return <CertificationsSection section={section} title={title} data={data} />;
  if (section === 'skills') return <SkillsSection section={section} title={title} data={data} />;

  return <CVSectionForm section={section} title={title} fields={fields} data={data} />;
};

export default CVSection;
