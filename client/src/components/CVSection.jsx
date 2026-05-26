import { useForm } from 'react-hook-form';
import CVSuggestion from './CVSuggestion';
import ExperienceSection from './ExperienceSection';
import ProjectsSection from './ProjectsSection';
import useCVStore from '../store/cvStore';

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

const CVSection = ({ section, title, fields, data, isExperience, isProjects }) => {
  const { updateSection, requestSectionSuggestion, acceptSectionSuggestion, clearSuggestion, suggestion, isLoading, activeSection } = useCVStore();
  const { register, handleSubmit, setValue } = useForm({ defaultValues: data });

  // Si es la sección de experiencia, usar el componente especializado
  if (isExperience) {
    return <ExperienceSection section={section} title={title} data={data} />;
  }

  // Si es la sección de proyectos, usar el componente especializado
  if (isProjects) {
    return <ProjectsSection section={section} title={title} data={data} />;
  }

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
  const shouldShowAIButton = section !== 'personal';

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
        {shouldShowAIButton && (
          <button
            type="button"
            onClick={handleRequestSectionSuggestion}
            disabled={isLoading || !hasContent}
            className="rounded-2xl border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            {isLoading ? '...IA' : 'Mejorar sección con IA'}
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {fieldLabels[field]}
            </label>
            <input
              type={field.includes('email') ? 'email' : field.includes('Date') ? 'date' : 'text'}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-700"
              {...register(field)}
              onBlur={handleSubmit(onSubmit)}
            />
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

export default CVSection;
